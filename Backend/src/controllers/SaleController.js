import { SaleService } from "../services/SaleService.js";
import { getStoreIdFromRequest } from "../utils/storeHelper.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"
import crypto from "crypto"
import razorpay from "../config/razorpay.js"
export const SaleController={
    list:async(req,resp)=>{
        try{
            const storeId = getStoreIdFromRequest(req);
            const result=await SaleService.list(storeId)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    checkoutSale:async(req,resp)=>{

        try {
            const storeId = getStoreIdFromRequest(req);
            const requiredFields = [
             "subtotal", "tax", "total","payment_method","cart"
            ];

            for (let field of requiredFields) {
              if (!req.body[field]) {
                return sendResponse(resp, false, 400, `${field} is required`);
              }
            }

            const {
              subtotal,
              tax,
              total,
              payment_method,
              cart,
              cash_amount,
              online_amount,
              online_method,
              customer_id,
              customer_name,
              customer_phone,
              customer_aadhaar
            } = req.body;

            if (!Array.isArray(cart) || cart.length === 0) {
              return sendResponse(resp, false, 400, "cart cannot be empty");
            }

            const invoice_no = await SaleService.generateInvoice();
              const userId = req.user.userId;

                  const saleData = {
                    invoice_no: invoice_no,
                    user_id:userId,
                     subtotal,
                     tax,
                     total,
                     payment_method,
                     payment_status:(payment_method === "cash" || payment_method === "aadhaar_customer") ? "paid" : "pending",
                     cash_amount: payment_method === "split" ? cash_amount : null,
                     online_amount: payment_method === "split" ? online_amount : null,
                     online_method: payment_method === "split" ? online_method : null,
                     customer_id: customer_id || null,
                     customer_name: customer_name || null,
                     customer_phone: customer_phone || null,
                     customer_aadhaar: customer_aadhaar || null
                  };
                  if (storeId) saleData.store_id = storeId;
            const saleId = await SaleService.createSale(saleData, storeId);
             
            if (!saleId) {
              return sendResponse(resp, false, 400, "Something went wrong");
            }
           
            for (const item of cart) {

              const itemData = {
                sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        tax: item.tax,
        qty: item.qty,
        image: item.image,
        total: item.price * item.qty
              };
         await SaleService.createSaleItem(itemData)
         await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: item.product_id,
            stock: item.qty,
            type:'debit',
            note:'Sale',
          }
        });
        }
        const getData = await CommonModel.getSingle({
          table: "hold_sales",
          conditions: { user_id: userId }
        });
        
        if (getData) {
        
          // 1️⃣ Delete items first
          await CommonModel.deleteData({
            table: "hold_sale_items",
            conditions: { hold_sale_id: getData.id }
          });
        
          // 2️⃣ Then delete hold sale
          await CommonModel.deleteData({
            table: "hold_sales",
            conditions: { id: getData.id }
          });
        }
        
        if (payment_method === "cash") {
          return sendResponse(resp, true, 201, "Sale completed successfully",saleData);
        }
        else if (payment_method === "split") {
          // For split payments, create Razorpay order only for online amount
          const orderAmount = online_method === "qr_code" ? online_amount : online_amount;
          const order = await razorpay.orders.create({
            amount: Math.round(orderAmount * 100),
            currency: "INR",
            receipt: `sale_${saleId}_split`,
          });
          const data={
            razorpayOrderId: order.id,
            saleId,
            amount: orderAmount,
            cash_amount,
            online_amount,
            online_method
          }
          const invoiceData={
            saleData,
            data
          }
          return sendResponse(resp, true, 201, "Split payment created successfully", invoiceData);
        }
        else{
        const order = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `sale_${saleId}`,
        });
        const data={
          razorpayOrderId: order.id,
            saleId,
            amount:total,
          }
          const invoiceData={
            saleData,
            data
          }
          return sendResponse(resp, true, 201, "Sale completed successfully",invoiceData);
      }
          } catch (error) {
            console.error("❌ Checkout Sale Error:", error);
            return sendResponse(
              resp,
              false,
              500,
              error.message || "Something wennt Wrong"
            );
          }
    },

    verifyPayment:async(req,resp)=>{
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        saleId,
        amount,
      } = req.body;
    
      const body = razorpay_order_id + "|" + razorpay_payment_id;
    
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
    
      if (expectedSignature !== razorpay_signature) {
        await CommonModel.rawQuery(`
          UPDATE sales SET payment_status='failed' WHERE id=?`,
          [saleId]
        );
        return sendResponse(resp,false,400,"No Data found")
      }
    
      // ✅ Mark Paid
      await CommonModel.rawQuery(`
        UPDATE sales SET payment_status='paid' WHERE id=?`,
        [saleId]
      );

      // Fetch payment details from Razorpay
      let paymentInfo = {};
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentInfo = {
          payment_method: payment.method || null,
          card_last4: payment.card?.last4 || null,
          card_network: payment.card?.network || null,
          card_type: payment.card?.type || null,
          card_issuer: payment.card?.issuer || null,
          vpa: payment.vpa || null,
          bank: payment.bank || null,
          wallet: payment.wallet || null,
          payer_email: payment.email || null,
          payer_contact: payment.contact || null,
        };
      } catch (err) {
        // Razorpay fetch failed — store without extra details
      }

      await CommonModel.rawQuery(
        `INSERT INTO payments
         (sale_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, payment_method, card_last4, card_network, card_type, card_issuer, vpa, bank, wallet, payer_email, payer_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          "paid",
          paymentInfo.payment_method || null,
          paymentInfo.card_last4 || null,
          paymentInfo.card_network || null,
          paymentInfo.card_type || null,
          paymentInfo.card_issuer || null,
          paymentInfo.vpa || null,
          paymentInfo.bank || null,
          paymentInfo.wallet || null,
          paymentInfo.payer_email || null,
          paymentInfo.payer_contact || null,
        ]
      );

     return sendResponse(resp,true,201,"Payment successful")
      
    },

    getSaleById: async (req, res) => {
        try {
          const { id } = req.params;
            if(!id)
            {
                return sendResponse(res,false,400,"id not found")
            }
          const sale = await SaleService.getSaleById(id);
      
          if (!sale) {
            return sendResponse(res, false, 404, "Sale not found");
          }
      
          const items = await CommonModel.rawQuery(
            `SELECT * FROM sales_items WHERE sale_id = ? AND is_returned IN ('no', 'partial')`,
            [id]
          );
      
          return sendResponse(res, true, 200, "Sale details", {
            sale,
            items
          });
      
        } catch (error) {
          return sendResponse(res, false, 500, error.message);
        }
      },


      saleReport:async(req,resp)=>{
        try{
            const storeId = getStoreIdFromRequest(req);
            const result=await SaleService.saleReport(storeId)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
      },

      findSale: async (req, res) => {
          try{
        const { invoice_no } = req.body;
      
        const sale = await SaleService.getSale(invoice_no);
        if (!sale) {
          return sendResponse(res, false, 404, "Sale not found");
        }
        if (!sale) return sendResponse(res,false,404,"Sale not found");
        const items = await CommonModel.getAllData({
            table: 'sales_items',
            conditions: { sale_id: sale.id }
          });
       
        return sendResponse(res,true,200,"Sale fetched",{ sale, items });
    }catch(error)
    {
       return  sendResponse(res,true,500,`${error.message}`);

    }
      },
     
      transactionList:async(req,resp)=>{
        try{
          const storeId = getStoreIdFromRequest(req);
            const result=await SaleService.transactionList(storeId)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    createQRPayment: async (req, resp) => {
        try {
            const storeId = getStoreIdFromRequest(req);
            const requiredFields = ["subtotal", "tax", "total", "cart"];

            for (let field of requiredFields) {
                if (!req.body[field]) {
                    return sendResponse(resp, false, 400, `${field} is required`);
                }
            }

            const {
                subtotal,
                tax,
                total,
                cart,
                payment_method,
                cash_amount,
                online_amount,
                online_method
            } = req.body;

            if (!Array.isArray(cart) || cart.length === 0) {
                return sendResponse(resp, false, 400, "cart cannot be empty");
            }

            const invoice_no = await SaleService.generateInvoice();
            const userId = req.user.userId;

            // Determine if this is a split payment or regular QR payment
            const isSplitPayment = payment_method === 'split' && cash_amount && online_amount;

            const saleData = {
                invoice_no: invoice_no,
                user_id: userId,
                subtotal,
                tax,
                total,
                payment_method: isSplitPayment ? 'split' : 'qr_code',
                payment_status: "pending",
                cash_amount: isSplitPayment ? cash_amount : null,
                online_amount: isSplitPayment ? online_amount : null,
                online_method: isSplitPayment ? 'qr_code' : null
            };
            if (storeId) saleData.store_id = storeId;

            const saleId = await SaleService.createSale(saleData, storeId);

            if (!saleId) {
                return sendResponse(resp, false, 400, "Something went wrong");
            }

            for (const item of cart) {
                const itemData = {
                    sale_id: saleId,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    price: item.price,
                    tax: item.tax,
                    qty: item.qty,
                    image: item.image,
                    total: item.price * item.qty
                };
                await SaleService.createSaleItem(itemData);
            }

            // For split payment, use online_amount; otherwise use total
            const paymentAmount = isSplitPayment ? online_amount : total;
            const amount = Number(paymentAmount).toFixed(2);

            // Create Razorpay order for QR/UPI payment (enables automatic refunds)
            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: `qr_${saleId}`,
            });

            // Also generate UPI Intent String for direct UPI scanning
            const upiId = process.env.UPI_ID || "merchant@upi";
            const merchantName = process.env.MERCHANT_NAME || "POS Store";
            const transactionNote = `Invoice ${invoice_no}`;
            const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

            return sendResponse(resp, true, 201, "QR Code created successfully", {
                qrCodeId: saleId.toString(),
                qrCodeUrl: upiString,
                razorpayOrderId: order.id,
                saleId,
                invoice_no,
                amount: Number(amount),
                saleData,
                upiId: upiId,
                isSplitPayment,
                cash_amount: isSplitPayment ? cash_amount : null,
                online_amount: isSplitPayment ? online_amount : null
            });

        } catch (error) {
            console.error("❌ QR Payment Error:", error);
            return sendResponse(resp, false, 500, error.message || "Something went wrong");
        }
    },

    checkQRPaymentStatus: async (req, resp) => {
        try {
            const { saleId } = req.body;

            if (!saleId) {
                return sendResponse(resp, false, 400, "saleId is required");
            }

            // Check current payment status from database
            const sale = await CommonModel.getSingle({
                table: 'sales',
                conditions: { id: saleId }
            });

            if (!sale) {
                return sendResponse(resp, false, 404, "Sale not found");
            }

            // If already paid, return success
            if (sale.payment_status === "paid") {
                return sendResponse(resp, true, 200, "Payment successful", {
                    status: "paid"
                });
            }

            // Return pending status
            return sendResponse(resp, true, 200, "Payment pending", {
                status: sale.payment_status
            });

        } catch (error) {
            console.error("❌ QR Payment Status Error:", error);
            return sendResponse(resp, false, 500, error.message || "Something went wrong");
        }
    },

    confirmQRPayment: async (req, resp) => {
        try {
            const { saleId, transactionId } = req.body;

            if (!saleId) {
                return sendResponse(resp, false, 400, "saleId is required");
            }

            // Try to get the real Razorpay payment ID from the order
            let realPaymentId = transactionId || `UPI_${Date.now()}`;
            let razorpayOrderId = null;

            // Try to find the Razorpay order and its captured payment
            try {
                const receipt = `qr_${saleId}`;
                const orders = await razorpay.orders.all({ receipt });
                if (orders.items && orders.items.length > 0) {
                    const order = orders.items[0];
                    razorpayOrderId = order.id;
                    const payments = await razorpay.orders.fetchPayments(order.id);
                    const capturedPayment = payments.items?.find(p => p.status === 'captured');
                    if (capturedPayment) {
                        realPaymentId = capturedPayment.id;
                    }
                }
            } catch (err) {
                // Razorpay lookup failed, use the provided transactionId
                console.log('Razorpay order lookup skipped:', err.message);
            }

            // Update sale status to paid
            await CommonModel.rawQuery(
                `UPDATE sales SET payment_status='paid' WHERE id=?`,
                [saleId]
            );

            // Record payment with real Razorpay payment ID if found
            await CommonModel.rawQuery(
                `INSERT INTO payments
                 (sale_id, razorpay_payment_id, razorpay_order_id, amount, status, payment_method)
                 SELECT id, ?, ?, total, 'paid', 'qr_code' FROM sales WHERE id = ?`,
                [realPaymentId, razorpayOrderId, saleId]
            );

            // Update stock
            const items = await CommonModel.getAllData({
                table: 'sales_items',
                conditions: { sale_id: saleId }
            });

            for (const item of items) {
                const stockExists = await CommonModel.rawQuery(
                    `SELECT * FROM stocks WHERE product_id = ? AND note = ? LIMIT 1`,
                    [item.product_id, `Sale - QR Payment - ${saleId}`]
                );

                if (!stockExists || stockExists.length === 0) {
                    await CommonModel.insertData({
                        table: "stocks",
                        data: {
                            product_id: item.product_id,
                            stock: item.qty,
                            type: 'debit',
                            note: `Sale - QR Payment - ${saleId}`,
                        }
                    });
                }
            }

            // Delete hold sales if any
            const userId = req.user.userId;
            const getData = await CommonModel.getSingle({
                table: "hold_sales",
                conditions: { user_id: userId }
            });

            if (getData) {
                await CommonModel.deleteData({
                    table: "hold_sale_items",
                    conditions: { hold_sale_id: getData.id }
                });

                await CommonModel.deleteData({
                    table: "hold_sales",
                    conditions: { id: getData.id }
                });
            }

            return sendResponse(resp, true, 200, "Payment confirmed successfully", {
                status: "paid"
            });

        } catch (error) {
            console.error("❌ Confirm QR Payment Error:", error);
            return sendResponse(resp, false, 500, error.message || "Something went wrong");
        }
    },

}