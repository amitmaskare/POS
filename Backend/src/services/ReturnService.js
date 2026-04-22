import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const ReturnService={

    scanProduct:async(data, storeId)=>{
        const{barcode,invoice_no}=data
      const query = `
      SELECT 
      si.id AS sale_item_id,
      si.qty,
      si.returned_qty,
      si.product_id,
      si.price,
      si.product_name,
      si.image,
      p.is_returnable
    FROM sales s
    JOIN sales_items si ON si.sale_id = s.id
    JOIN products p ON p.id = si.product_id
    WHERE p.barcode = ? AND s.invoice_no = ? AND s.store_id = ? LIMIT 1`;
    return await CommonModel.rawQuery(query, [barcode,invoice_no, storeId]);   
    },

   
      createSale:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"sales",data:data, storeId})
        return result
    },

    createSaleItem: async (data) => {
        return await CommonModel.insertData({
          table: "sales_items",
          data:data,
        });
      },

      getSaleById :async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { id }, storeId})
        return result
      },

      getSale :async(invoice_no, storeId)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { invoice_no:invoice_no }, storeId})
        return result
      },

      list: async (storeId) => {
        const query = `
          SELECT 
            r.id,
            s.invoice_no,
            DATE_FORMAT(r.created_at, '%Y-%m-%d') AS return_date,
            COUNT(DISTINCT ri.id) AS total_items,
            r.refund_amount AS amount,
            UPPER(r.return_type) AS status
          FROM returns AS r
          LEFT JOIN sales AS s 
            ON s.id = r.sale_id
          LEFT JOIN return_items AS ri 
            ON ri.return_id = r.id
          WHERE r.store_id = ?
          GROUP BY 
            r.id, s.invoice_no, r.created_at, r.refund_amount, r.return_type
          ORDER BY r.id DESC
        `;
        
        return await CommonModel.rawQuery(query, [storeId]);    
      },

      getReturnById :async(id, storeId)=>{
        const query = `
        SELECT
        r.id,
        r.refund_amount,
        r.refund_status,
        r.refund_method,
        r.return_type,
        s.invoice_no,
        s.payment_method,
        s.total AS sale_total,
        s.tax AS sale_tax
      FROM returns AS r
      LEFT JOIN sales AS s
        ON s.id = r.sale_id
      WHERE r.id = ? AND r.store_id = ?
      `;
      return await CommonModel.rawQuery(query, [id, storeId]);
      },
      

}