import express from "express";
import cors from "cors";
import connection from "./config.js";
import dotenv from "dotenv";
import userRoute from "../src/routes/userRoute.js";
import StoreRoute from "../src/routes/StoreRoute.js";
import RoleRoute from "../src/routes/RoleRoute.js"
import PermissionRoute from "../src/routes/PermissionRoute.js"
import RolePermissionRoute from "../src/routes/RolePermissionRoute.js"
import CategoryRoute from "../src/routes/CategoryRoute.js"
import SubcategoryRoute from "../src/routes/SubcategoryRoute.js"
import CustomerRoute from "../src/routes/CustomerRoute.js"
import PackageRoute from "../src/routes/PackageRoute.js"
import SupplierRoute from "../src/routes/SupplierRoute.js"
import ProductRoute from "../src/routes/ProductRoute.js"
import PurchaseRoute from "../src/routes/PurchaseRoute.js"
import CardRoute from "../src/routes/CardRoute.js"
import RationcardRoute from "../src/routes/RationcardRoute.js"

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", userRoute);
app.use("/api", StoreRoute);
app.use("/api", RoleRoute);
app.use("/api",PermissionRoute)
app.use("/api",RolePermissionRoute)
app.use("/api",CategoryRoute)
app.use("/api",SubcategoryRoute)
app.use("/api",CustomerRoute)
app.use("/api",PackageRoute)
app.use("/api",SupplierRoute)
app.use("/api",ProductRoute)
app.use("/api",PurchaseRoute)
app.use("/api",RationcardRoute)
app.use("/api",CardRoute)
app.use('/public/uploads', express.static('public/uploads'));

export default app;
