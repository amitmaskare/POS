import { CardService } from "../services/CardService.js";
import {sendResponse} from "../utils/sendResponse.js"
import { CommonModel } from "../models/CommonModel.js";

export const CardController={
    list:async(req,resp)=>{
       
        try{
            const result=await CardService.list()
           
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
            const{type,items}=req.body
            if(!type)
            {
                return sendResponse(resp,false,400,"type field is required")
            }
            if (!items || !Array.isArray(items)) {
      return sendResponse(resp, false, 400, "Items must be a JSON array");
    }
        const checkCardType= await CommonModel.getSingle({table:"cards"})
        if(!checkCardType || checkCardType.length===0)
        {
            return sendResponse(resp,false,400,"Card name already exits")
        }
            const saveData={
                type:type,
                 items: JSON.stringify(items),
                created_at:new Date(),
            }
            const result= await CardService.add(saveData)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Card added successful",result)
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
            const result=await CardService.getById(id)
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
             const {id,type,items}=req.body
                        if(!id)
                        {
                            return sendResponse(resp,false,400,"id field is reuired")
                        }
                        if(!type)
                        {
                            return sendResponse(resp,false,400,"type field is required")
                        }
                         if (!items || !Array.isArray(items)) {
      return sendResponse(resp, false, 400, "Items must be a JSON array");
    }
    
                        const result= await CardService.update(req.body)
                        if(!result)
                        {
                            return sendResponse(resp,false,400,"Something went wrong")
                        }
                        return sendResponse(resp,true,201,"Card updated successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)

        }
    },
    deleteData:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await CardService.deleteData(id)
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