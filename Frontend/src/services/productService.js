import axios from "axios"
//const apiUrl= process.env.REACT_APP_API_URL
const apiUrl= 'http://localhost:4000/api'
const token = sessionStorage.getItem("token");

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