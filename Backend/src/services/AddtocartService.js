import { CommonModel } from "../models/CommonModel.js";


export const AddtocartService={

    list:async(userId)=>{
        const result=await CommonModel.getAllData({table:'add_to_cart',conditions:{userId:userId}})
        return result
    },
    
    add:async(data)=>{
       
       
        const result=await CommonModel.insertData({table:"add_to_cart",data:data})
        return result;
    },
    
    deleteData:async(id)=>{
         const result= await CommonModel.deleteData({table:"add_to_cart",conditions:{id}})
        return result;
    },
   
}