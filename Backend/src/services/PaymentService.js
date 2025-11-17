import { CommonModel } from "../models/CommonModel.js";


export const PaymentService={

    order:async(orderData)=>{
        const result=await CommonModel.insertData({table:'orders',data:orderData})
        return result
    },
     order_detail:async(orderDetailData)=>{
        const result=await CommonModel.insertData({table:'order_details',data:orderDetailData})
        return result
    },

    getNextOrderId: async () => {
    const [rows] = await pool
      .promise()
      .query("SELECT orderId FROM orders ORDER BY id DESC LIMIT 1");

    let nextId = 1000;
    if (rows.length > 0) {
      const lastId = rows[0].store_id.replace("ORDER", "");
      nextId = parseInt(lastId) + 1;
    }

    return `ORDER${nextId}`;
  },

}