import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = localStorage.getItem("token");

export const roleList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/role/list`,{
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

export const addRole=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/role/add`,data,{
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
   const response=await axios.get(`${apiUrl}/role/getById/${id}`,{
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

export const updateRole=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/role/update`,data,{
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
   const response=await axios.delete(`${apiUrl}/role/delete/${id}`,{
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