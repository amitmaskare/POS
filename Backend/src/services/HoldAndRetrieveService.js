import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"
export const HoldAndRetrieveService={

  list:async()=>{
    const query = `
    SELECT 
    hs.id,
    hs.customer_mobile,
    hs.total,
    DATE_FORMAT(hs.created_at, '%Y-%m-%d %H:%i') AS datetime,
    COUNT(hsi.id) AS total_items,
    hsi.price,
    u.name
  FROM hold_sales AS hs
  LEFT JOIN users AS u ON u.userId=hs.user_id
  LEFT JOIN hold_sale_items AS hsi
    ON hsi.hold_sale_id  = hs.id
  GROUP BY 
    hs.id
  ORDER BY hs.id DESC
  LIMIT 10
  `;
  return await CommonModel.rawQuery(query);    
  },

    generateHoldNumber: async() => {
       
        const [rows] = await pool.promise().query(
          "SELECT hold_code FROM hold_sales ORDER BY id DESC LIMIT 1"
        );
      
        let nextSeq = 1;
      
        if (rows.length > 0) {
          const lastPo = rows[0].hold_code; // TEMP-0006 OR PO-0006
          const parts = lastPo.split("-");
      
          const lastSeq = parseInt(parts[parts.length - 1], 10);
          nextSeq = lastSeq + 1;
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const formattedSeq = String(nextSeq).padStart(4, "0");
      
        return `Hold-${day}-${month}-${year}-${formattedSeq}`;
      },

    holdSale:async(data)=>{
        const result=await CommonModel.insertData({table:"hold_sales",data:data})
        return result
    },

    holdItem: async (data) => {
        return await CommonModel.insertData({
          table: "hold_sale_items",
          data:data,
        });
      },

      retrieveHoldSale: async (customer_mobile) => {
        const result=await CommonModel.getSingle({table:"hold_sales",conditions:{customer_mobile:customer_mobile}})
         return result
     },
      retrieveHoldSaleItem: async (id) => {
       const result=await CommonModel.getAllData({table:"hold_sale_items",fields:["product_id as id, product_name, price, qty, image"],conditions:{hold_sale_id:id}})
        return result
    },
   
}