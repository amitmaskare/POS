import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const SubcategoryService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"subcategories"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"subcategories",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"subcategories",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,category_name}=data
        const result=await CommonModel.updateData({table:"subcategories",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"subcategories",conditions:{id}})  
      return result
    }
}