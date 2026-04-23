import { CuponController } from "../controllers/CuponController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/coupon/list",CuponController.list)
route.post("/coupon/add",CuponController.add)
route.get("/coupon/getById/:id",CuponController.getById)
route.post("/coupon/update",CuponController.update)
route.delete("/coupon/delete/:id",CuponController.deleteData)

export default route