import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"  //used to perform CRUD on cookies stored in browser of user through server/backend

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//.use are all middlewares
app.use(express.json({limit: "16kb"})) //when data is sent through forms
app.use(express.urlencoded({extended: true, limit: "16kb"}))  //URL data
app.use(express.static("public")) //static files whiach came from client will be stored in public folder
app.use(cookieParser())  //cookieParser helps perform CRUD operations on cookies of client from server


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)



export { app}