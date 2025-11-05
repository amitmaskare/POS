import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CustomerService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"customers",fields:["name,email,phone,address,created_at"]})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"customers",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"customers",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,name,email,phone,address}=data
        const result=await CommonModel.updateData({table:"customers",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"customers",conditions:{id}})  
      return result
    }
}