import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import { json } from "stream/consumers"

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
        const {id,type,items}=data
        const updatedata={
            type:type,
            items:JSON.stringify(items),
        }
        const result=await CommonModel.updateData({table:"cards",data:updatedata,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"cards",conditions:{id}})  
      return result
    }
}