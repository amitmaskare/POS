import { ProductController } from "../controllers/ProductController.js";
import express from "express"
import AuthMiddleware from "../middleware/AuthMiddleware.js"
import {Permission} from "../middleware/Permission.js"

const route=express.Router()

route.use(AuthMiddleware)

route.get("/product/list",Permission('view-product'),ProductController.list)
route.post("/product/add",Permission('add-product'),ProductController.add)
route.get("/product/getById/:id",ProductController.getById)
route.post("/product/update",ProductController.update)
route.delete("/product/delete/:id",ProductController.deleteData)
route.post("/product/searchProduct",ProductController.searchProduct)
route.post("/product/searchProductList",ProductController.searchProductList)
route.get("/subcategory/by-category/:categoryId",ProductController.categoryWiseSubcategoryData)
route.post("/product/addProduct",ProductController.addProduct)
route.get("/product/allProductsList",ProductController.allProductsList)
route.get("/product/favouriteList",ProductController.favouriteList)
route.get("/product/looseItemList",ProductController.looseItemList)
route.get("/product/inventoryList",ProductController.inventoryList)
route.post("/product/addStock",ProductController.addStock)
route.get("/product/lowStock", Permission('view-reports'), ProductController.lowStockReport)
route.post("/product/generateLooseBarcode",ProductController.generateLooseBarcode)
route.post("/product/decodeLooseBarcode",ProductController.decodeLooseBarcode)

export default route