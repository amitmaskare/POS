import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"
import  {SupplierController}  from "../controllers/SupplierController.js";

const route=express.Router()

route.use(AuthMiddleware)

route.get("/supplier/list",SupplierController.list)
route.post("/supplier/add",SupplierController.add)
route.get("/supplier/getById/:id",SupplierController.getById)
route.post("/supplier/update",SupplierController.update)
route.delete("/supplier/delete/:id",SupplierController.deleteData)

export default route