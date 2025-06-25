import express from "express"
import { Bookproduct,getBooks ,onebook ,Editbook,deletebook} from "../controllers/booksController.js"
import { jwtAuth } from "../middleware/jwt.js"
const Router = express.Router()

Router.post("/books",jwtAuth,Bookproduct)
Router.get("/books", getBooks)
Router.get("/getbook/:id",jwtAuth, onebook)
Router.put("/book/:id",jwtAuth, Editbook)
Router.delete("/book/delete/:id",jwtAuth,deletebook)



export default Router