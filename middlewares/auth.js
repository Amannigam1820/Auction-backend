import {User} from "../models/userSchema.js"
import jwt from "jsonwebtoken"
import { catchAsyncError } from "./catchAsyncError.js"
import ErrorHandler from "./error.js";


export const isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return next(new ErrorHandler("User not authenticated",404))
    }
    const decoded =  jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
    
})
