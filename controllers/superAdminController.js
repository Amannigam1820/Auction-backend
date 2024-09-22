import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Commission } from "../models/commissionSchema.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";

export const deleteAuctionItem = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 404));
  }
  const auctionItem = await Auction.findById(id);
  if (!auctionItem) {
    return next(new ErrorHandler("Auction not found", 404));
  }
  await auctionItem.deleteOne();
  res.status(200).json({
    success: true,
    message: "Auction Deleted SuccessFully",
  });
});

export const getAllPaymentProof = catchAsyncError(async (req, res, next) => {
  const paymentProof = await PaymentProof.find();
  res.status(200).json({
    success: true,
    paymentProof,
  });
});

export const getPaymentProofDetail = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 404));
  }
  const paymentProofDetail = await PaymentProof.findById(id);
  if (!paymentProofDetail) {
    return next(new ErrorHandler("Payment Not found", 404));
  }
  res.status(200).json({
    success: true,
    paymentProofDetail,
  });
});

export const updateProofStatus = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 404));
  }
  const { amount, status } = req.body;
  if (!amount || !status) {
    return next(new ErrorHandler("Please provide amount and status", 404));
  }
  let proofPayment = await PaymentProof.findById(id);
  if (!proofPayment) {
    return next(new ErrorHandler("payment Proof not found", 404));
  }
  proofPayment = await PaymentProof.findByIdAndUpdate(
    id,
    { status, amount },
    { new: true, runValidators: true, useFindAndModify: false }
  );
  res.status(200).json({
    success: true,
    message: "Payment Proof and Status updated",
    proofPayment,
  });
});

export const deletePaymentProof = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 404));
  }
  const proof = await PaymentProof.findById(id);
  if (!proof) {
    return next(new ErrorHandler("Payment Proof not found", 404));
  }
  await proof.deleteOne();
  res.status(200).json({
    success: true,
    message: "Payment Proof Deleted SuccessFully",
  });
});


export const fetchAllUser = catchAsyncError(async(req,res,next)=>{
  
})
