import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  price: {
    type: Number
  },
  image: {
    type: String
  }
});

export default mongoose.model("Book", BookSchema);
