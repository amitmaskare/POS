import { CustomerController } from "../controllers/CustomerController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/customer/list",CustomerController.list)
route.post("/customer/add",CustomerController.add)
route.get("/customer/getById/:id",CustomerController.getById)
route.post("/customer/update",CustomerController.update)
route.delete("/customer/delete/:id",CustomerController.deleteData)

export default route