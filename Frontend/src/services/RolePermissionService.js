import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = localStorage.getItem("token");

export const rolePermissionList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/rolepermission/list`,{
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
   const response=await axios.get(`${apiUrl}/rolepermission/getById/${id}`,{
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

export const giveRolePermission=async(data)=>{
  try{
   const response=await axios.post(`${apiUrl}/rolepermission/giveRolePermission`,data,{
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

