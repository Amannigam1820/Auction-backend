import { config } from "dotenv";
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRoute.js"
import auctionRouter from "./routes/auctionRoute.js"
import bidRouter from "./routes/bidRoute.js"
import commissionProofRouter from "./routes/commissionRoute.js"
import superAdminRouter from "./routes/superAdminRoute.js"

import {endedAuctionCron} from "./automation/endedAuctionCron.js"

const app = express();
config({ path: './config/config.env' })

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["POST","GET","PUT","DELETE"],
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))
app.use("/api/v1/user",userRouter)
app.use("/api/v1/auction",auctionRouter)
app.use("/api/v1/bid",bidRouter)
app.use("/api/v1/commission",commissionProofRouter)
app.use("/api/v1/superAdmin",superAdminRouter)


//endedAuctionCron()
connection();

app.use(errorMiddleware)


export default app;