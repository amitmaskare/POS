import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const RationcardService={

    list:async(storeId)=>{
        const result=await CommonModel.getAllData({table:"ration_cards", storeId})
        return result      
    },

    add:async(data, storeId)=>{
        const result=await CommonModel.insertData({table:"ration_cards",data:data, storeId})
        return result
    },

    getById:async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"ration_cards",conditions:{id}, storeId})
        return result
    },

    update:async(data, storeId)=>
    {
        const {id,card_type_id,card_number,card_holder_name,mobile,address,family_member}=data
        const result=await CommonModel.updateData({table:"ration_cards",data:data,conditions:{id}, storeId})
        return result
    },

    deleteData:async(id, storeId)=>{
      const result=await CommonModel.deleteData({table:"ration_cards",conditions:{id}, storeId})  
      return result
    }
}