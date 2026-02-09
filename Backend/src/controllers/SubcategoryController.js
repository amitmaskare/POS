import { SubcategoryService } from "../services/SubcategoryService.js";
import {sendResponse} from "../utils/sendResponse.js"
import { getStoreIdFromRequest } from "../utils/storeHelper.js";


export const SubcategoryController={
    list:async(req,resp)=>{
        try{
            const storeId = getStoreIdFromRequest(req);
            const result=await SubcategoryService.list(storeId)
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
            const storeId = getStoreIdFromRequest(req);
            const{categoryId,subcategory_name}=req.body
             if(!categoryId)
            {
                return sendResponse(resp,false,400,"categoryId field is required")
            }
            if(!subcategory_name)
            {
                return sendResponse(resp,false,400,"subcategory_name field is required")
            }
            const result= await SubcategoryService.add(req.body, storeId)
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
            const storeId = getStoreIdFromRequest(req);
            const {id}=req.params
            if(!id)
            {
            return sendResponse(resp,false,400,"ID not found")
            }
            const result=await SubcategoryService.getById(id, storeId)
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
             const storeId = getStoreIdFromRequest(req);
             const {id,categoryId,subcategory_name}=req.body
                        if(!id)
                        {
                            return sendResponse(resp,false,400,"id field is reuired")
                        }
                         if(!categoryId)
                        {
                            return sendResponse(resp,false,400,"categoryId field is reuired")
                        }
                        if(!subcategory_name)
                        {
                            return sendResponse(resp,false,400,"subcategory_name field is required")
                        }
                        const result= await SubcategoryService.update(req.body, storeId)
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
            const storeId = getStoreIdFromRequest(req);
            const {id}=req.params
            const result=await SubcategoryService.deleteData(id, storeId)
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