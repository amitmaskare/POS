import { HoldAndRetrieveController } from "../controllers/HoldAndRetrieveController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/holdsale/list",HoldAndRetrieveController.list)
route.post("/holdsale",HoldAndRetrieveController.holdsale)
route.post("/retrieveCart",HoldAndRetrieveController.retrieveCart)
route.get("/holdsale/retrieveHoldItem/:id",HoldAndRetrieveController.retrieveHoldItem)

export default route