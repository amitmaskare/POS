import { AuthController } from "../controllers/AuthController.js";

import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.post("/login", AuthController.login);
route.post(
  "/generate-forgot-password-link",
  AuthController.generateForgotPasswordLink
);
route.post("/forgot-password", AuthController.forgotPassword);


route.use(AuthMiddleware);
route.post("/signup", AuthController.signup);
route.get("/logout", AuthController.logout);
route.get("/profile", AuthController.Profile);
route.post("/update-profile", AuthController.updateprofile);
route.post("/reset-password", AuthController.resetPassword);

export default route;
