import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

// Helper function to get fresh token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const storeList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/store/list`,{
           headers: getAuthHeaders(),
        })
        return response.data
    }catch(error)
    {
      throw error
    }
}

export const addStore=async(data)=>{
  try{
    const formData = new FormData();
    formData.append('store_name', data.store_name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('type', data.type);
    formData.append('location', data.location || '');
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    const response=await axios.post(`${apiUrl}/store/add`,formData,{
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
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
   const response=await axios.get(`${apiUrl}/store/getById/${id}`,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
  }

export const updateStore=async(data)=>{
  try{
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('store_name', data.store_name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('type', data.type);
    formData.append('location', data.location || '');
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    const response=await axios.post(`${apiUrl}/store/update`,formData,{
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
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
   const response=await axios.delete(`${apiUrl}/store/delete/${id}`,{
     headers: getAuthHeaders(),
   })
   return response.data
  }catch(error)
  {
    throw error
  }
  }