import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const PackageService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"packages", storeId})
        return result      
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"packages",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"packages",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,package_name}=data
        const result=await CommonModel.updateData({table:"packages",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"packages",conditions:{id}, storeId})  
      return result
    }
}