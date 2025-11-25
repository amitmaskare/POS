import axios from "axios"
const apiUrl= process.env.REACT_APP_API_URL

const token = sessionStorage.getItem("token");

export const userList=async()=>{
    try{
        const response= await axios.get(`${apiUrl}/user/list`,{
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