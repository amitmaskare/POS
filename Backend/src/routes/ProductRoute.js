import { ProductController } from "../controllers/ProductController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/product/list",ProductController.list)
route.post("/product/add",ProductController.add)
route.get("/product/getById/:id",ProductController.getById)
route.post("/product/update",ProductController.update)
route.delete("/product/delete/:id",ProductController.deleteData)

export default route