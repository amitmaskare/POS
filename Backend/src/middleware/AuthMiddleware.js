import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const AuthMiddleware = (req, resp, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendResponse(resp, false, 400, "Access denied. No token provided.");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(
      resp,
      false,
      500,
      error.message || "Invalid or expired token."
    );
  }
};

export default AuthMiddleware;
