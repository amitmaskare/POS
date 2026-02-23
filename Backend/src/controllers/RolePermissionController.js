import { RolePermissionService } from "../services/RolePermissionService.js";
import {sendResponse} from "../utils/sendResponse.js"
import { CommonModel } from "../models/CommonModel.js";

export const RolePermissionController={

    list:async(req,resp)=>{
        try{
            const result=await RolePermissionService.list()
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    // Get all permissions grouped by module
    getAllPermissionsGrouped: async (req, resp) => {
        try {
            const result = await RolePermissionService.getAllPermissionsGrouped();
            if (!result || result.length === 0) {
                return sendResponse(resp, false, 400, "No permissions found");
            }
            return sendResponse(resp, true, 200, "Permissions fetched successfully", result);
        } catch (error) {
            return sendResponse(resp, false, 500, `Error: ${error.message}`);
        }
    },

    getById:async(req,resp)=>{
        try{
            const {id}=req.params

            const result=await RolePermissionService.getById(id)
            // Return empty array if no permissions found (valid scenario)
            return sendResponse(resp,true,200,"Role permissions fetched",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    // Update role permissions (new toggle-based approach)
    updateRolePermissions: async (req, resp) => {
        try {
            const { role_id, permission_ids } = req.body;

            if (!role_id) {
                return sendResponse(resp, false, 400, "role_id field is required");
            }

            // permission_ids can be empty array (remove all permissions)
            if (!Array.isArray(permission_ids)) {
                return sendResponse(resp, false, 400, "permission_ids must be an array");
            }

            await RolePermissionService.updateRolePermissions(role_id, permission_ids);

            return sendResponse(resp, true, 200, "Role permissions updated successfully");
        } catch (error) {
            return sendResponse(resp, false, 500, `Error: ${error.message}`);
        }
    },

   giveRolePermission :async(req,resp)=>{
    try{
        const{role_id,roleId,permission_id}=req.body
         if(!role_id)
        {
            return sendResponse(resp,false,400,"roleId field is required")
        }
        if(!roleId)
        {
            return sendResponse(resp,false,400,"role_id field is required")
        }
        if(!permission_id)
        {
            return sendResponse(resp,false,400,"Please select at least one permission")
        }

        if(roleId!==role_id)
        {
            const deleteItem=await CommonModel.deleteData({table:'role_permissions',conditions:{role_id}})
        }
        const permissions = permission_id ? permission_id.split(",") : [];
        if (permissions.length > 0) {
     for (const value of permissions) {
    const data = {
      role_id: roleId,
      permission_id: value.trim(),
      updated_at: new Date(),
    };
        const result= await RolePermissionService.giveRolePermission(data)

        }
    }

        return sendResponse(resp,true,200,"Role permission added successful")
    }catch(error)
    {
        return sendResponse(resp,false,400,`Error : ${error.message}`)
    }
   },
}