import { AuthModel } from "../models/AuthModel.js";
import { CommonModel } from "../models/CommonModel.js";
import bcrypt from "bcrypt";
import pool from "../config.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const AuthService = {

  getNextUserId:async()=> {
  const [rows] = await pool.promise().query("SELECT MAX(user_id) as maxId FROM users");
  return (rows[0].maxId || 999) + 1; 
  },

  signup: async (userData) => {
  
      const {name, email, password, role } = userData;
      const checkDuplicateEmail="email.ocom"
      const hashPassword = await bcrypt.hash(password, 10);
      const user_id= await AuthService.getNextUserId();
      const data = {
        user_id: user_id,
        name: name,
        email: email,
        password: hashPassword,
        role: role,
        created_at: new Date(),
      };
      const result = await CommonModel.insertData({
        table: "users",
        data: data,
      });
      return result;
  },

  loginByPassword: async (loginData) => {

    const{user_id,password}=loginData
    const user= await CommonModel.getSingle({table:'users',conditions:{user_id},})
    if(!user)
    {
      throw new Error("Invalid User Id")
    }
    const checkPassword=await bcrypt.compare(password,user.password)
    if(!checkPassword)
    {
      throw new Error("Invalid Password")
    }
    return user
  },

  Profile: async (userId) => {
    const user = await AuthModel.getById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    return user;
  },

  updateprofile: async (userId, name, email) => {
    try {
      const sql = "UPDATE users SET name=? ,email=? WHERE userId=?";
      const [result] = await pool.promise().query(sql, [name, email, userId]);
      if (result.affectedRows === 0) {
        throw new Error("Profile update failed");
      }
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  },

  resetPassword: async (
    userId,
    currentPassword,
    newPassword,
    confirmPassword
  ) => {
    const user = await AuthModel.getById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    const oldPassword = await bcrypt.compare(currentPassword, user.password);
    if (!oldPassword) {
      throw new Error("Current Password Incorrect");
    }
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Password does not match");
    }

    const new_password = await bcrypt.hash(newPassword, 10);
    try {
      const sql = "UPDATE users SET password = ? WHERE userId = ?";
      const [result] = await pool.promise().query(sql, [new_password, userId]);
      if (result.affectedRows === 0) {
        throw new Error("Password update failed");
      }
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  },

  generateForgotPasswordLink: async (email) => {
    const user = await AuthModel.getByEmail(email);
    if (!user) {
      throw new Error("checkEmail");
    }
   // const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
   const encodedEmail = encodeURIComponent(email);
    const link = `${process.env.CLIENT_URL}/forgot-password?email=${encodedEmail}`;
    return link;
  },

  forgotPassword: async (token, newPassword, confirmPassword) => {
    try {
      // const decode = jwt.verify(token, JWT_SECRET);
      // const email = decode.email;
       const email =token;
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Password does not match");
      }
      const new_password = await bcrypt.hash(newPassword, 10);
      const result = await CommonModel.updateData({
        table: "users",
        data: { password: new_password },
        conditions: { email },
      });
      if (result === 0) {
        throw new Error("Something went wrong");
      }
    } catch (err) {
      throw new Error("Error : " + err.message);
    }
  },
};
