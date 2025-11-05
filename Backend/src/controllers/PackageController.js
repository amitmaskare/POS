import { PackageService } from "../services/PackageService.js";
import {sendResponse} from "../utils/sendResponse.js"


export const PackageController={
    list:async(req,resp)=>{
        try{
            const result=await PackageService.list()
            if(!result || result.length===0)
            {
                return sendResponse(reportError,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
    add:async(req,resp)=>{
        try{
            const{package_name}=req.body
            if(!package_name)
            {
                return sendResponse(resp,false,400,"package_name field is required")
            }
            const result= await PackageService.add(req.body)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Package added successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
    getById:async(req,resp)=>{
        try{
            const {id}=req.params
            if(!id)
            {
            return sendResponse(resp,false,400,"ID not found")
            }
            const result=await PackageService.getById(id)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"get by id data",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
    update:async(req,resp)=>{
        try{
             const {id,package_name}=req.body
                        if(!id)
                        {
                            return sendResponse(resp,false,400,"id field is reuired")
                        }
                        if(!package_name)
                        {
                            return sendResponse(resp,false,400,"package_name field is required")
                        }
                        const result= await PackageService.update(req.body)
                        if(!result)
                        {
                            return sendResponse(resp,false,400,"Something went wrong")
                        }
                        return sendResponse(resp,true,201,"Package updated successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)

        }
    },
    deleteData:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await PackageService.deleteData(id)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"ID not found")
            }
            return sendResponse(resp,true,200,"Item deleted successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
}