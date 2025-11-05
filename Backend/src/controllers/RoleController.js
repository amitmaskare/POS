import { RoleService } from "../services/RoleService.js";
import { sendResponse } from "../utils/sendResponse.js";

export const RoleController={

    list:async(req,resp)=>{
        try{
            const result = await RoleService.list()
            if(!result || result.length==0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    add:async(req,resp)=>{
        try{
            const {name}=req.body
            if(!name)
            {
                return sendResponse(resp,false,400,"name is required")
            }
            const result=await RoleService.add(name)
             if(result===0)
             {
                return sendResponse(resp, false, 400, "Something went wrong");
             }
            return sendResponse(resp,true,201,"Role added successfully")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error:${error.message}`)
        }
    },

    getById:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await RoleService.getById(id)
            if(!result || result.length==0)
            {
                return sendResponse(resp,false,400,"No Data Found")

            }
            return sendResponse(resp,true,200,"Get Data Successfully",result)

        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
    
    update:async(req,resp)=>{
        try{
            const {name,roleId}=req.body
            if(!roleId)
            {
                return sendResponse(resp,false,400,"roleId field is required")
            }
            if(!name)
            {
                return sendResponse(resp,false,400,"name field is required")
            }
            const result=await RoleService.update(req.body)
            if(!result)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Role updated successfully")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    deleteData:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await RoleService.deleteData(id)
            if(!result || result.length==0)
            {
                return sendResponse(resp,false,400,"ID not found")
            }
            return sendResponse(resp,true,200,"Role deleted successfully")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
}