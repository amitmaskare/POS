import { AuthController } from "../controllers/AuthController.js";

import express from "express"

const route=express.Router()

route.post('/login',AuthController.login)


export default route