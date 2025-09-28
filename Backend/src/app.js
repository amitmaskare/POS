import express from 'express'
import cors from 'cors'
import connection from './config.js'
import dotenv from "dotenv"
import userRoute from "../src/routes/userRoute.js"
dotenv.config()
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.use('/api',userRoute)
export default app
