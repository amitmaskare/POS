import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = localStorage.getItem("token");

export const productList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/product/list`,{
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

export const addProduct=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/product/add`,data,{
     headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

  export const categoryWiseSubcategoryData=async(categoryId)=>{
  try{
   const response=await axios.get(`${apiUrl}/subcategory/by-category/${categoryId}`,{
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
   const response=await axios.get(`${apiUrl}/product/getById/${id}`,{
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

  export const updateProduct=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/product/update`,data,{
     headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}
  export const deleteProduct=async(id)=>{
    try{
   const response=await axios.delete(`${apiUrl}/product/delete/${id}`,{
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

  export const supplierList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/supplier/list`,{
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

export const searchProduct=async(data)=>{
  try{
   const response= await axios.post(`${apiUrl}/product/searchProduct`,data,{
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

export const add_product=async(data)=>{
  try{
   const response= await axios.post(`${apiUrl}/product/addProduct`,data,{
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

export const favouriteList=async()=>{
  try{
   const response=await axios.get(`${apiUrl}/product/favouriteList`,{
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

export const looseItemList=async()=>{
  try{
   const response=await axios.get(`${apiUrl}/product/looseItemList`,{
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

export const inventoryList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/product/inventoryList`,{
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

export const addSupplier=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/supplier/add`,data,{
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
export const addStock=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/product/addStock`,data,{
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

