import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

// Helper function to get fresh token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const userList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/user/list`,{
           headers: getAuthHeaders(),
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

export const roleList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/role/list`,{
           headers: getAuthHeaders(),
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

export const addUser=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/user/add`,data,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

export const getById=async(id)=>{
    try{
   const response=await axios.get(`${apiUrl}/user/getById/${id}`,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
  }

export const updateUser=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/user/update`,data,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

export const deleteItem=async(id)=>{
    try{
   const response=await axios.delete(`${apiUrl}/user/delete/${id}`,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

export const unbindDevice=async(userId)=>{
  try{
   const response=await axios.post(`${apiUrl}/admin/unbind-device`, { userId }, {
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}