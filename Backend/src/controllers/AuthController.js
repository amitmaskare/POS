import { AuthService } from "../services/AuthService.js";
import { sendResponse } from "../utils/sendResponse.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const AuthController = {
  signup: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(
          resp,
          false,
          400,
          "name,email,password field is required"
        );
      }
      const { name, email, password, role } = req.body;
      if (!name) {
        return sendResponse(resp, false, 400, "name field is required");
      }
      if (!email) {
        return sendResponse(resp, false, 400, "email field is required");
      }
      if (!password) {
        return sendResponse(resp, false, 400, "password field is required");
      }
      if (password.length < 6) {
        return sendResponse(
          resp,
          false,
          400,
          "Password must be at least 6 characters long"
        );
      }
      if (!role) {
        return sendResponse(resp, false, 400, "role field is required");
      }
      const result = await AuthService.signup(req.body);
      if (!result) {
        return sendResponse(resp, false, 400, "Something went wrong");
      }
      return sendResponse(resp, true, 201, "Signup Successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  login: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(resp, false, 400, "password is required");
      }
      const { password } = req.body;
      if (!password) {
        return sendResponse(resp, false, 400, "password is required");
      }

      const userData = await AuthService.loginByPassword(password);

      if (!userData) {
        return sendResponse(resp, false, 400, "Invalid Password");
      }
      const token = jwt.sign(
        {
          userId: userData.userId,
          email: userData.email,
          name: userData.name,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      const data = {
        token: `${token}`,
      };
      return sendResponse(resp, true, 200, "Login Successful", data);
    } catch (error) {
      if (error.message === "checkPassword") {
        return sendResponse(resp, false, 400, "Invalid Password");
      } else {
        return sendResponse(resp, false, 500, error.message);
      }
    }
  },

  logout: async (req, resp) => {
    try {
      return sendResponse(resp, true, 200, "Logout Successful");
    } catch (error) {
      return sendResponse(resp, false, 500, error.message);
    }
  },

  Profile: async (req, resp) => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return sendResponse(resp, false, 400, "userId field is required");
      }
      const user = await AuthService.Profile(userId);
      if (!user) {
        return sendResponse(resp, false, 400, "User not found");
      }
      const data = {
        name: user.name,
        email: user.email,
      };
      return sendResponse(resp, true, 200, "Fetch Profile data", data);
    } catch (error) {
      return sendResponse(resp, false, 400, error.message);
    }
  },

  updateprofile: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(resp, false, 400, "name,email field is required");
      }
      const { name, email } = req.body;
      if (!name) {
        return sendResponse(resp, false, 400, "name field is required");
      }
      if (!email) {
        return sendResponse(resp, false, 400, "email field is required");
      }
      const userId = req.user.userId;
      if (!userId) {
        return sendResponse(resp, false, 400, "userId field is required");
      }
      const user = await AuthService.updateprofile(userId, name, email);
      return sendResponse(resp, true, 201, "Profile updated successful");
    } catch (error) {
      return sendResponse(resp, false, 400, error.message);
    }
  },

  resetPassword: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(
          resp,
          false,
          400,
          "currentPassword,newPassword,confirmPassword field is required"
        );
      }
      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword) {
        return sendResponse(
          resp,
          false,
          400,
          "currentPassword field is required"
        );
      }
      if (!newPassword) {
        return sendResponse(resp, false, 400, "newPassword field is required");
      }
      if (!confirmPassword) {
        return sendResponse(
          resp,
          false,
          400,
          "confirmPassword field is required"
        );
      }
      const userId = req.user.userId;
      const user = await AuthService.resetPassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      );

      return sendResponse(resp, true, 201, "Change password successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, error.message);
    }
  },

  generateForgotPasswordLink: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(resp, false, 400, "email field is required");
      }
      const { email } = req.body;
      if (!email) {
        return sendResponse(resp, false, 400, "email field is required");
      }
      const link = await AuthService.generateForgotPasswordLink(email);
      const data = {
        email: link,
      };
      return sendResponse(resp, false, 200, "Please check Email.", data);
    } catch (error) {
      if (error.message === "checkEmail") {
        return sendResponse(resp, false, 400, "Invalid Email Id");
      }
      return sendResponse(resp, false, 500, error.message);
    }
  },

  forgotPassword: async (req, resp) => {
    try {
      // throw new Error(resp.send(req.get("token")));
      if (!req.body) {
        return sendResponse(
          resp,
          false,
          400,
          "newPassword,confirmPasswsowrd field is required"
        );
      }
      const { newPassword, confirmPassword } = req.body;
      if (!newPassword) {
        return sendResponse(resp, false, 400, "newPassword field is required");
      }
      if (!confirmPassword) {
        return sendResponse(
          resp,
          false,
          400,
          "confirmPassword field is required"
        );
      }
      const token = req.get("token");

      const result = await AuthService.forgotPassword(
        token,
        newPassword,
        confirmPassword
      );
      return sendResponse(resp, true, 200, "Change password successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, error.message);
    }
  },
};
