import { CategoryService } from "../services/CategoryService.js";
import {sendResponse} from "../utils/sendResponse.js"


export const CategoryController={
    list:async(req,resp)=>{
        try{
            const result=await CategoryService.list()
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
            const{category_name}=req.body
            if(!category_name)
            {
                return sendResponse(resp,false,400,"category_name field is required")
            }
            const result= await CategoryService.add(req.body)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Category added successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },
    getById:async(req,resp)=>{
        try{
            const {id}=req.body
            if(!id)
            {
            return sendResponse(resp,false,400,"ID not found")
            }
            const result=await CategoryService.getById(id)
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
             const {id,category_name}=req.body
                        if(!id)
                        {
                            return sendResponse(resp,false,400,"id field is reuired")
                        }
                        if(!category_name)
                        {
                            return sendResponse(resp,false,400,"category_name field is required")
                        }
                        const result= await CategoryService.update(req.body)
                        if(!result)
                        {
                            return sendResponse(resp,false,400,"Something went wrong")
                        }
                        return sendResponse(resp,true,201,"Category updated successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)

        }
    },
    deleteData:async(req,resp)=>{
        try{
            const {id}=req.body
            const result=await CategoryService.deleteData(id)
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