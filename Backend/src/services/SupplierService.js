import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const SupplierService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"suppliers", storeId})
        return result      
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"suppliers",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"suppliers",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,name}=data
        const result=await CommonModel.updateData({table:"suppliers",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"suppliers",conditions:{id}, storeId})  
      return result
    }
}