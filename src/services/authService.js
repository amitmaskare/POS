import axios from "axios";

const apiUrl= process.env.REACT_APP_API_URL


export const login = async (loginData) => {
  try {
    const response = await axios.post(`${apiUrl}/login`, loginData);
    return response.data;
  } catch (error) {
   console.log(error.response.data.message)
   throw error; 
  }
};

export const forgot_password=async(passwordData)=>{
    try{
         const email = new URLSearchParams(window.location.search).get("email");
        const response=await axios.post(`${apiUrl}/forgot-password?email=${encodeURIComponent(email)}`,passwordData)
        return response.data
    }catch(error)
    {
   console.log(error.response.data.message)
        throw error
    }
}