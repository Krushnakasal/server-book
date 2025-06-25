import express from "express";
import BookModel from "../models/book.schema.js"; 
import dotenv from "dotenv";
dotenv.config();


const Bookproduct = async (req, res) => {
  try {
    const { title, category, author, price, image } = req.body;

    if (!title || !category || !author || !price || !image) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const newBook = new BookModel({
      title,
      category,
      author,
      price,
      image,
    });

    await newBook.save();

    res.status(201).json({ msg: "Book product added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


const getBooks = async (req, res) => {
  try {
    const allBooks = await BookModel.find();
    res.status(200).json(allBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const onebook= async (req,res)=>{
  try {
      const bookId = await BookModel.findById(req.params.id)
      
       if(!bookId){
        res.status(400).json({msg:"book id not found"})
       }
      res.status(200).json({msg:"sucecess",bookId})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"internal server error"})
  }
}

const Editbook =async (req,res)=>{
  try {
     const id = req.params.id
     const { title ,category,author,price,image} =req.body
     const book = await BookModel.findById(id)
      if(!book){
        res.status(400).json({msg:"Book not found"})
      }
    if(!req.body){
      res.status(401).json({msg:"body is missing"})
    }
    if(image) book.image = image
    if(price) book.price = price
    if(author) book.author = author
    if(category) book.category = category
    if(title) book.title = title

   const  updatebook = await book.save()
    res.status(200).json({msg:"book is updated succesfuly",updatebook})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg:"internal server error"})
  }
}
const deletebook = async (req,res)=>{
try {
  const id= req.params.id
  const book = await BookModel.findByIdAndDelete(id)
  if(!book){
    res.status(401).json({msg:"books not found"})
  }
  res.status(200).json({msg:"book delete successfuly",book})
} catch (error) {
  console.log(error)
  res.status(500).json({msg:"internal server error"})
}
}

export { Bookproduct, getBooks,onebook,Editbook,deletebook };
