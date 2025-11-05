import { PurchaseController } from "../controllers/PurchaseController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/purchase/list",PurchaseController.list)
route.post("/purchase/add",PurchaseController.add)
route.get("/purchase/getById/:id",PurchaseController.getById)
route.post("/purchase/update",PurchaseController.update)
route.delete("/purchase/delete/:id",PurchaseController.deleteData)

export default route