import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const CuponService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"cupons"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"cupons",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"cupons",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,cupon_code,discount}=data
        const result=await CommonModel.updateData({table:"cupons",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"cupons",conditions:{id}})  
      return result
    }
}