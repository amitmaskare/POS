import { CommonModel } from "../models/CommonModel.js";
import pool from "../config.js";
import slugify from 'slugify';
export const PermissionService={

    list:async(req,resp)=>{
        const result= await CommonModel.getAllData({table:'permissions',fields:["permissionId,name"]})
        return result
    },

    add:async(name)=>{
        const slug = slugify(name, {
            lower: true,       
            strict: true,      
        });
        const data={
            name:name,
           slug_url:slug,
            created_at:new Date(),
        }
        const result = await CommonModel.insertData({table:'permissions',data:data})
        return result
    },

    getById:async(permissionId)=>{
        const result=await CommonModel.getSingle({table:'permissions',fields:["permissionId,name"],conditions:{permissionId}})
        return result
    },

    update:async(permissionData)=>{
        const{permissionId,name}=permissionData
          const slug = slugify(name, {
            lower: true,       
            strict: true,      
        });
        const data={
            name:name,
            slug_url:slug
        }
        const result=await CommonModel.updateData({table:'permissions',data:data,conditions:{permissionId:permissionId}})
        return result
    },

    deleteData:async(permissionId)=>{
        const result=await CommonModel.deleteData({table:'permissions',conditions:{permissionId}})
        return result
    }
}