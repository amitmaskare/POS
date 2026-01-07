import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const ReturnService={

    scanProduct:async(data)=>{
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
    WHERE p.barcode = ? AND s.invoice_no = ? LIMIT 1`;
    return await CommonModel.rawQuery(query, [barcode,invoice_no]);   
    },

   
      createSale:async(data)=>{
        const result=await CommonModel.insertData({table:"sales",data:data})
        return result
    },

    createSaleItem: async (data) => {
        return await CommonModel.insertData({
          table: "sales_items",
          data:data,
        });
      },

      getSaleById :async(id)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { id }})
        return result
      },

      getSale :async(invoice_no)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { invoice_no:invoice_no }})
        return result
      },

      list: async () => {
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
          GROUP BY 
            r.id, s.invoice_no, r.created_at, r.refund_amount, r.return_type
          ORDER BY r.id DESC
        `;
        
        return await CommonModel.rawQuery(query);    
      },

      getReturnById :async(id)=>{
        const query = `
        SELECT 
        r.id,
        s.invoice_no
      FROM returns AS r
      LEFT JOIN sales AS s 
        ON s.id = r.sale_id
      ORDER BY r.id DESC
      `;
      return await CommonModel.rawQuery(query, [id]);
       // const result=await CommonModel.getSingle({table:"returns", conditions: { id }})
       // return result
      },
      

}