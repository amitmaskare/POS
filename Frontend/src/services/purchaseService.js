import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = localStorage.getItem("token");

export const purchaseList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/purchase/list`,{
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

export const generateNextPONumber=async()=>{
   try{
        const response= await axios.get(`${apiUrl}/purchase/generateNextPONumber`,{
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

export const createPurchase=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/purchase/add`,data,{
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
   const response=await axios.get(`${apiUrl}/purchase/getById/${id}`,{
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

   export const updatePurchase=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/purchase/update`,data,{
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


export const receiveItems=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/purchase/receiveItems`,{
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

export const receiveQuantity=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/purchase/receiveQuantity`,data,{
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