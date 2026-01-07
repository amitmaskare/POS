import { ReturnController } from "../controllers/ReturnController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.post("/return/scanInvoice",ReturnController.scanInvoice)
route.post("/return/scanProduct",ReturnController.scanProduct)
route.post("/return/confirmReturn",ReturnController.confirmReturn)
route.post("/return/confirmExchange",ReturnController.confirmExchange)
route.get("/return/list",ReturnController.list)
route.get("/return/getReturnById/:id",ReturnController.getReturnById)
route.get("/return/saleReturnById/:id",ReturnController.saleReturnById)
export default route