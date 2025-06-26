import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.schema.js";
import Book from "../models/book.schema.js";
import nodemailer from "nodemailer"
import { jwtAuth } from "../middleware/jwt.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import { generateToken } from "../middleware/jwt.js";

dotenv.config();

// ✅ Create user
const otpStore = new Map();
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  // Simple in-memory storage, for production use Redis or DB
  otpStore.set(email, otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASS,
    },
  });

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Verify your Bookstore Account",
    html: `<h3>Your OTP is: <span style="color:blue">${otp}</span></h3><p>Valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

export const SendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const token = jwt.sign(
      { id: user._id, otp },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS,
      },
    });

    const mailOptions = {
      from: `"BookStore Support" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP is: <b>${otp}</b> (valid for 10 mins)</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "OTP sent", token });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};
export const resetPassword = async (req, res) => {
  const { userId, password } = req.body;
   
  if (!userId || !password)
    return res.status(400).json({ msg: "Missing userId or password" });

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ msg: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ msg: "Failed to reset password" });
  }
};

export const verifyOtp = async (req, res) => {
  const { token, otp } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    res.status(200).json({ msg: "OTP verified", userId: decoded.id });
  } catch (err) {
    return res.status(400).json({ msg: "OTP expired or invalid" });
  }
};

// ✅ 2. Create New User with OTP Validation
// 💌 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

export const createuser = async (req, res) => {
  try {
    const { name, email, password, adress, otp } = req.body;

    // ✅ Validate fields
    if (!name || !email || !password || !otp)
      return res
        .status(400)
        .json({ msg: "All fields (name, email, password, address, otp) are required" });

    // ✅ Check OTP
    const storedOtp = otpStore.get(email);
    if (!storedOtp || parseInt(otp) !== storedOtp) {
      return res.status(401).json({ msg: "Invalid OTP" });
    }

    // ✅ Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists with this email" });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 11);

    // ✅ Save user
    const newUser = new User({ name, email, password: hashedPassword, adress });
    await newUser.save();
    otpStore.delete(email); // Invalidate used OTP

    // ✅ Generate JWT
    const token = generateToken(newUser._id);

    // ✅ Notify Admin
    const adminMailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: "adminbookstore@gmail.com", // or your own email
      subject: "📘 New User Registered!",
      html: `<p><strong>${name}</strong> just registered on the bookstore with email <strong>${email}</strong>.</p>`,
    };

    await transporter.sendMail(adminMailOptions);

    res.status(201).json({ msg: "User registered successfully", token, user: newUser });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// 🔁 Export otpStore if needed outside
export { otpStore };



 // make sure the path is correct

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User with this email does not exist." });
    }

    // Generate reset token with expiry
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Define reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS,
      },
    });

    // Mail content
    const mailOptions = {
      from: `"BookStore Support" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it (valid for 15 minutes):</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <br/><br/>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: 'Reset email sent successfully' });

  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ msg: 'Failed to send reset email' });
  }
};


export const loginuser = async (req, res) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ msg: "Invalid email or password" });

    // Token generation
    const token = generateToken(user._id);

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ msg: "Server error during login" });
  }
};
// ✅ Get user
export const getusers = async (req, res) => {
  try {
    const id = req.user?.id;

    // Check if the ID is missing
    if (!id) {
      return res.status(401).json({ msg: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    res.status(200).json({ msg: "Success", user });
  } catch (error) {
    console.error("Error in getusers:", error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};


export const Alluser = async (req,res)=>{
 try {
   
  const user = await User.find()
  if(!user){
    res.status(401).json({msg:"user not found"})
  }
  res.status(200).json({msg:"ok",user})
 } catch (error) {
   console.log(error)
   res.status(500).json({msg:"Internal server error"})
 }
}
export const updateuser = async (req,res)=>{
  try {
     const id = req.params.id
     const {name, email,adress }= req.body
     const user = await User.findById(id)
      if(!req.body){
        res.status(401).json({msg:" body missing"})
      }
     if(!user){
      res.status(401).json({msg:"User not found"})
     }    
     if(name) user.name = name
     if(email) user.email= email
     if(adress) user.adress=adress

     const updateduser = await user.save()
     res.status(200).json({msg:" updated user succesfully",user:updateduser})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"iternal server error"})
  }
}
export const userActivity = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).populate({
      path: "orders.book", // Make sure this matches your schema exactly (case-sensitive)
      model: "Book",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
 
    res.status(200).json({
      success: true,
      message: "User orders fetched successfully!",
      orders: user.orders
    });
  } catch (error) {
    console.error("Error in userActivity:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ Controller to get all users and all their orders
export const getAllUserOrders = async (req, res) => {
  try {
    const users = await User.find({}, 'name email orders');

    const allOrders = [];

    users.forEach(user => {
      user.orders.forEach(order => {
        allOrders.push({
          orderId: order._id,
          userName: user.name,
          userEmail: user.email,
          name : order.title,
          image: order.image,
          price: order.price,
          quantity: order.quantity,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        });
      });
    });

    res.status(200).json({
      success: true,
      orders: allOrders,
    });
  } catch (error) {
    console.error('Error fetching all user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const user = await User.findOne({ "orders._id": orderId });

    if (!user) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the specific order's status
    const order = user.orders.id(orderId);
    order.orderStatus = "Cancelled";

    await user.save();

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

export const orderDelete = async (req, res) => {
  try {
    const orderId = req.params.id;

    const user = await User.findOne({ "orders._id": orderId });

    if (!user) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Remove the order by ID
    user.orders = user.orders.filter(order => order._id.toString() !== orderId);

    await user.save();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const user = await User.findOne({ 'orders._id': orderId });

    if (!user) return res.status(404).json({ message: 'Order not found' });

    const order = user.orders.id(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found inside user' });

    order.orderStatus = status;
    await user.save();

    res.status(200).json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ View cart with populated book details
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart.book',
      model: "Book",
      select: "title price author image"
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" }); // ✅ Check added
    }

    user.cart = user.cart.filter(item => item.book !== null);

    return res.status(200).json({ cart: user.cart }); // ✅ return added
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error fetching cart" }); // ✅ return added
  }
};


// ✅ Add to cart (or increment quantity)
export const addToCart = async (req, res) => {
  try {
    
   const user = await User.findById(req.user.id);
const bookIndex = user.cart.findIndex(item => item.book.toString() === req.params.id);

if (bookIndex > -1) {
  // Book already exists, just increase quantity
  user.cart[bookIndex].quantity += 1;
} else {
  // Book not in cart, add it
  user.cart.push({ book: req.params.id, quantity: 1 });
}

await user.save();
    res.status(200).json({ msg: "Cart updated", cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to add/increment book" });
  }
};

// ✅ Decrement cart item quantity
export const decrementCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const  bookId  = req.params.id;

    const cartItem = user.cart.find(
      (item) => item.book.toString() === bookId
    );

    if (cartItem) {
      if (cartItem.quantity > 1) {
        cartItem.quantity -=1;
      } else {
        return res.status(400).json({ msg: "Quantity cannot be less than 1" });
        
      }

      await user.save();
      res.status(200).json({ msg: "Quantity updated", cart: user.cart });
    } else {
      res.status(404).json({ msg: "Item not found in cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to decrement quantity" });
  }
};

// ✅ Remove cart item
export const removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const  bookId  = req.params.id

    user.cart = user.cart.filter(
      (item) => item.book.toString() !== bookId
    );

    await user.save();
    res.status(200).json({ msg: "Item removed", cart: user.cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Failed to remove item" });
  }
};
