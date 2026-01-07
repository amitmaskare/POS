import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const customerList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/customer/list`,{
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

export const addCustomer=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/customer/add`,data,{
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

export const getById=async(id)=>{
    try{
   const response=await axios.get(`${apiUrl}/customer/getById/${id}`,{
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

  export const updateCustomer=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/customer/update`,data,{
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

 export const deleteItem=async(id)=>{
    try{
   const response=await axios.delete(`${apiUrl}/customer/delete/${id}`,{
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
