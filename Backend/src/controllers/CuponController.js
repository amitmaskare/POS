import { CuponService } from "../services/CuponService.js";
import {sendResponse} from "../utils/sendResponse.js"


export const CuponController={
    list:async(req,resp)=>{
        try{
            const result=await CuponService.list()
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
            const{cupon_code,discount}=req.body
            if(!cupon_code)
            {
                return sendResponse(resp,false,400,"cupon_code field is required")
            }
            if(!discount)
            {
                return sendResponse(resp,false,400,"discount field is required")
            }
            const result= await CuponService.add(req.body)
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"Something went wrong")
            }
            return sendResponse(resp,true,201,"Cupon added successful",result)
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
            const result=await CuponService.getById(id)
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
             const {id,cupon_code,discount}=req.body
                        if(!id)
                        {
                            return sendResponse(resp,false,400,"id field is reuired")
                        }
                        if(!cupon_code)
                        {
                            return sendResponse(resp,false,400,"cupon_code field is required")
                        }
                        if(!discount)
                        {
                            return sendResponse(resp,false,400,"discount field is required")
                        }
                        const result= await CuponService.update(req.body)
                        if(!result)
                        {
                            return sendResponse(resp,false,400,"Something went wrong")
                        }
                        return sendResponse(resp,true,201,"Cupon updated successful")
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)

        }
    },
    deleteData:async(req,resp)=>{
        try{
            const {id}=req.params
            const result=await CuponService.deleteData(id)
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