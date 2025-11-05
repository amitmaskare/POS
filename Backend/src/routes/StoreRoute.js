import express from "express";
import { StoreController } from "../controllers/StoreController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware)
route.get("/stores/list", StoreController.list);
route.post("/stores/add", StoreController.add);
route.get("/stores/getById/:id",StoreController.getById)
route.post("/stores/update", StoreController.update);
route.delete("/stores/delete/:id",StoreController.deleteData)
export default route;
