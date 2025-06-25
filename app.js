import express from "express"
import db from "./db/db.js"
 db()
const app = express()
import dotenv from 'dotenv'
import bodyParser from "body-parser"
import cors from "cors"
import booksproduct from "./routes/books.js"
import users from "./routes/user.js"
import admin from "./routes/admin.js"
import payment from "./routes/payment.js"
dotenv.config();
const port = process.env.PORT || 4000


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true})) 

app.use("/api",booksproduct)
app.use("/api", users)
app.use("/api",payment)
app.use("/api",admin)

app.listen(port, ()=>{
    console.log(`youre server start http://loacalhost:${port}`)
})