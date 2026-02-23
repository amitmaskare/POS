import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

// Helper function to get fresh token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const rolePermissionList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/rolepermission/list`,{
           headers: getAuthHeaders(),
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

// Get all permissions grouped by module
export const getAllPermissionsGrouped = async () => {
  try {
    const response = await axios.get(`${apiUrl}/rolepermission/permissions-grouped`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getById=async(id)=>{
    try{
   const response=await axios.get(`${apiUrl}/rolepermission/getById/${id}`,{
     headers: getAuthHeaders(),
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
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
}

// Update role permissions (toggle-based)
export const updateRolePermissions = async (role_id, permission_ids) => {
  try {
    const response = await axios.post(
      `${apiUrl}/rolepermission/update`,
      { role_id, permission_ids },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

