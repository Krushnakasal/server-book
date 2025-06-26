// ✅ Backend: routes/paymentController.js
import dotenv from "dotenv";
import Stripe from "stripe";
import Book from "../models/book.schema.js";
import User from "../models/user.schema.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const payment = async (req, res) => {
  try {
    const { itemId, price, quantity, image, title } = req.body;

    if (!itemId || !price || !quantity || !image || !title) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const product = await Book.findById(itemId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(price) * 100),
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        itemId,
        price,
        image,
        title,
        quantity: quantity.toString(),
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Backend: routes/orderController.js
export const saveOrder = async (req, res) => {
  try {
    const { itemId, price, quantity, image, title, total, paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "PaymentIntent ID is required." });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ Step 1: Confirm paymentIntent from Stripe server
    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!payment || payment.status !== 'succeeded') {
      return res.status(400).json({ error: "Payment not completed. Order not saved." });
    }

    // ✅ Step 2: Save order only if payment succeeded
    user.orders.push({
      itemId,
      title,
      image,
      price,
      quantity,
      total,
      paymentId: paymentIntentId,
      orderStatus: "pending",
    });

    await user.save();
    return res.status(200).json({ msg: "Order saved successfully." });
  } catch (error) {
    console.error("Save Order Error:", error.message);
    return res.status(500).json({ error: "Failed to save order." });
  }
};
