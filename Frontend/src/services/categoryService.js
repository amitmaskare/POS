import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = localStorage.getItem("token");

export const categoryList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/category/list`,{
           headers: {
          Authorization: `Bearer ${token}`,
        },
        })
       
        return response.data
    }catch(error)
    {
      throw error
    }
}

export const addCategory=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/category/add`,data,{
     headers: {
          Authorization: `Bearer ${token}`,
        },
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

export const addSubcategory=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/subcategory/add`,data,{
     headers: {
          Authorization: `Bearer ${token}`,
        },
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}