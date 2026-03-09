import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CategoryService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"categories", storeId})
        return result      
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"categories",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"categories",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,category_name}=data
        const result=await CommonModel.updateData({table:"categories",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"categories",conditions:{id}, storeId})  
      return result
    }
}