import express from "express";
import { StoreController } from "../controllers/StoreController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.get("/store/list", StoreController.list);
route.post("/store/add", StoreController.add);
route.get("/store/getById/:id",StoreController.getById)
route.post("/store/update", StoreController.update);
route.delete("/store/delete/:id",StoreController.deleteData)
export default route;
