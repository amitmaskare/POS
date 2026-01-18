import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const checkout_sale=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/sale/checkoutSale`,data,{
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

export const verifyPayment=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/sale/verifyPayment`,data,{
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

export const saleList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/sale/list`,{
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

export const getSaleById=async(id)=>{
    try{
        const response= await axios.get(`${apiUrl}/sale/getSaleById/${id}`,{
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


