import React, { useState,useEffect } from "react";
import {useNavigate} from "react-router-dom"
import {
  Card,
  CardHeader,
  CardContent,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Input,
  Typography,
  FormControl,
  Link ,
} from "@mui/material";
import axios from "axios";
import { login } from "../services/authService";


export default function Login({ onLogin }) {
  const [role, setRole] = useState("");
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const[email,setEmail]=useState("")
  const [success,setSuccess]=useState("")
  const[error,setError]=useState("")

 const apiUrl = process.env.REACT_APP_API_URL;
 
 const actionLogin = async () => {
    const loginData = { user_id, password };
    setSuccess(null);
    setError(null);
    try {
     const result= await login(loginData)
      if (result.status === true) {
        setSuccess(result.message);
        const token = result.data.token;
        sessionStorage.setItem("token", token);
        // onLogin();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const generateForgotPasswordLink=async()=>{
    setSuccess(null);
    setError(null);
   const emailData={email}
    try{
      const response=await axios.post(`${apiUrl}/generate-forgot-password-link`,emailData)
       const result=response.data
      if (result.status === true) {
        setSuccess(result.message)
        
      } else {
        setError(result.message);
      }
    }catch(error)
    {
      setError(error.response.data.message || "An unexpected error occured");
    }
  }
  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #e3f2fd, #ede7f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 2, boxShadow: 3 }}>
        <CardHeader
          title={
            <Typography variant="h5" align="center" fontWeight="bold">
              POS System
            </Typography>
          }
          subheader={
            <Typography variant="body2" align="center" color="text.secondary">
              Sign in to access your point of sale system
            </Typography>
          }
        />
        {error && (
                    <h5 className="text-center alert alert-danger">{error}</h5>
                  )}
                  {success && (
                    <h5 className="text-center alert alert-success">
                      {success}
                    </h5>
                  )}
        <CardContent>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Role */}
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="1">Admin</MenuItem>
                <MenuItem value="2">Cashier</MenuItem>
                <MenuItem value="3">Manager</MenuItem>
              </Select>
            </FormControl>

            {/* Username */}
            <FormControl fullWidth>
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input type="text" placeholder="Enter your username" required autoComplete="off" onChange={(e)=>setUser_id(e.target.value)}/>
            </FormControl>

            {/* Password */}
            <FormControl fullWidth>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input id="password" type="password" placeholder="Enter your password" required autoComplete="off" onChange={(e)=>setPassword(e.target.value)}/>
            </FormControl>
             {/* Forgot Password link */}
            <Typography
              variant="body2"
              align="right"
              sx={{ marginTop: "-0.5rem" }}
            >
              <Link
                href="#"
                underline="hover"
                color="primary"
                fontWeight="medium"
                data-bs-toggle="modal" data-bs-target="#exampleModal"
              >
                Forgot Password?
              </Link>
            </Typography>
            {/* Submit Button */}
            <Button type="button" variant="contained" color="primary" fullWidth onClick={actionLogin}>
              Login
            </Button>
          </form>

          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Demo Credentials:
              <br />
              <span style={{ fontFamily: "monospace" }}>cashier/cashier123</span> |{" "}
              <span style={{ fontFamily: "monospace" }}>manager/manager123</span> |{" "}
              <span style={{ fontFamily: "monospace" }}>admin/admin123</span>
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
    
   <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Forgot Password</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
         {error && (
                    <h5 className="text-center text-danger">{error}</h5>
                  )}
                  {success && (
                    <h5 className="text-center text-success">
                      {success}
                    </h5>
                  )}
        <label>Email<span className="text-danger">*</span></label>
        <input type="text" className="form-control" name="email" placeholder="Enter Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" onClick={generateForgotPasswordLink}>Submit</button>
      </div>
    </div>
  </div>
</div>

</>
  );
}
