import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import { json } from "stream/consumers"

export const CardService={

    list:async(storeId)=>{

        const result=await CommonModel.getAllData({table:"cards", storeId})
        return result      
    },

    add:async(data, storeId)=>{
       
        const result=await CommonModel.insertData({table:"cards",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"cards",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,type,items}=data
        const updatedata={
            type:type,
            items:JSON.stringify(items),
        }
        const result=await CommonModel.updateData({table:"cards",data:updatedata,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"cards",conditions:{id}, storeId})  
      return result
    }
}