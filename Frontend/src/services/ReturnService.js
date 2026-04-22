import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const getToken = () => localStorage.getItem("token");

export const scanInvoice=async(invoice_no)=>{
    try{
        const response= await axios.post(`${apiUrl}/return/scanInvoice`,invoice_no,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}

export const scanProduct=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/return/scanProduct`,data,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}

export const confirmReturn=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/return/confirmReturn`,data,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}
export const confirmExchange=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/return/confirmExchange`,data,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}

export const returnList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/return/list`,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}

export const getReturnById=async(id)=>{
    try{
        const response= await axios.get(`${apiUrl}/return/getReturnById/${id}`,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })

        return response.data
    }catch(error)
    {
      throw error
    }
}

export const saleReturnById=async(id)=>{
    try{
        const response= await axios.get(`${apiUrl}/return/saleReturnById/${id}`,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

export const verifyManagerAuth=async(data)=>{
    try{
        const response= await axios.post(`${apiUrl}/return/verifyManagerAuth`,data,{
           headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

