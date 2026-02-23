import { ReturnService } from "../services/ReturnService.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"
import bcrypt from "bcrypt";
import crypto from "crypto"
import razorpay from "../config/razorpay.js"
export const ReturnController={

   scanInvoice: async (req, res) => {
       try{
        const { invoice_no } = req.body;

        if (!invoice_no)
          return sendResponse(res, false, 400, "invoice_no required");
      
        const sale = await CommonModel.getSingle({
          table: "sales",
          conditions: { invoice_no:invoice_no }
        });
       
        const saleData=await CommonModel.getAllData({
          table: "sales_items", fields:["id as sale_item_id,qty,returned_qty,product_id,price,product_name,image,is_returned"],
          conditions: { sale_id:sale.id }
        });
      
        if (!sale)
          return sendResponse(res, false, 404, "Invoice not found");

         const data={
          invoice_no: sale.invoice_no,
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
        const {invoice_no,barcode } = req.body;
        if(!invoice_no)
        return sendResponse(res, false, 400, "invoice_no required");
        if(!barcode)
        return sendResponse(res, false, 400, "barcode required");
        const result = await ReturnService.scanProduct(req.body)
         
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
      const { sale_id, items, return_type,manager_id } = req.body;
  
      /* -------------------- VALIDATIONS -------------------- */
      if (!sale_id)
        return sendResponse(res, false, 400, "sale_id required");
       if (!manager_id)
      return sendResponse(res, false, 400, "manager_id required");
    
        if (!["refund", "exchange"].includes(return_type))
        return sendResponse(res, false, 400, "Invalid return_type");
  
      if (!Array.isArray(items) || items.length === 0)
        return sendResponse(res, false, 400, "items cannot be empty");
  
      let refundAmount = 0;
  
      /* -------------------- CREATE RETURN ENTRY -------------------- */
      const returnId = await CommonModel.insertData({
        table: "returns",
        data: {
         sale_id,
        return_type,
        refund_amount: 0,
        approved_by: manager_id,
        approved_at: new Date()
        }
      });
  
      /* -------------------- PROCESS ITEMS -------------------- */
      for (const i of items) {
        if (!i.qty || i.qty <= 0) continue;
  
        // 🔍 Fetch sale item
        const [saleItem] = await CommonModel.rawQuery(
          `SELECT qty, returned_qty, price,tax 
           FROM sales_items 
           WHERE id = ?`,
          [i.sale_item_id]
        );
  
        if (!saleItem) continue;
  
        const availableQty = saleItem.qty - saleItem.returned_qty;
  
        if (i.qty > availableQty) {
          return sendResponse(
            res,
            false,
            400,
            `Return qty exceeds available qty for sale_item_id ${i.sale_item_id}`
          );
        }
        const baseAmount = i.qty * saleItem.price;
        const taxPercent = saleItem.tax || 0;
        const taxAmount = (baseAmount * taxPercent) / 100;
        const amount = baseAmount + taxAmount;
        refundAmount += amount;
        
        await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: i.product_id,
            stock:  i.qty,
            type:'credit',
            note:'Refund Product',
          }
        });
        /* -------------------- INSERT RETURN ITEMS -------------------- */
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
            refund_amount: amount
          }
        });
  
        /* -------------------- UPDATE SALES ITEMS -------------------- */
        await CommonModel.rawQuery(
          `
          UPDATE sales_items
          SET 
            returned_qty = returned_qty + ?,
            is_returned = 
              CASE 
                WHEN returned_qty + ? >= qty THEN 'yes'
                ELSE 'no'
              END
          WHERE id = ?
          `,
          [i.qty, i.qty, i.sale_item_id]
        );
      }
  
      /* -------------------- UPDATE TOTAL REFUND -------------------- */
      const [sale] = await CommonModel.rawQuery(
        `SELECT subtotal, tax, total FROM sales WHERE id = ?`,
        [sale_id]
      );
      const returnSubtotal = refundAmount;
      const returnTax = (returnSubtotal * sale.tax) / sale.subtotal;
     
await CommonModel.rawQuery(`
UPDATE sales
SET 
  subtotal = subtotal - ?,
  tax = tax - ?,
  total = total - (? + ?),
  status =
    CASE
      WHEN total - (? + ?) <= 0 THEN 'returned'
      ELSE 'partially_returned'
    END
WHERE id = ?
`, [
returnSubtotal,
returnTax,
returnSubtotal,
returnTax,
returnSubtotal,
returnTax,
sale_id
]);
  
await CommonModel.updateData({
  table: "returns",
  data: { refund_amount: refundAmount },
  conditions: { id: returnId }
});

  await CommonModel.insertData({
  table: "return_approvals",
  data: {
    return_id: returnId,
    sale_id,
    cashier_id: req.user.userId,
    manager_id: manager_id,
    action: 'refund'
  }
});


      /* -------------------- SUCCESS RESPONSE -------------------- */
      return sendResponse(res, true, 200, "Return processed successfully", {
        return_id: returnId,
        invoice_no:sale,
        refundAmount,
        return_type
      });
  
    } catch (error) {
      return sendResponse(
        res,
        false,
        500,
        error.message || "Return process failed"
      );
    }
  },

  confirmExchange: async (req, res) => {
    try {
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
        `SELECT subtotal, tax, total,invoice_no FROM sales WHERE id = ?`,
        [sale_id]
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
        }
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
          }
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
          }
        });
  
        await CommonModel.rawQuery(
          `
          UPDATE sales_items
          SET returned_qty = returned_qty + ?,
              is_returned =
                CASE 
                  WHEN returned_qty + ? >= qty THEN 'yes'
                  ELSE 'no'
                END
          WHERE id = ?
          `,
          [r.qty, r.qty, r.sale_item_id]
        );
      }
      
    
      /* ---------------- EXCHANGE ITEMS (NEW SALE ITEMS) ---------------- */
      for (const e of exchange_items) {
        if (!e.product_id) continue;
        const amount = e.qty * e.price;
        exchangeAmount += amount;
        await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: e.product_id,
            stock:  e.qty,
            type:'debit',
            note:'Sale',
            created_at:new Date(),
          }
        });
        await CommonModel.insertData({
          table: "sales_items",
          data: {
            sale_id,
      product_id: e.product_id,
      product_name: e.product_name,   // ✅ ADD
      image: e.image,                 // ✅ ADD
      qty: e.qty,
      price: e.price,
      tax: e.tax,
      total: amount,
      returned_qty: 0,
      is_returned: "no"
          }
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
      const data={
        razorpayOrderId: order.id,
          saleId:sale_id,
          amount:difference,
        }
        const invoiceData={
          invoice_no: sale.invoice_no,
          data
        }
        return sendResponse(res, true, 201, "Exchange completed successfully",invoiceData);
      }
    } catch (error) {
      return sendResponse(res, false, 500, error.message);
    }
  },

  list:async(req,resp)=>{
    try{
        const result=await ReturnService.list()
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
    const { id } = req.params;
      if(!id)
      {
          return sendResponse(res,false,400,"id not found")
      }
    const getValue = await ReturnService.getReturnById(id);
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