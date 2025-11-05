import { PackageController } from "../controllers/PackageController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/package/list",PackageController.list)
route.post("/package/add",PackageController.add)
route.get("/package/getById/:id",PackageController.getById)
route.post("/package/update",PackageController.update)
route.delete("/package/delete/:id",PackageController.deleteData)

export default route