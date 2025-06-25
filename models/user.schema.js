import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true
  },
  password: {
    type: String,
    required:true
  },
  adress:{
    type:String,
  },
   isadmin:{
      type:String,
      default:"user"
  },
  cart: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book" // ✅ Case-sensitive, must match Book model name exactly
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  orders: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    bookId: {
      type: String
    },
    price: {
      type: String
    },
    image: {
      type: String
    },
    title: {
      type: String
    },
    quantity: {
      type: Number,
      default: 1
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "Cancelled"], // all lowercase
      default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
  }],
 

});

export default mongoose.model("User", UserSchema);
