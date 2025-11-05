import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const SupplierService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"suppliers"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"suppliers",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"suppliers",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,name}=data
        const result=await CommonModel.updateData({table:"suppliers",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"suppliers",conditions:{id}})  
      return result
    }
}