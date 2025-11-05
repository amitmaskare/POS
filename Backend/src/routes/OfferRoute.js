import { OfferController } from "../controllers/OfferController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/offer/list",OfferController.list)
route.post("/offer/add",OfferController.add)
route.get("/offer/getById/:id",OfferController.getById)
route.post("/offer/update",OfferController.update)
route.delete("/offer/delete/:id",OfferController.deleteData)

export default route