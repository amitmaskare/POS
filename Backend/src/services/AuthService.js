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
    const { user_id, password } = loginData;

    const user = await CommonModel.getSingle({
      table: "users",
      conditions: { user_id }
    });

    if (!user) throw new Error("Invalid User Id");

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) throw new Error("Invalid Password");

    const role = await CommonModel.getSingle({
      table: "roles",
      conditions: { roleId: user.role }
    });

    let permissions = [];

    // ✅ ADMIN → ALL PERMISSIONS
    if (Number(user.role) === 1 || role?.name === "admin") {
      const allPerms = await CommonModel.getAllData({ table: "permissions" });
      permissions = allPerms.map(p => p.slug_url);
    }
    // ✅ CHECK USER-SPECIFIC PERMISSIONS FIRST
    else {
      // Check if user has custom permissions
      const userPermissionsQuery = `
        SELECT p.slug_url
        FROM user_permissions up
        JOIN permissions p ON p.permissionId = up.permission_id
        WHERE up.user_id = ?
      `;

      const userPermResult = await CommonModel.rawQuery(
        userPermissionsQuery,
        [user.userId]
      );

      const userPerms = Array.isArray(userPermResult[0])
        ? userPermResult[0]
        : userPermResult;

      // If user has custom permissions, use them
      if (userPerms && userPerms.length > 0) {
        permissions = userPerms.map(p => p.slug_url);
      }
      // Otherwise, fall back to role permissions
      else {
        const rolePermissionsQuery = `
          SELECT p.slug_url
          FROM role_permissions rp
          JOIN permissions p ON p.permissionId = rp.permission_id
          WHERE rp.role_id = ?
        `;

        const rolePermResult = await CommonModel.rawQuery(
          rolePermissionsQuery,
          [user.role]
        );

        const rolePerms = Array.isArray(rolePermResult[0])
          ? rolePermResult[0]
          : rolePermResult;

        permissions = rolePerms.map(p => p.slug_url);
      }
    }

    delete user.password;

    return {
      ...user,
      role_name: role?.name || "admin",
      permissions
    };
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

  userList:async()=>{
    const sql = `
      SELECT
        u.userId,
        u.user_id,
        u.name,
        u.email,
        u.role,
        CASE
          WHEN u.role = 1 THEN 'Admin'
          ELSE COALESCE(r.name, 'Unknown')
        END as roleName,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role = r.roleId
    `;
    const [result] = await pool.promise().query(sql);
    return result;
  },

  add:async(userData)=>{
    const {name, email, role } = userData;
    const hashPassword = await bcrypt.hash('123456', 10);
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

getById:async(userId)=>{
    const result=await CommonModel.getSingle({table:"users",conditions:{userId}})
    return result
},

update:async(data)=>
{
    const {userId,name,email,role}=data
    const result=await CommonModel.updateData({table:"users",data:data,conditions:{userId}})
    return result
},

deleteData:async(userId)=>{
  const result=await CommonModel.deleteData({table:"users",conditions:{userId}})  
  return result
},

};
