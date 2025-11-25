import {AddtocartService} from "../services/AddtocartService.js"
import {sendResponse} from "../utils/sendResponse.js"
import { CommonModel } from "../models/CommonModel.js";

export const AddtocartController={

 list:async(req,resp)=>{
    try{
        const userId = req.user.userId;
        const result=await AddtocartService.list(userId)
        if(!result || result.length===0)
        {
            return sendResponse(resp,false,400,"No Data Found")
        }
        return sendResponse(resp,true,200,"Fetch data successful")
    }catch(error)
    {
        return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
 },
 add:async(req,resp)=>{
    try{
        const requiredFields=[
            'productId',
            'quantity',
        ]
        for(let fields of requiredFields)
        {
            if(!req.body[fields])
            {
                return sendResponse(resp,false,400,`${fields} is required`)
            }
        }
         const{productId,quantity}=req.body
         const userId=req.user.userId;
          let result;
         const checkItem=await CommonModel.getSingle({table:'add_to_cart',conditions:{userId,productId}})
        
         if(!checkItem)
         {
             const saveData={
            userId:userId,
            productId:productId,
            quantity:quantity
        }
         result= await AddtocartService.add(saveData)
         }
         else{
           const updateData = {
        quantity: checkItem.quantity + quantity, 
      };
      const id=checkItem.id
         result= await CommonModel.updateData({table:'add_to_cart',data:updateData,conditions:{id}})
         }
       
        if(!result)
        {
            return sendResponse(resp,false,400,"Something went wrong")
        }
        return sendResponse(resp,true,201,"Add to cart successfully")
    }catch(error)
    {
        return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
 },
 
  
  deleteData:async(req,resp)=>{
    try{
        const{id}=req.params
        const result=await AddtocartService.deleteData(id)
        return sendResponse(resp,true,200,"Item deleted successful")
    }catch(error)
    {
        return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
 },


}