import { PurchaseController } from "../controllers/PurchaseController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"
import { Permission } from "../middleware/Permission.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/purchase/list",PurchaseController.list)
route.post("/purchase/add",PurchaseController.add)
route.get("/purchase/getById/:id",PurchaseController.getById)
route.post("/purchase/update",PurchaseController.update)
route.get('/purchase/generateNextPONumber',PurchaseController.generateNextPONumber)

route.get('/purchase/receiveItems',PurchaseController.receiveItems)
route.post('/purchase/receiveQuantity',PurchaseController.receiveQuantity)
route.get('/purchase/purchaseReport', Permission('view-reports'), PurchaseController.purchaseReport)
export default route