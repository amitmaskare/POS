import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const StoreService = {
  list: async () => {
    const result = await CommonModel.getAllData({
      table: "stores",
    });
    return result;
  },

   getNextOrderId:async()=> {
  const [rows] = await pool.promise().query("SELECT MAX(store_id) as maxId FROM stores");
  const nextId = (rows[0].maxId || 999) + 1;
    return `STORE${nextId}`
  },

  add: async (storeData) => {
   const {store_name,phone,address,gst,tax,city,location,pincode,currency,address_proof,type}=storeData
    const store_id= await StoreService.getNextOrderId()
      const userId = req.user.userId;
    const data={
      userId:userId,
      store_id:store_id,
      store_name:store_name,
      phone:phone,
      address:address,
      gst:gst,
      tax:tax,
      city:city,
      location:location,
      pincode:pincode,
      currency:currency,
      address_proof:address_proof,
      type:type,
      created_at:new Date(),
    }
    const result = await CommonModel.insertData({
      table: "stores",
      data: data,
    });
    return result;
  
  },

  getById:async(id)=>{
    const result= await CommonModel.getSingle({table:"stores",conditions:{id}})
    return result
  },
};
