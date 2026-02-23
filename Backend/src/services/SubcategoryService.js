import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const SubcategoryService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"subcategories", storeId})
        return result      
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"subcategories",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"subcategories",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,category_name}=data
        const result=await CommonModel.updateData({table:"subcategories",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"subcategories",conditions:{id}, storeId})  
      return result
    }
}