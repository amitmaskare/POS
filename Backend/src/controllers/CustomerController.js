import { CustomerService } from "../services/CustomerService.js";
import {sendResponse} from "../utils/sendResponse.js"
import { getStoreIdFromRequest } from "../utils/storeHelper.js";


export const CustomerController={
    list:async(req,resp)=>{
        try{
            const storeId = getStoreIdFromRequest(req);
            const result=await CustomerService.list(storeId)
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
        "name",
        "email",
        "phone",
        "address",
      ];

       for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
       // Check if email already exists
    const emailExists = await CustomerService.checkEmail(req.body.email);
    if (emailExists) {
      return sendResponse(resp, false, 400, "Email already exists");
    }

    // Check if phone already exists
    const phoneExists = await CustomerService.checkPhone(req.body.phone);
    if (phoneExists) {
      return sendResponse(resp, false, 400, "Phone number already exists");
    }
            const result= await CustomerService.add(req.body, storeId)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Customer added successful",result)
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
            const result=await CustomerService.getById(id, storeId)
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
                "id",
        "name",
        "email",
        "phone",
        "address",
      ];

       for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
                        const result= await CustomerService.update(req.body, storeId)
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
            const result=await CustomerService.deleteData(id, storeId)
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