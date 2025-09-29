import { AuthModel } from "../models/AuthModel.js";
import bcrypt from "bcrypt";
import pool from "../config.js";
export const AuthService = {
  loginByPassword: async (password) => {
    const users = await AuthModel.findByPassword();
    for (let user of users) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const { password: _, ...safeUser } = user;
        return safeUser;
      }
    }

    throw new Error("checkPassword");
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

  forgotPassword: async (email) => {
    const user = await AuthModel.getByEmail(email);
    if (!user) {
      throw new Error("checkEmail");
    }
    const password = await bcrypt.hash("123456", 10);
    try {
      const sql = "UPDATE users SET password=? WHERE email=?";
      const result = await pool.promise().query(sql, [password, email]);
      if (result.affectedRows === 0) {
        throw new Error("Something went Wrong");
      }
      return user;
    } catch (err) {
      console.log("Error :", err);
      throw err;
    }
  },
};
