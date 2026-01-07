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
route.post("/verify-aadhaarnumber", AuthController.verifyAadhaarNumber);

route.get("/user/list",AuthController.userList)
route.post("/user/add",AuthController.add)
route.get("/user/getById/:id",AuthController.getById)
route.post("/user/update",AuthController.update)
route.delete("/user/delete/:id",AuthController.deleteData)


export default route;
