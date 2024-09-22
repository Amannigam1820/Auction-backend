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

export const fetchAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        role: "$_id.role",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { year: 1, month: 1 },
    },
  ]);

  const bidders = users.filter((user) => user.role === "Bidder");
  const auctioneer = users.filter((user) => user.role === "Auctioneer");

  // console.log(bidders);
  // console.log(auctioneer);

  const transformDataToMonthlyArray = (data, totalMonth = 12) => {
    const result = Array(totalMonth).fill(0);
    //   console.log(result);

    data.forEach((item) => {
      result[item.month - 1] = item.count;
    });
    return result;
  };

  const biddersArray = transformDataToMonthlyArray(bidders);
  const autioneerArray = transformDataToMonthlyArray(auctioneer);

  // console.log(biddersArray);
  // console.log(autioneerArray);

  res.status(200).json({
    success: true,
    biddersArray,
    autioneerArray,
  });
});

export const monthlyRevenue = catchAsyncError(async (req, res, next) => {
  const payments = await Commission.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  const transformDataToMonthlyArray = (payments, totalMonth = 12 ) => {
    const result = Array(totalMonth).fill(0);

    payments.forEach((payment) => {
      result[payment._id.month - 1] = payment.totalAmount;
    });

    return result;
  };

  const totalMonthlyRevenue = transformDataToMonthlyArray(payments);

  res.status(200).json({
    success: true,
    totalMonthlyRevenue,
  });
});
