import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CategoryService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"categories"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"categories",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"categories",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,category_name}=data
        const result=await CommonModel.updateData({table:"categories",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"categories",conditions:{id}})  
      return result
    }
}