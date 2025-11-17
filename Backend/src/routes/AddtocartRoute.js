import express from "express";
import { AddtocartController } from "../controllers/AddtocartController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.get("/addtocart/list", AddtocartController.list);
route.post("/addtocart/add", AddtocartController.add);
route.delete("/addtocart/delete/:id",AddtocartController.deleteData)
export default route;
