import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const SaleService={

    list:async()=>{
      const query = `
      SELECT 
      sale.id,
      sale.invoice_no,
      DATE_FORMAT(sale.created_at, '%Y-%m-%d') AS sale_date,
      COUNT(
        DISTINCT CASE 
          WHEN si.is_returned = 'no' THEN si.id 
          ELSE NULL 
        END
      ) AS total_items,
      sale.total AS amount,
      UPPER(sale.status) AS status
    FROM sales AS sale
    LEFT JOIN sales_items AS si 
      ON si.sale_id = sale.id
    
    GROUP BY 
      sale.id
    ORDER BY sale.id DESC
    `;
    return await CommonModel.rawQuery(query);    
    },

    generateInvoice: async() => {
       
        const [rows] = await pool.promise().query(
          "SELECT invoice_no FROM sales ORDER BY id DESC LIMIT 1"
        );
      
        let nextSeq = 1;
      
        if (rows.length > 0) {
          const lastPo = rows[0].invoice_no ; // TEMP-0006 OR PO-0006
          const parts = lastPo.split("-");
      
          const lastSeq = parseInt(parts[parts.length - 1], 10);
          nextSeq = lastSeq + 1;
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const formattedSeq = String(nextSeq).padStart(4, "0");
      
        return `TXN-${day}-${month}-${year}-${formattedSeq}`;
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


      saleReport: async () => {
        const query = `
        SELECT 
        s.invoice_no,
        s.total,
        s.payment_type,
        COUNT(si.id) AS items
      FROM sales s
      LEFT JOIN sales_items si ON si.sale_id = s.id
      GROUP BY s.id`
        return await CommonModel.rawQuery(query);
      },

      

}