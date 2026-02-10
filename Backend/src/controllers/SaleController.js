import { SaleService } from "../services/SaleService.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"
import crypto from "crypto"
import razorpay from "../config/razorpay.js"
export const SaleController={
    list:async(req,resp)=>{
        try{
            const result=await SaleService.list()
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
              cart
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
                     payment_status:payment_method === "cash" ? "paid" : "pending"
                  };
            const saleId = await SaleService.createSale(saleData);
             
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
    
      await CommonModel.rawQuery(
        `INSERT INTO payments 
         (sale_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          "paid"
        ]
      );
     
     return sendResponse(resp,true,201,"Payment successful")
      
    },

    getSaleById: async (req, res) => {
        try {
          const { id } = req.params;
            if(!id)
            {
                return sendResponse(resp,false,400,"id not found")
            }
          const sale = await SaleService.getSaleById(id);
      
          if (!sale) {
            return sendResponse(res, false, 404, "Sale not found");
          }
      
          const items = await CommonModel.getAllData({
            table: 'sales_items',
            conditions: { sale_id: id,is_returned:'no' }
          });
      
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
            const result=await SaleService.saleReport()
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
            const result=await SaleService.transactionList()
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
            const requiredFields = ["subtotal", "tax", "total", "cart"];

            for (let field of requiredFields) {
                if (!req.body[field]) {
                    return sendResponse(resp, false, 400, `${field} is required`);
                }
            }

            const { subtotal, tax, total, cart } = req.body;

            if (!Array.isArray(cart) || cart.length === 0) {
                return sendResponse(resp, false, 400, "cart cannot be empty");
            }

            const invoice_no = await SaleService.generateInvoice();
            const userId = req.user.userId;

            const saleData = {
                invoice_no: invoice_no,
                user_id: userId,
                subtotal,
                tax,
                total,
                payment_method: "qr_code",
                payment_status: "pending"
            };

            const saleId = await SaleService.createSale(saleData);

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

            // Create Razorpay Payment Link (works in test mode)
            const paymentLink = await razorpay.paymentLink.create({
                amount: Math.round(total * 100),
                currency: "INR",
                description: `Payment for Invoice ${invoice_no}`,
                customer: {
                    name: "POS Customer",
                },
                notify: {
                    sms: false,
                    email: false
                },
                reminder_enable: false,
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pos`,
                callback_method: "get",
                notes: {
                    sale_id: saleId.toString(),
                    invoice_no: invoice_no
                }
            });

            return sendResponse(resp, true, 201, "QR Code created successfully", {
                qrCodeId: paymentLink.id,
                qrCodeUrl: paymentLink.short_url,
                saleId,
                invoice_no,
                amount: total,
                saleData
            });

        } catch (error) {
            console.error("❌ QR Payment Error:", error);
            return sendResponse(resp, false, 500, error.message || "Something went wrong");
        }
    },

    checkQRPaymentStatus: async (req, resp) => {
        try {
            const { qrCodeId, saleId } = req.body;

            if (!qrCodeId || !saleId) {
                return sendResponse(resp, false, 400, "qrCodeId and saleId are required");
            }

            // Fetch Payment Link details from Razorpay
            const paymentLink = await razorpay.paymentLink.fetch(qrCodeId);

            // Check if payment is received
            if (paymentLink.status === "paid") {
                // Update sale status
                await CommonModel.rawQuery(
                    `UPDATE sales SET payment_status='paid' WHERE id=?`,
                    [saleId]
                );

                // Get payment details from the payment link
                const payments = paymentLink.payments || [];
                if (payments.length > 0) {
                    const payment = payments[0];

                    // Check if payment record already exists
                    const existingPayment = await CommonModel.getSingle({
                        table: 'payments',
                        conditions: { sale_id: saleId }
                    });

                    if (!existingPayment) {
                        await CommonModel.rawQuery(
                            `INSERT INTO payments
                             (sale_id, razorpay_payment_id, amount, status, payment_method)
                             VALUES (?, ?, ?, ?, ?)`,
                            [saleId, payment.payment_id, paymentLink.amount_paid / 100, "paid", "qr_code"]
                        );
                    }
                }

                // Update stock after successful payment
                const items = await CommonModel.getAllData({
                    table: 'sales_items',
                    conditions: { sale_id: saleId }
                });

                for (const item of items) {
                    // Check if stock already updated
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

                return sendResponse(resp, true, 200, "Payment successful", {
                    status: "paid",
                    payment_id: payments.length > 0 ? payments[0].payment_id : null
                });
            }

            return sendResponse(resp, true, 200, "Payment pending", {
                status: paymentLink.status,
                amount_paid: paymentLink.amount_paid || 0
            });

        } catch (error) {
            console.error("❌ QR Payment Status Error:", error);
            return sendResponse(resp, false, 500, error.message || "Something went wrong");
        }
    },

}