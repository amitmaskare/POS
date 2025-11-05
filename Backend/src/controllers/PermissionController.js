import { PermissionService } from "../services/PermissionService.js";
import { sendResponse } from "../utils/sendResponse.js";

export const PermissionController={

    list:async(req,resp)=>{
        try{
            const result=await PermissionService.list()
            if(!result || result.length==0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch Data Successfully",result)
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
                return sendResponse(resp,false,400,"name field is required")
            }
            const result=await PermissionService.add(name)
            if(!result || result.length==0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Permission added successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    getById:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await PermissionService.getById(id)
            if(!result)
            {
                return sendResponse(resp,false,400,"No Id found")
            }
            return sendResponse(resp,true,200,"Get By Data",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    update:async(req,resp)=>{
        try{
            const {permissionId,name}=req.body
            if(!permissionId)
            {
                return sendResponse(resp,false,400,"permissionId field is reuired")
            }
            if(!name)
            {
                return sendResponse(resp,false,400,"name field is required")
            }
            const result= await PermissionService.update(req.body)
            if(!result)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Permission updated successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    deleteData:async(req,resp)=>{
        try{
         const {id}=req.params
         const result=await PermissionService.deleteData(id)
         if(!result || result.length==0)
         {
         return sendResponse(resp,false,400,"ID not found")
         }
         return sendResponse(resp,true,200,"Permission deleted successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    }



}