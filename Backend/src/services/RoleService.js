import { CommonModel } from "../models/CommonModel.js";
import pool from "../config.js";

export const RoleService={

    list:async()=>{
        const result= await CommonModel.getAllData({ table:"roles",fields:["roleId,name"]})
        return result
    },

    add:async(name)=>{
        const data={
            name:name,
            created_at:new Date(),
        }
        const result= await CommonModel.insertData({table:"roles",data:data})
        return result
    },
    getById:async(roleId)=>{
        const result = await CommonModel.getSingle({table:'roles',fields:["roleId,name"],conditions:{roleId}})
        return result
    },

    update:async(roleData)=>{
        const{roleId,name}=roleData
        const data={
            name:name,
        }
        const result= await CommonModel.updateData({table:"roles",data:data,conditions:{roleId:roleId}})
        return result
    },

    deleteData:async(roleId)=>{
        const result=await CommonModel.deleteData({table:'roles',conditions:{roleId}})
        return result
    },
}