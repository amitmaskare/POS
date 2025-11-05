import { CategoryController } from "../controllers/CategoryController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/category/list",CategoryController.list)
route.post("/category/add",CategoryController.add)
route.get("/category/getById/:id",CategoryController.getById)
route.post("/category/update",CategoryController.update)
route.delete("/category/delete/:id",CategoryController.deleteData)

export default route