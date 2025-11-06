import { CuponController } from "../controllers/CuponController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/cupon/list",CuponController.list)
route.post("/cupon/add",CuponController.add)
route.get("/cupon/getById/:id",CuponController.getById)
route.post("/cupon/update",CuponController.update)
route.delete("/cupon/delete/:id",CuponController.deleteData)

export default route