import express from "express";
import { PaymentController } from "../controllers/PaymentController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.post("/payment", PaymentController.payment);

export default route;
