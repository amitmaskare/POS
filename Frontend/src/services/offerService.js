import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const offerList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/offer/list`,{
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

export const add=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/offer/add`,data,{
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
        const response= await axios.get(`${apiUrl}/offer/getById/${id}`,{
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
export const update=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/offer/update`,data,{
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
        const response= await axios.delete(`${apiUrl}/offer/delete/${id}`,{
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

export const productWithOffer=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/offer/productWithOffer`,{
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



