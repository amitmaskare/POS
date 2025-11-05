import {useState,useEffect} from "react";
import { forgot_password } from "../services/authService";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword()
{
 const[newPassword,setNewPassword]=useState("")
 const[confirmPassword,setConfirmPassword]=useState("")
 const[success,setSuccess]=useState(false)
 const[error,setError]=useState(false)
const navigate=useNavigate()

const changeForgotPassword=async()=>{
    setSuccess(null)
    setError(null)
    const passwordData={newPassword,confirmPassword}
    try{
        const result=await forgot_password(passwordData)
       
        if(result.success===true)
        {
            setSuccess(result.message)
           setTimeout(() => navigate("/login"), 2000);
        }else{
            setError(result.message)
        }
    }catch(error)
    {
    setError(error.response?.data?.message || error.message);
    }
}
    return(
        <>
        <div className="container py-5">
        <div className="row  d-flex justify-content-center align-content-center w-50 shadow-lg p-5 gy-3">
            <h2 className="text-center">Forgot Password</h2>
            {error && (
               <h5 className="text-center text-danger">{error}</h5>
            )}
            {success && (
               <h5 className="text-center text-success">{success}</h5>
            )}
           <label htmlFor="">New Password<span className="text-danger">*</span></label>
           <input type="password" className="form-control" onChange={(e)=>setNewPassword(e.target.value)}/>
           <label htmlFor="">Confirm Password<span className="text-danger">*</span></label>
           <input type="password" className="form-control" onChange={(e)=>setConfirmPassword(e.target.value)}/>
           <button type="button" className="btn btn-primary" onClick={changeForgotPassword}>Submit</button>
        </div>
        </div>
        </>
    )
}