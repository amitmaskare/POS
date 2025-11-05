import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const RationcardService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"ration_cards"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"ration_cards",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"ration_cards",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,card_type_id,card_number,card_holder_name,mobile,address,family_member}=data
        const result=await CommonModel.updateData({table:"ration_cards",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"ration_cards",conditions:{id}})  
      return result
    }
}