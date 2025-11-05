import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CardService={

    list:async()=>{

        const result=await CommonModel.getAllData({table:"cards"})
        return result      
    },

    add:async(data)=>{
       
        const result=await CommonModel.insertData({table:"cards",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"cards",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,type}=data
        const result=await CommonModel.updateData({table:"cards",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"cards",conditions:{id}})  
      return result
    }
}