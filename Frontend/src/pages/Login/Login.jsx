import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  FormControl,
  TextField,
  Box,
  Link,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { LuStore } from "react-icons/lu";
import { login, forgot_password } from "../../services/authService";


export default function Login({ onLogin }) {
 const navigate = useNavigate();

  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
 
  useEffect(() => {
  if (error || success) {
    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [error, success]);

 const actionLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await login({ user_id, password });

      if (result?.status) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        onLogin?.();
        navigate("/dashboard");
      } else {
        setError(result?.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

   const handleForgotPassword=async()=>{
      setSuccess("");
      setError("");
     const emailData={email}
      try{
        const result=await forgot_password(emailData)
         result.status === true ? setSuccess(result.message):setError(result.message);
       }catch(error){
        setError(error?.response?.data?.message || "An unexpected error occured");
      }
    }
 return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #ede7f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", borderRadius: 4, boxShadow: 4 }}>
        <CardHeader
          title={
            <Box textAlign="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 1,
                  borderRadius: "50%",
                  bgcolor: "#E8F0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LuStore size={30} color="#5A8DEE" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                POS System
              </Typography>
            </Box>
          }
          subheader={
            <Typography align="center" variant="body2" color="text.secondary">
              Sign in to access your point of sale system
            </Typography>
          }
        />

        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box component="form" mt={2} onSubmit={actionLogin}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Username"
                value={user_id}
                onChange={(e) => setUser_id(e.target.value)}
                required
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 1 }}>
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Typography align="right" variant="body2">
              <Link component="button" onClick={() => setOpenForgot(true)}>
                Forgot Password?
              </Link>
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.2 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>

          <Box mt={3} pt={2} borderTop="1px solid #eee">
            <Typography variant="caption" align="center" display="block">
              Demo Credentials<br />
              <code>cashier / cashier123</code> | <code>manager / manager123</code> | <code>admin / admin123</code>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForgot(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleForgotPassword}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

