import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const HoldList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/holdsale/list`,{
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

export const holdSale=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/holdsale`,data,{
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

export const retrieveHoldSale=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/retrieveCart`,data,{
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

export const retrieveHoldItem=async(id)=>{
    try{
        const response= await axios.get(`${apiUrl}/holdsale/retrieveHoldItem/${id}`,{
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

