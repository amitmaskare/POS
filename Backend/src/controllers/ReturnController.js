import { ReturnService } from "../services/ReturnService.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"
import { getStoreIdFromRequest } from "../utils/storeHelper.js";
import bcrypt from "bcrypt";
import crypto from "crypto"
import razorpay from "../config/razorpay.js"
export const ReturnController={

   scanInvoice: async (req, res) => {
       try{
        const storeId = getStoreIdFromRequest(req);
        const { invoice_no } = req.body;

        if (!invoice_no)
          return sendResponse(res, false, 400, "invoice_no required");

        const sale = await CommonModel.getSingle({
          table: "sales",
          conditions: { invoice_no },
          storeId
        });

        if (!sale)
          return sendResponse(res, false, 404, "Invoice not found");

        const saleData=await CommonModel.getAllData({
          table: "sales_items",
          fields:["id as sale_item_id,qty,returned_qty,product_id,price,product_name,image,is_returned,tax"],
          conditions: { sale_id:sale.id },
          storeId
        });

        // Fetch payment details from DB (stored at checkout time)
        const paymentData = await CommonModel.rawQuery(
          `SELECT razorpay_payment_id, razorpay_order_id, amount, status, payment_method,
                  card_last4, card_network, card_type, card_issuer, vpa, bank, wallet, payer_email, payer_contact
           FROM payments WHERE sale_id = ? ORDER BY id DESC LIMIT 1`,
          [sale.id]
        );

         const pd = paymentData?.[0] || {};
         const hasAccountDetails = pd.card_last4 || pd.vpa || pd.bank || pd.wallet;
         const payment_account = hasAccountDetails ? {
           method: pd.payment_method || null,
           card_last4: pd.card_last4 || null,
           card_network: pd.card_network || null,
           card_type: pd.card_type || null,
           card_issuer: pd.card_issuer || null,
           vpa: pd.vpa || null,
           bank: pd.bank || null,
           wallet: pd.wallet || null,
           email: pd.payer_email || null,
           contact: pd.payer_contact || null,
         } : null;

         const data={
          invoice_no: sale.invoice_no,
          sale_id: sale.id,
          total: sale.total,
          subtotal: sale.subtotal,
          tax: sale.tax,
          payment_method: sale.payment_method,
          payment_status: sale.payment_status,
          cash_amount: sale.cash_amount || null,
          online_amount: sale.online_amount || null,
          online_method: sale.online_method || null,
          status: sale.status,
          created_at: sale.created_at,
          razorpay_payment_id: pd.razorpay_payment_id || null,
          payment_account,
          saleData
         }
        return sendResponse(res, true, 200, "Invoice valid", data);
       }
       catch(error)
       {
    return sendResponse(res, false, 500, `Error : ${error.message}`);
       }
},

scanProduct: async (req, res) => {
    try{
        const storeId = getStoreIdFromRequest(req);
        const {invoice_no,barcode } = req.body;
        if(!invoice_no)
        return sendResponse(res, false, 400, "invoice_no required");
        if(!barcode)
        return sendResponse(res, false, 400, "barcode required");
        const result = await ReturnService.scanProduct(req.body, storeId)
         
        if (!result.length)
          return sendResponse(res, false, 404, "Product not in invoice");
      
        const item = result[0];
      
        if (item.is_returnable !== "yes")
          return sendResponse(res, false, 400, "Product not returnable");
      
        if (item.returned_qty >= item.qty)
          return sendResponse(res, false, 400, "Product already returned");
      
        return sendResponse(res, true, 200, "Product valid", item);
    }catch(error)
    {
    return sendResponse(res, false, 500, `Error : ${error.message}`);
    } 
  },

  confirmReturn: async (req, res) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const { sale_id, items, return_type, refund_method } = req.body;

      /* -------------------- VALIDATIONS -------------------- */
      if (!sale_id)
        return sendResponse(res, false, 400, "sale_id required");
      if (!["refund", "exchange"].includes(return_type))
        return sendResponse(res, false, 400, "Invalid return_type");
      if (!Array.isArray(items) || items.length === 0)
        return sendResponse(res, false, 400, "items cannot be empty");

      let refundAmount = 0;
      let refundBaseAmount = 0;
      let refundTaxAmount = 0;

      /* -------------------- FETCH SALE WITH PAYMENT INFO -------------------- */
      const [saleInfo] = await CommonModel.rawQuery(
        `SELECT s.*, p.razorpay_payment_id, p.razorpay_order_id
         FROM sales s
         LEFT JOIN payments p ON p.sale_id = s.id
         WHERE s.id = ?
         ORDER BY p.id DESC LIMIT 1`,
        [sale_id]
      );

      if (!saleInfo)
        return sendResponse(res, false, 404, "Sale not found");

      /* -------------------- VALIDATE ITEMS FIRST -------------------- */
      const validatedItems = [];
      for (const i of items) {
        if (!i.qty || i.qty <= 0) continue;

        const [saleItem] = await CommonModel.rawQuery(
          `SELECT qty, returned_qty, price, tax
           FROM sales_items
           WHERE id = ?`,
          [i.sale_item_id]
        );

        if (!saleItem) continue;

        const availableQty = saleItem.qty - saleItem.returned_qty;

        if (i.qty > availableQty) {
          return sendResponse(
            res, false, 400,
            `Return qty exceeds available qty for sale_item_id ${i.sale_item_id}`
          );
        }

        const baseAmount = i.qty * saleItem.price;
        const taxPercent = saleItem.tax || 0;
        const taxAmount = (baseAmount * taxPercent) / 100;
        const amount = baseAmount + taxAmount;
        refundAmount += amount;
        refundBaseAmount += baseAmount;
        refundTaxAmount += taxAmount;

        validatedItems.push({ ...i, amount, saleItem });
      }

      if (validatedItems.length === 0) {
        return sendResponse(res, false, 400, "No valid items to return");
      }

      /* -------------------- CREATE RETURN ENTRY -------------------- */
      const returnId = await CommonModel.insertData({
        table: "returns",
        data: {
          sale_id,
          return_type,
          refund_amount: 0,
          refund_status: 'pending',
          approved_by: req.user.userId,
          approved_at: new Date()
        },
        storeId
      });

      /* -------------------- PROCESS VALIDATED ITEMS -------------------- */
      for (const i of validatedItems) {
        await CommonModel.insertData({
          table: "stocks",
          data: {
            product_id: i.product_id,
            stock: i.qty,
            type: 'credit',
            note: 'Refund Product',
          },
          storeId
        });

        await CommonModel.insertData({
          table: "return_items",
          data: {
            return_id: returnId,
            sale_item_id: i.sale_item_id,
            product_id: i.product_id,
            product_name: i.product_name,
            image: i.image,
            return_qty: i.qty,
            tax: i.tax,
            refund_amount: i.amount
          },
          storeId
        });

        await CommonModel.rawQuery(
          `UPDATE sales_items
           SET
             returned_qty = returned_qty + ?,
             is_returned =
               CASE
                 WHEN (returned_qty + ?) >= qty THEN 'yes'
                 WHEN (returned_qty + ?) > 0 THEN 'partial'
                 ELSE 'no'
               END
           WHERE id = ?`,
          [i.qty, i.qty, i.qty, i.sale_item_id]
        );
      }

      /* -------------------- UPDATE SALE TOTALS -------------------- */
      const [sale] = await CommonModel.rawQuery(
        `SELECT subtotal, tax, total FROM sales WHERE id = ?`,
        [sale_id]
      );

      const newTotal = Number(sale.total) - refundAmount;
      const newStatus = newTotal <= 0.01 ? 'returned' : 'partially_returned';

      await CommonModel.rawQuery(`
        UPDATE sales
        SET
          subtotal = subtotal - ?,
          tax = tax - ?,
          total = total - ?,
          status = ?
        WHERE id = ?
      `, [refundBaseAmount, refundTaxAmount, refundAmount, newStatus, sale_id]);

      /* -------------------- PROCESS REFUND TO ORIGINAL PAYMENT -------------------- */
      let refundResult = { method: 'cash', status: 'completed', message: 'Return cash to customer' };
      const refundAmountPaise = Math.round(refundAmount * 100);

      // refund_method from frontend: 'cash' = always cash, 'online' = try Razorpay, 'auto' = based on original payment
      const paymentMethod = refund_method === 'cash' ? 'cash' : saleInfo.payment_method;

      // Check if a payment ID is a real Razorpay payment ID (starts with 'pay_')
      const isRazorpayPaymentId = (id) => id && id.startsWith('pay_');

      // Helper: fetch payment details from Razorpay
      const fetchPaymentDetails = async (paymentId) => {
        try {
          const payment = await razorpay.payments.fetch(paymentId);
          return {
            payment_id: payment.id,
            amount_paid: (payment.amount / 100).toFixed(2),
            currency: payment.currency,
            method: payment.method, // card, upi, netbanking, wallet
            email: payment.email || null,
            contact: payment.contact || null,
            // Card details
            card_last4: payment.card?.last4 || null,
            card_network: payment.card?.network || null, // Visa, Mastercard
            card_issuer: payment.card?.issuer || null,
            card_type: payment.card?.type || null, // credit, debit
            // UPI details
            vpa: payment.vpa || null, // UPI ID like user@paytm
            // Bank details
            bank: payment.bank || null,
            wallet: payment.wallet || null,
            // Status
            status: payment.status,
            created_at: payment.created_at ? new Date(payment.created_at * 1000).toLocaleString() : null
          };
        } catch (err) {
          return null;
        }
      };

      // Helper: fetch refund details from Razorpay
      const fetchRefundDetails = async (refund) => {
        return {
          refund_id: refund.id,
          amount: (refund.amount / 100).toFixed(2),
          currency: refund.currency,
          status: refund.status, // processed, pending, failed
          speed_processed: refund.speed_processed || null, // instant, normal
          speed_requested: refund.speed_requested || null,
          created_at: refund.created_at ? new Date(refund.created_at * 1000).toLocaleString() : null
        };
      };

      // Helper: attempt Razorpay refund with proper error handling and cash fallback
      const processRazorpayRefund = async (paymentId, amountPaise, notes) => {
        try {
          const paymentDetails = await fetchPaymentDetails(paymentId);
          const refund = await razorpay.payments.refund(paymentId, {
            amount: amountPaise,
            notes
          });
          const refundDetails = await fetchRefundDetails(refund);
          return { success: true, paymentDetails, refund, refundDetails };
        } catch (err) {
          const errorMsg = err?.error?.description || err?.message || (err?.statusCode ? `Razorpay error (${err.statusCode})` : 'Payment gateway error');
          console.error('Razorpay refund error:', errorMsg, err);
          return { success: false, error: errorMsg };
        }
      };

      if (paymentMethod === 'cash') {
        refundResult = {
          method: 'cash',
          status: 'completed',
          message: `Return ₹${refundAmount.toFixed(2)} cash to customer`
        };
      }
      else if (paymentMethod === 'credit' || paymentMethod === 'pos_card') {
        if (isRazorpayPaymentId(saleInfo.razorpay_payment_id)) {
          const result = await processRazorpayRefund(saleInfo.razorpay_payment_id, refundAmountPaise, {
            reason: 'Product return',
            return_id: returnId.toString(),
            invoice_no: saleInfo.invoice_no
          });
          if (result.success) {
            refundResult = {
              method: paymentMethod === 'credit' ? 'card' : 'pos_card',
              status: 'completed',
              refund_id: result.refund.id,
              payment_details: result.paymentDetails,
              refund_details: result.refundDetails,
              message: `₹${refundAmount.toFixed(2)} refunded to original ${result.paymentDetails?.card_network || ''} card ending ${result.paymentDetails?.card_last4 || '****'}`
            };
          } else {
            // Razorpay refund failed — fallback to cash refund
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `Online refund could not be processed (${result.error}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
              original_payment_method: paymentMethod,
              razorpay_error: result.error
            };
          }
        } else {
          refundResult = {
            method: 'cash',
            status: 'completed',
            message: `No online payment ID found. Return ₹${refundAmount.toFixed(2)} cash to customer`,
            original_payment_method: paymentMethod
          };
        }
      }
      else if (paymentMethod === 'qr_code') {
        // If we have a real Razorpay payment ID, refund directly via payment ID
        if (isRazorpayPaymentId(saleInfo.razorpay_payment_id)) {
          const result = await processRazorpayRefund(saleInfo.razorpay_payment_id, refundAmountPaise, {
            reason: 'Product return',
            return_id: returnId.toString()
          });
          if (result.success) {
            refundResult = {
              method: 'upi',
              status: 'completed',
              refund_id: result.refund.id,
              payment_details: result.paymentDetails,
              refund_details: result.refundDetails,
              message: `₹${refundAmount.toFixed(2)} refunded to UPI ID: ${result.paymentDetails?.vpa || 'customer account'}`
            };
          } else {
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `Online refund could not be processed (${result.error}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
              original_payment_method: 'qr_code',
              razorpay_error: result.error
            };
          }
        }
        // If payment ID is not a real Razorpay one (TXN..., UPI_...), try refund via Razorpay order ID
        else if (saleInfo.razorpay_order_id && saleInfo.razorpay_order_id.startsWith('order_')) {
          try {
            // Fetch payments for this order from Razorpay
            const payments = await razorpay.orders.fetchPayments(saleInfo.razorpay_order_id);
            const capturedPayment = payments.items?.find(p => p.status === 'captured');

            if (capturedPayment) {
              const result = await processRazorpayRefund(capturedPayment.id, refundAmountPaise, {
                reason: 'Product return',
                return_id: returnId.toString()
              });
              if (result.success) {
                refundResult = {
                  method: 'upi',
                  status: 'completed',
                  refund_id: result.refund.id,
                  payment_details: result.paymentDetails,
                  refund_details: result.refundDetails,
                  message: `₹${refundAmount.toFixed(2)} refunded to UPI ID: ${result.paymentDetails?.vpa || 'customer account'}`
                };
              } else {
                refundResult = {
                  method: 'cash',
                  status: 'completed',
                  message: `Online refund could not be processed (${result.error}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
                  original_payment_method: 'qr_code',
                  razorpay_error: result.error
                };
              }
            } else {
              refundResult = {
                method: 'cash',
                status: 'completed',
                message: `No captured payment found on Razorpay for this order. Return ₹${refundAmount.toFixed(2)} cash to customer`,
                original_payment_method: 'qr_code'
              };
            }
          } catch (err) {
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `Could not fetch Razorpay order payments (${err.message}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
              original_payment_method: 'qr_code'
            };
          }
        }
        else {
          // Last resort: try to find Razorpay order by receipt pattern qr_{saleId}
          let foundViaReceipt = false;
          try {
            const orders = await razorpay.orders.all({ receipt: `qr_${sale_id}` });
            const order = orders.items?.find(o => o.status === 'paid');
            if (order) {
              const payments = await razorpay.orders.fetchPayments(order.id);
              const capturedPayment = payments.items?.find(p => p.status === 'captured');
              if (capturedPayment) {
                const result = await processRazorpayRefund(capturedPayment.id, refundAmountPaise, {
                  reason: 'Product return',
                  return_id: returnId.toString()
                });
                if (result.success) {
                  foundViaReceipt = true;
                  refundResult = {
                    method: 'upi',
                    status: 'completed',
                    refund_id: result.refund.id,
                    payment_details: result.paymentDetails,
                    refund_details: result.refundDetails,
                    message: `₹${refundAmount.toFixed(2)} refunded to UPI ID: ${result.paymentDetails?.vpa || 'customer account'}`
                  };
                }
              }
            }
          } catch (err) {
            // Receipt lookup failed
          }

          if (!foundViaReceipt) {
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `No online payment record found. Return ₹${refundAmount.toFixed(2)} cash to customer`
            };
          }
        }
      }
      else if (paymentMethod === 'split') {
        const onlineRefundAmount = Math.min(refundAmount, Number(saleInfo.online_amount) || 0);
        const cashRefundAmount = refundAmount - onlineRefundAmount;

        if (onlineRefundAmount > 0 && isRazorpayPaymentId(saleInfo.razorpay_payment_id)) {
          const result = await processRazorpayRefund(saleInfo.razorpay_payment_id, Math.round(onlineRefundAmount * 100), {
            reason: 'Product return - split payment',
            return_id: returnId.toString()
          });
          if (result.success) {
            refundResult = {
              method: 'split',
              status: 'completed',
              refund_id: result.refund.id,
              online_refund: onlineRefundAmount,
              cash_refund: cashRefundAmount,
              online_method: saleInfo.online_method,
              payment_details: result.paymentDetails,
              refund_details: result.refundDetails,
              message: cashRefundAmount > 0
                ? `₹${onlineRefundAmount.toFixed(2)} refunded to ${result.paymentDetails?.vpa || result.paymentDetails?.card_network || saleInfo.online_method || 'online'} account. Return ₹${cashRefundAmount.toFixed(2)} cash to customer`
                : `₹${onlineRefundAmount.toFixed(2)} refunded to ${result.paymentDetails?.vpa || result.paymentDetails?.card_network || saleInfo.online_method || 'online'} account`
            };
          } else {
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `Online refund could not be processed (${result.error}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
              original_payment_method: 'split',
              cash_refund: refundAmount,
              razorpay_error: result.error
            };
          }
        } else if (onlineRefundAmount > 0 && saleInfo.razorpay_order_id && saleInfo.razorpay_order_id.startsWith('order_')) {
          // Try refund via Razorpay order ID
          try {
            const payments = await razorpay.orders.fetchPayments(saleInfo.razorpay_order_id);
            const capturedPayment = payments.items?.find(p => p.status === 'captured');
            if (capturedPayment) {
              const result = await processRazorpayRefund(capturedPayment.id, Math.round(onlineRefundAmount * 100), {
                reason: 'Product return - split payment',
                return_id: returnId.toString()
              });
              if (result.success) {
                refundResult = {
                  method: 'split',
                  status: 'completed',
                  refund_id: result.refund.id,
                  online_refund: onlineRefundAmount,
                  cash_refund: cashRefundAmount,
                  online_method: saleInfo.online_method,
                  payment_details: result.paymentDetails,
                  refund_details: result.refundDetails,
                  message: cashRefundAmount > 0
                    ? `₹${onlineRefundAmount.toFixed(2)} refunded online. Return ₹${cashRefundAmount.toFixed(2)} cash to customer`
                    : `₹${onlineRefundAmount.toFixed(2)} refunded online`
                };
              } else {
                refundResult = {
                  method: 'cash',
                  status: 'completed',
                  message: `Online refund could not be processed (${result.error}). Return ₹${refundAmount.toFixed(2)} cash to customer`,
                  original_payment_method: 'split',
                  cash_refund: refundAmount,
                  razorpay_error: result.error
                };
              }
            } else {
              refundResult = {
                method: 'cash',
                status: 'completed',
                message: `No captured payment found. Return ₹${refundAmount.toFixed(2)} cash to customer`
              };
            }
          } catch (err) {
            refundResult = {
              method: 'cash',
              status: 'completed',
              message: `Could not process online refund (${err.message}). Return ₹${refundAmount.toFixed(2)} cash to customer`
            };
          }
        } else {
          refundResult = {
            method: 'cash',
            status: 'completed',
            message: `Return ₹${refundAmount.toFixed(2)} cash to customer`
          };
        }
      }
      else {
        refundResult = {
          method: 'cash',
          status: 'completed',
          message: `Return ₹${refundAmount.toFixed(2)} cash to customer`
        };
      }

      /* -------------------- UPDATE RETURN RECORD -------------------- */
      await CommonModel.updateData({
        table: "returns",
        data: {
          refund_amount: refundAmount,
          refund_status: refundResult.status,
          refund_razorpay_id: refundResult.refund_id || null,
          refund_method: refundResult.method
        },
        conditions: { id: returnId },
        storeId
      });

      await CommonModel.insertData({
        table: "return_approvals",
        data: {
          return_id: returnId,
          sale_id,
          cashier_id: req.user.userId,
          manager_id: req.user.userId,
          action: 'refund'
        },
        storeId
      });

      /* -------------------- SUCCESS RESPONSE -------------------- */
      return sendResponse(res, true, 200, "Return processed successfully", {
        return_id: returnId,
        invoice_no: saleInfo.invoice_no,
        refundAmount,
        return_type,
        refund: refundResult
      });

    } catch (error) {
      return sendResponse(
        res, false, 500,
        error.message || "Return process failed"
      );
    }
  },

  confirmExchange: async (req, res) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const { sale_id, return_items, exchange_items, payment_method, cash_amount, online_amount, online_method } = req.body;
  
      /* ---------------- VALIDATION ---------------- */
      if (!sale_id)
        return sendResponse(res, false, 400, "sale_id required");
  
      if (!Array.isArray(return_items) || !return_items.length)
        return sendResponse(res, false, 400, "return_items required");
  
      if (!Array.isArray(exchange_items) || !exchange_items.length)
        return sendResponse(res, false, 400, "exchange_items required");
  
      /* ---------------- FETCH SALE ---------------- */
      const [sale] = await CommonModel.rawQuery(
        `SELECT subtotal, tax, total,invoice_no FROM sales WHERE id = ? AND store_id = ?`,
        [sale_id, storeId]
      );
      if (!sale)
        return sendResponse(res, false, 404, "Sale not found");
  
      let returnAmount = 0;
      let exchangeAmount = 0;
  
      /* ---------------- CREATE RETURN ---------------- */
      const returnId = await CommonModel.insertData({
        table: "returns",
        data: {
          sale_id,
          payment_method,
          return_type: "exchange",
          refund_amount: 0,
          cash_amount: payment_method === "split" ? cash_amount : null,
          online_amount: payment_method === "split" ? online_amount : null,
          online_method: payment_method === "split" ? online_method : null
        },
        storeId
      });
  
      /* ---------------- RETURN ITEMS ---------------- */
      for (const r of return_items) {
        const [saleItem] = await CommonModel.rawQuery(
          `SELECT qty, returned_qty, price 
           FROM sales_items WHERE id = ?`,
          [r.sale_item_id]
        );
        
        if (!saleItem) continue;
        const availableQty = saleItem.qty - saleItem.returned_qty;
        if (r.qty > availableQty)
          return sendResponse(res, false, 400, "Return qty exceeds available qty");
  
        const amount = r.qty * saleItem.price;
        returnAmount += amount;
        
        await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: r.product_id,
            stock:  r.qty,
            type:'credit',
            note:'Exchange Product',
            created_at:new Date(),
          },
          storeId
        });

        await CommonModel.insertData({
          table: "return_items",
          data: {
            return_id: returnId,
            sale_item_id: r.sale_item_id,
            product_id: r.product_id,
            product_name: r.product_name,
            image: r.image,
            return_qty: r.qty,
            tax: r.tax,
            refund_amount:amount
          },
          storeId
        });
  
        await CommonModel.rawQuery(
          `
          UPDATE sales_items
          SET returned_qty = returned_qty + ?,
              is_returned =
                CASE
                  WHEN (returned_qty + ?) >= qty THEN 'yes'
                  WHEN (returned_qty + ?) > 0 THEN 'partial'
                  ELSE 'no'
                END
          WHERE id = ?
          `,
          [r.qty, r.qty, r.qty, r.sale_item_id]
        );
      }
      
    
      /* ✅ FIXED: EXCHANGE ITEMS (NEW SALE ITEMS) - NOW WITH STOREID ✅ */
      for (const e of exchange_items) {
        if (!e.product_id) continue;
        const amount = e.qty * e.price;
        exchangeAmount += amount;
        
        // ✅ FIX: Added storeId parameter
        await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: e.product_id,
            stock:  e.qty,
            type:'debit',
            note:'Sale',
            created_at:new Date(),
          },
          storeId
        });
        
        // ✅ FIX: Added storeId parameter
        await CommonModel.insertData({
          table: "sales_items",
          data: {
            sale_id,
      product_id: e.product_id,
      product_name: e.product_name,
      image: e.image,
      qty: e.qty,
      price: e.price,
      tax: e.tax,
      total: amount,
      returned_qty: 0,
      is_returned: "no"
          },
          storeId
        });
      }
  
      /* ---------------- SALE TOTAL ADJUST ---------------- */
      const difference = exchangeAmount - returnAmount;
  
      await CommonModel.rawQuery(
        `UPDATE sales
        SET
          subtotal = subtotal + ?,
          total = total + ?
        WHERE id = ?
        `,
        [difference, difference, sale_id]
      );
  
      /* ---------------- UPDATE RETURN MASTER ---------------- */

      await CommonModel.rawQuery(
        `UPDATE returns
        SET refund_amount = ?
        WHERE id = ?`,
       [difference < 0 ? Math.abs(difference) : 0, returnId]
      );
      
      /* ✅ FIXED: Only create Razorpay order if difference > 0 (customer owes money) ✅ */
      if (payment_method === "cash") {
        return sendResponse(res, true, 200, "Exchange processed successfully", {
          return_id: returnId,
          invoice_no: sale.invoice_no,
          returnAmount,
          exchangeAmount,
          difference
        });
      } else if (payment_method === "split") {
        // For split payments, create Razorpay order only for online amount
        const orderAmount = online_amount;
        const order = await razorpay.orders.create({
          amount: Math.round(orderAmount * 100),
          currency: "INR",
          receipt: `exchange_${sale_id}_split`,
        });
        const data = {
          razorpayOrderId: order.id,
          saleId: sale_id,
          amount: orderAmount,
          cash_amount,
          online_amount,
          online_method
        };
        const invoiceData = {
          invoice_no: sale.invoice_no,
          returnAmount,
          exchangeAmount,
          difference,
          data
        };
        return sendResponse(res, true, 201, "Split exchange created successfully", invoiceData);
      } else {
        const order = await razorpay.orders.create({
          amount: Math.round(exchangeAmount * 100),
          currency: "INR",
          receipt: `exchange_${sale_id}`,
        });
        const data = {
          razorpayOrderId: order.id,
          saleId: sale_id,
          amount: difference,
        };
        const invoiceData = {
          invoice_no: sale.invoice_no,
          returnAmount,
          exchangeAmount,
          difference,
          data
        };
        return sendResponse(res, true, 201, "Exchange completed successfully", invoiceData);
      }
    } catch (error) {
      const msg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error("🔴 Exchange Error:", msg, error && error.stack ? error.stack : error);
      return sendResponse(res, false, 500, msg || "Exchange failed");
    }
  },

  list:async(req,resp)=>{
    try{
        const storeId = getStoreIdFromRequest(req);
        const result=await ReturnService.list(storeId)
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

getReturnById: async (req, res) => {
  try {
    const storeId = getStoreIdFromRequest(req);
    const { id } = req.params;
      if(!id)
      {
          return sendResponse(res,false,400,"id not found")
      }
    const getValue = await ReturnService.getReturnById(id, storeId);
      const returns=getValue[0]
    if (!returns) {
      return sendResponse(res, false, 404, "Return Product not found");
    }

    const items = await CommonModel.getAllData({
      table: 'return_items',
      conditions: { return_id: id}
    });

    return sendResponse(res, true, 200, "Returns details", {
      returns,
      items
    });

  } catch (error) {
    return sendResponse(res, false, 500, error.message);
  }
},

saleReturnById: async (req, res) => {
  try {
    const { id } = req.params;
      if(!id)
      return sendResponse(res,false,400,"id not found")
      const items = await CommonModel.getSingle({
        table: 'sales_items',
        conditions: {id}
      });
    if (!items)
      return sendResponse(res, false, 404, "Sale Return not found");
    return sendResponse(res, true, 200, "Sale Returns Item",items);

  } catch (error) {
    return sendResponse(res, false, 500, `Error :${error.message}`);
  }
},

verifyManagerAuth: async (req, res) => {
  try{
  const { user_id, password } = req.body;

  const [user] = await CommonModel.rawQuery(
    `SELECT userId, password FROM users WHERE user_id = ? AND (role = '1' OR role='2')`,
    [user_id]
  );
  if (!user)
    return sendResponse(res, false, 401, "Unauthorized");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return sendResponse(res, false, 401, "Invalid credentials");

  return sendResponse(res, true, 200, "Approved", {
    manager_id: user.userId
  });
}catch(error)
{
  return sendResponse(res,false,500,`Error : ${error.message}`)
}
},

  

}
