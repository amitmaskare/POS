import { AuthService } from "../services/AuthService.js";
import { sendResponse } from "../utils/sendResponse.js";
import dotenv from "dotenv"
dotenv.config()
export const AuthController={

    login:async(req,resp)=>{
        try{
            if(!req.body)
            {
                return sendResponse(resp,false,400,"password is required")
            }
            const {password}=req.body
            if(!password)
            {
                return sendResponse(resp,false,400,"password is required")
            }
            const userData=await AuthService.loginByPassword(password)
            if(!userData)
            {
                return sendResponse(resp,false,400,"Invalid Password")
            }
            const data={
                userId:userData.userId
            }
            return sendResponse(resp,true,200,"Login Successful",data)

        }catch(error)
        {
            if(error.message==='checkPassword')
            {
                return sendResponse(resp,false,400,"Invalid Password")
            }
            return sendResponse(resp,false,500,error.message)
        }
    }
}
