import { SubcategoryController } from "../controllers/SubcategoryController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/subcategory/list",SubcategoryController.list)
route.post("/subcategory/add",SubcategoryController.add)
route.get("/subcategory/getById/:id",SubcategoryController.getById)
route.post("/subcategory/update",SubcategoryController.update)
route.delete("/subcategory/delete/:id",SubcategoryController.deleteData)

export default route