import { ReturnService } from "../services/ReturnService.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"

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
          table: "sales_items", fields:["id as sale_item_id,qty,returned_qty,product_id,price,product_name,image"],
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
      const { sale_id, items, return_type } = req.body;
  
      /* -------------------- VALIDATIONS -------------------- */
      if (!sale_id)
        return sendResponse(res, false, 400, "sale_id required");
  
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
          refund_amount: 0
        }
      });
  
      /* -------------------- PROCESS ITEMS -------------------- */
      for (const i of items) {
        if (!i.qty || i.qty <= 0) continue;
  
        // 🔍 Fetch sale item
        const [saleItem] = await CommonModel.rawQuery(
          `SELECT qty, returned_qty, price 
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
  
        const amount = i.qty * saleItem.price;
        refundAmount += amount;
  
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


      /* -------------------- SUCCESS RESPONSE -------------------- */
      return sendResponse(res, true, 200, "Return processed successfully", {
        return_id: returnId,
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
      const { sale_id, return_items, exchange_items } = req.body;
  
      /* ---------------- VALIDATION ---------------- */
      if (!sale_id)
        return sendResponse(res, false, 400, "sale_id required");
  
      if (!Array.isArray(return_items) || !return_items.length)
        return sendResponse(res, false, 400, "return_items required");
  
      if (!Array.isArray(exchange_items) || !exchange_items.length)
        return sendResponse(res, false, 400, "exchange_items required");
  
      /* ---------------- FETCH SALE ---------------- */
      const [sale] = await CommonModel.rawQuery(
        `SELECT subtotal, tax, total FROM sales WHERE id = ?`,
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
          return_type: "exchange",
          refund_amount: 0
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
          table: "return_items",
          data: {
            return_id: returnId,
            sale_item_id: r.sale_item_id,
            product_id: r.product_id,
            product_name: r.product_name,
            image: r.image,
            return_qty: r.qty,
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
          table: "sales_items",
          data: {
            sale_id,
      product_id: e.product_id,
      product_name: e.product_name,   // ✅ ADD
      image: e.image,                 // ✅ ADD
      qty: e.qty,
      price: e.price,
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

      // await CommonModel.updateData({
      //   table: "returns",
      //   data: { refund_amount: returnAmount },
      //   conditions: { id: returnId }
      // });
  
      /* ---------------- RESPONSE ---------------- */
      // return sendResponse(res, true, 200, "Exchange completed", {
      //   return_id: returnId,
      //   returned_amount: returnAmount,
      //   exchanged_amount: exchangeAmount,
      //   payable:
      //     difference > 0
      //       ? `Customer pays ₹${difference}`
      //       : difference < 0
      //       ? `Refund ₹${Math.abs(difference)}`
      //       : "No payment"
      // });
      return sendResponse(res, true, 200, "Exchange processed successfully", {
        return_id: returnId,
        returnAmount,
        exchangeAmount,
        difference
      });
  
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
          return sendResponse(resp,false,400,"id not found")
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


  

}