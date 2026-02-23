import { RationcardService } from "../services/RationcardService.js";
import {sendResponse} from "../utils/sendResponse.js"
import { getStoreIdFromRequest } from "../utils/storeHelper.js";


export const RationcardController={

    list:async(req,resp)=>{
        try{
            const storeId = getStoreIdFromRequest(req);
            const result=await RationcardService.list(storeId)
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
    add:async(req,resp)=>{
        try{
           const storeId = getStoreIdFromRequest(req);
           const requiredFields = [
        "card_type_id",
        "card_number",
        "card_holder_name",
        "mobile",
        "address",
        "family_member",
      ];

       for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }

            const result= await RationcardService.add(req.body, storeId)
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
            const result=await RationcardService.getById(id, storeId)
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
              const requiredFields = [
        "card_type_id",
        "card_number",
        "card_holder_name",
        "mobile",
        "address",
        "family_member",
      ];

       for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
                        const result= await RationcardService.update(req.body, storeId)
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
            const result=await RationcardService.deleteData(id, storeId)
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