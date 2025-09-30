import express from "express";
import cors from "cors";
import connection from "./config.js";
import dotenv from "dotenv";
import userRoute from "../src/routes/userRoute.js";
import StoreRoute from "../src/routes/StoreRoute.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", userRoute);
app.use("/api", StoreRoute);
export default app;
