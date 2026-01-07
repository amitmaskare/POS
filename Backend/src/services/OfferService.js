import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const OfferService={

    list: async () => {
        const query = `
        SELECT 
        o.id,
        o.offer_name,
        o.min_qty,
        o.offer_price,
        o.offer_qty_price,
        DATE_FORMAT(o.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(o.end_date, '%Y-%m-%d') AS end_date,
        UPPER(o.status) AS status,
        p.product_name
      FROM offers o
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.id DESC
      
        `;
        return await CommonModel.rawQuery(query);
      },
      

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"offers",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"offers",fields:["id,product_id,offer_name,min_qty,offer_price,offer_qty_price, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date, DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,status"],conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,offer_name,product_id,min_qty,offer_price,offer_qty_price,start_date,end_date,status}=data
        const result=await CommonModel.updateData({table:"offers",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"offers",conditions:{id}})  
      return result
    },

   
}