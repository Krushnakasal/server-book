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
    const { itemId, price, quantity, image ,title} = req.body;

    if (!itemId || !price || !quantity || !image|| !title) {
      return res
        .status(400)
        .json({ error: "itemId, price, quantity, and image are required." });
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

    // ✅ Push extra details (productName, productImage, userName)
   user.orders.push({
      itemId: itemId,
      title:title,
      image:image,
      price: price,
      quantity: quantity,
      orderStatus: "pending",
    });

    
    await user.save();
    return res
      .status(200)
      .json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
