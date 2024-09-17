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
    profileImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      paypal: {
        paypalEmail,
      },
    },
  });

  generateToken(user, "User Registered SuccessFully", 201, res);
});


export const userLogin = catchAsyncError(async(req,res,next)=>{
  const {email,password} = req.body;
  if(!email || !password){
    return next(new ErrorHandler("Please provide all the Information"))
  }
  const user = await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("Invalid Credential"))
  }
  const isPasswordMatch = await user.comparePassword(password);
  if(!isPasswordMatch){
    return next(new ErrorHandler("Invalid Credential"))
  };
  generateToken(user,"Login successFully",201,res)
})

export const getUserProfile = catchAsyncError(async(req,res,next)=>{
  const user = req.user;
  res.status(200).json({
    success:true,
    user
  })
})

export const userLogout = catchAsyncError(async(req,res,next)=>{
  res.status(200).cookie("token","",{
    expires: new Date(Date.now()),
    httpOnly:true
  }).json({
    success:true,
    message:"User Logout SuccessFully"
  })
})

export const fetchLeaderboard = catchAsyncError(async(req,res,next)=>{
  const users = await User.find({moneySpent:{$gt:0}});
  const leaderBoard = users.sort((a,b)=>b.moneySpent-a.moneySpent)
  res.status(200).json({
    success: true,
    leaderBoard,
  });
})
