import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const OfferService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"offers"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"offers",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"offers",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,offer_name,discount,description}=data
        const result=await CommonModel.updateData({table:"offers",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"offers",conditions:{id}})  
      return result
    }
}