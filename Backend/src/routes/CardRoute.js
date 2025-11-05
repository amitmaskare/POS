import { CardController } from "../controllers/CardController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/card/list",CardController.list)
route.post("/card/add",CardController.add)
route.get("/card/getById/:id",CardController.getById)
route.post("/card/update",CardController.update)
route.delete("/card/delete/:id",CardController.deleteData)

export default route