import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"  //used to perform CRUD on cookies storder in browser of user throguh server/backend

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//.use are all middlewares
app.use(express.json({limit: "16kb"})) //when data is sent through forms
app.use(express.urlencoded({extended: true, limit: "16kb"}))  //URL data
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)

export { app}