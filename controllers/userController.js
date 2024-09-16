import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";

export const userRegister = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Please provide profile photo", 400));
    }
  
    const { profileImage } = req.files;
  
    const allowedFormat = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormat.includes(profileImage.mimetype)) {
      return next(new ErrorHandler("File Format not supported", 400));
    }
  
  //   const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  //   if (!allowedFormats.includes(profileImage.mimetype)) {
  //     return next(new ErrorHandler("File format not supported.", 400));
  //   }
  
    const {
      userName,
      email,
      password,
      phone,
      address,
      role,
      bankAccountNumber,
      bankAccountName,
      bankName,
      
      paypalEmail,
    } = req.body;
  
    if (!userName || !email || !password || !phone || !address) {
      return next(new ErrorHandler("please provide all the information", 400));
    }
    if (role === "Auctioneer") {
      if (!bankAccountName || !bankAccountNumber || !bankName) {
        return next(new ErrorHandler("please provide all the banks details"));
      }
      if (!paypalEmail) {
        return next(new ErrorHandler("Please provide your paypal email.", 400));
      }
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(new ErrorHandler("User already regeistered", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "AUCTION USERS",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary error : ",
        cloudinaryResponse.error || "unknown cloudinary error"
      );
      return next(
          new ErrorHandler("failed to upload profile image to cloudinary", 500)
        );
    }
  
    const user = await User.create({
      userName,
      email,
      password,
      phone,
      address,
      role,
      profileImage:{
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
      },
      paymentMethods:{
          bankTransfer: {
          bankAccountNumber,
          bankAccountName,
          bankName,
        },
        paypal: {
          paypalEmail,
        },
      }
  
    })

    generateToken(user,"User Registered SuccessFully",201,res);
  
    
  
    
  });
