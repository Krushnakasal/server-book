

import express from "express";
import {
  createuser,
  getusers,
  getCart,
  addToCart,
  decrementCartItem,
  removeCartItem,
  loginuser,
  updateuser,
  userActivity,
  Alluser,
  getAllUserOrders,
  updateOrderStatus,
  cancelOrder,
  orderDelete,
  sendOtp,
  forgotPassword,
  verifyOtp,
  SendOtp,
  resetPassword
} from "./../controllers/usersController.js";

import { jwtAuth } from "../middleware/jwt.js";

const router = express.Router();

router.post("/user", createuser);
router.post('/send-otp', sendOtp);
router.post('/send/otp', SendOtp);
router.post('/reset-password',resetPassword)
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post("/login",loginuser)
router.put("/user/:id",jwtAuth, updateuser)
router.get("/alluser",jwtAuth,Alluser)
router.get("/getuser/:id", jwtAuth, getusers);
router.get("/user/activity",jwtAuth, userActivity)
router.get("/user/all-orders",jwtAuth,getAllUserOrders)
router.put("/user/order/cancel/:id",jwtAuth,cancelOrder)
router.put("/update-order/:orderId",jwtAuth,updateOrderStatus)
router.get("/user/cart", jwtAuth, getCart);
router.post("/cart/add/:id", jwtAuth, addToCart);
router.post("/cart/decrement/:id", jwtAuth, decrementCartItem);
router.delete("/cart/remove/:id", jwtAuth, removeCartItem);
router.delete("/user/order/:id",jwtAuth,orderDelete)

export default router;


