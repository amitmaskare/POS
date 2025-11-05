import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const RolePermissionService={

   list:async()=>{
      const sql = `
  SELECT 
    MAX(rp.id) AS id,
    rp.role_id,
    MAX(rp.updated_at) AS updated_at,
    r.name AS role_name
  FROM role_permissions rp
  LEFT JOIN roles r ON r.roleId = rp.role_id
  GROUP BY rp.role_id
`;

const [result] = await pool.promise().query(sql);
return result;
   },

   getById:async(role_id)=>{
      const result=await CommonModel.getAllData({table:'role_permissions',fields:["id,role_id,permission_id"],conditions:{role_id}})
      return result
   },

   giveRolePermission:async(data)=>{
      
      const result=await CommonModel.insertData({table:'role_permissions',data:data})
      return result
   },


}