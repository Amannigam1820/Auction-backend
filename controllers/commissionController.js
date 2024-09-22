import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinry } from "cloudinary";
import { Commission } from "../models/commissionSchema.js";


export const calculateCommission = async(auctionId)=>{
  const auction = await Auction.findById(auctionId);
  if(!mongoose.Types.ObjectId.isValid(auctionId)){
    return next (new ErrorHandler("Invalid Id Format",402))
  }
  const commissionRate = 0.05;
  const commission = auction.currentBid * commissionRate;
  return commission
}





export const proofOfCommission = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Payment Proof Screenshot required.", 400));
  }

  const { proof } = req.files;
  const { amount, comment } = req.body;
  const user = await User.findById(req.user._id);

  //console.log(user);
  

  if(!amount || !comment) {
    new ErrorHandler("Amount & comment are required fields.", 400);
  }

  //console.log("1");
  

  if (user.unpaidCommission === 0) {
    return res.status(200).json({
      success: true,
      message: "You dont have any unpaid Commission",
    });
  }

  //console.log("2");

  if (user.unpaidCommission < amount) {
    return next(
      new ErrorHandler(
        `The Amount exceeds your unpaid commission balance, Please enter an amount up to ${user.unpaidCommission}`,
        404
      )
    );
  }

  //console.log("3");
  const allowedFormat = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormat.includes(proof.mimetype)) {
    return next(new ErrorHandler("ScreenShot format not supported.", 400));
  }
  //console.log("4");
  const cloudinaryResponse = await cloudinry.uploader.upload(
    proof.tempFilePath,
    {
      folder: "AUCTION_PAYMENT_PROOF",
    }
  );
  //console.log(cloudinaryResponse,"5");
  

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary error:",
      cloudinaryResponse.error || "Unknown cloudinary error."
    );
    return next(new ErrorHandler("Failed to upload payment proof.", 501));
  }

  const commissionProof = await PaymentProof.create({
    userId: req.user._id,
    proof: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    amount: amount,
    comment: comment,
  });
  console.log(commissionProof);
  
  res.status(201).json({
    success: true,
    message:
      "Your proof has been submitted successfully. We will review it and responed to you within 24 hours.",
    commissionProof,
  });
});
