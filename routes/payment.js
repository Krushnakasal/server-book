import express from "express"
import { jwtAuth } from "../middleware/jwt.js"
import { payment } from "../controllers/paymentController.js"

const Router= express.Router()
 
Router.post("/create-payment-intent",jwtAuth, payment) 

export default Router