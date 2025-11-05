import express from "express";
import { RoleController } from "../controllers/RoleController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.get("/role/list", RoleController.list);
route.post("/role/add", RoleController.add);
route.get("/role/getById/:id",RoleController.getById)
route.post("/role/update", RoleController.update);
route.delete("/role/delete/:id",RoleController.deleteData)
export default route;
