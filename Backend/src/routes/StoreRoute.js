import express from "express";
import { StoreController } from "../controllers/StoreController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
const route = express.Router();

route.use(AuthMiddleware);
route.get("/stores/list", StoreController.list);
route.post("/stores/add", StoreController.add);

export default route;
