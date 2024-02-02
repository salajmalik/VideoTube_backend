// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({
    path: './env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000, ()=>{
        console.log(`server is running at port: ${process.env.port}`);
    })
})
.catch((err)=>{
    console.log("mongo db connection failed", err)
})


// ;( async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//     } catch (error){
//         console.error("ERROR: ", error)
//         throw err
//     }
// })()