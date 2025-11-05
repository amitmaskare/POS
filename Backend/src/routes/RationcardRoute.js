import { RationcardController } from "../controllers/RationcardController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/rationcard/list",RationcardController.list)
route.post("/rationcard/add",RationcardController.add)
route.get("/rationcard/getById/:id",RationcardController.getById)
route.post("/rationcard/update",RationcardController.update)
route.delete("/rationcard/delete/:id",RationcardController.deleteData)

export default route