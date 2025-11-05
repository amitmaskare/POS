import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"

export const PackageService={

    list:async()=>{
        const result=await CommonModel.getAllData({table:"packages"})
        return result      
    },

    add:async(data)=>{
        const result=await CommonModel.insertData({table:"packages",data:data})
        return result
    },

    getById:async(id)=>{
        const result=await CommonModel.getSingle({table:"packages",conditions:{id}})
        return result
    },

    update:async(data)=>
    {
        const {id,package_name}=data
        const result=await CommonModel.updateData({table:"packages",data:data,conditions:{id}})
        return result
    },

    deleteData:async(id)=>{
      const result=await CommonModel.deleteData({table:"packages",conditions:{id}})  
      return result
    }
}