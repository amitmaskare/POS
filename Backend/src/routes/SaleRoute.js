import { SaleController } from "../controllers/SaleController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/sale/list",SaleController.list)
route.post("/sale/checkoutSale",SaleController.checkoutSale)
route.post("/sale/verifyPayment",SaleController.verifyPayment)
route.post("/sale/createQRPayment",SaleController.createQRPayment)
route.post("/sale/checkQRPaymentStatus",SaleController.checkQRPaymentStatus)
route.post("/sale/confirmQRPayment",SaleController.confirmQRPayment)
route.get("/sale/getSaleById/:id",SaleController.getSaleById)
route.get("/sale/sale_report",SaleController.saleReport)
route.get("/sale/transactionList",SaleController.transactionList)
export default route