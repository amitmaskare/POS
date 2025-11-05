import express from "express";
import { PermissionController } from "../controllers/PermissionController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.get("/permission/list", PermissionController.list);
route.post("/permission/add", PermissionController.add);
route.get("/permission/getById/:id",PermissionController.getById)
route.post("/permission/update", PermissionController.update);
route.delete("/permission/delete/:id",PermissionController.deleteData)
export default route;
