import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CustomerService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"customers",fields:["id,name,email,phone,aadhaar_no,address,created_at"], storeId})
        return result
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"customers",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"customers",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,name,email,phone,aadhaar_no,address}=data
        const result=await CommonModel.updateData({table:"customers",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"customers",conditions:{id}, storeId})  
      return result
    },

    checkEmail: async (email) => {
        return await CommonModel.findOne({
          table: "customers",
          where: { email }
        });
      },
      
      checkPhone: async (phone) => {
        return await CommonModel.findOne({
          table: "customers",
          where: { phone }
        });
      },

      checkAadhaar: async (aadhaar_no) => {
        return await CommonModel.findOne({
          table: "customers",
          where: { aadhaar_no }
        });
      },
}