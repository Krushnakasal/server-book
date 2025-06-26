import express from "express"
import { jwtAuth } from "../middleware/jwt.js"
import { payment,saveOrder } from "../controllers/paymentController.js"

const Router= express.Router()
 
Router.post("/create-payment-intent",jwtAuth, payment) 
Router.post('/save-order', jwtAuth, saveOrder);

export default Router