import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const rationcardList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/rationcard/list`,{
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
export const cardTypeList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/card/list`,{
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

export const addRationCard=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/rationcard/add`,data,{
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
   const response=await axios.get(`${apiUrl}/rationcard/getById/${id}`,{
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

  export const updateRationCard=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/rationcard/update`,data,{
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
   const response=await axios.delete(`${apiUrl}/rationcard/delete/${id}`,{
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