import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/userSchema.js";

export const addNewAuctionItem = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Auction Item Image required!", 400));
  }

  const { image } = req.files;
  const allowedFormat = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormat.includes(image.mimetype)) {
    return next(new ErrorHandler("File Format not Supported", 400));
  }

  const {
    title,
    description,
    category,
    condition,
    startingBid,
    startTime,
    endTime,
  } = req.body;
  if (
    !title ||
    !description ||
    !category ||
    !condition ||
    !startingBid ||
    !startTime ||
    !endTime
  ) {
    return next(new ErrorHandler("Please provide all details.", 400));
  }

  if (new Date(startTime) < Date.now()) {
    return next(
      new ErrorHandler(
        "Auction Starting time must be greater tham present time",
        400
      )
    );
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return next(
      new ErrorHandler("Auction Starting time must be less than end time", 400)
    );
  }

  const alreadyOneAuctionActive = await Auction.find({
    createdBy: req.user._id,
    endTime: { $gt: Date.now() },
  });

  //console.log(alreadyOneAuctionActive);

  if (alreadyOneAuctionActive.length > 0) {
    return next(new ErrorHandler("Your One Auction is currently active", 400));
  }
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "AUCTION_ITEMS",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error : ",
        cloudinaryResponse.error || "Unknown Cloudinary Error"
      );
      return next(
        new ErrorHandler("Failed to upload image to cloudinary", 500)
      );
    }
    const auctionItem = await Auction.create({
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
      image: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      createdBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: `Auction item created and will be listed on auction page at ${startTime}`,
      auctionItem,
    });
  } catch (error) {
    return next(
      new ErrorHandler(error.message || "Failed to created auction.", 500)
    );
  }
});

export const getAllAuctionItem = catchAsyncError(async (req, res, next) => {
  const items = await Auction.find();
  res.status(200).json({
    success: true,
    items,
  });
});

export const getAuctionDetail = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 400));
  }
  const auctionItem = await Auction.findById(id);
  if (!auctionItem) {
    return next(new ErrorHandler("Auction not Found", 404));
  }
  const bidder = auctionItem.bids.sort((a, b) => b.bid - a.bid);
  res.status(200).json({
    success: true,
    auctionItem,
    bidder,
  });
});

export const getMyAuctionItem = catchAsyncError(async (req, res, next) => {
  const myItem = await Auction.find({ createdBy: req.user._id });
  if (!myItem) {
    return next(new ErrorHandler("You are not posted any auction yet", 404));
  }
  res.status(200).json({
    success: true,
    myItem,
  });
});

export const removeFromAuction = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 400));
  }

  const auctionItem = await Auction.findById(id);
  if (!auctionItem) {
    return next(new ErrorHandler("Auction Item not found", 404));
  }

  await auctionItem.deleteOne();
  res.status(200).json({
    success: true,
    message: "Auction Item deleted successfully",
  });
});

export const republishItem = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id Format", 400));
  }

  let auctionItem = await Auction.findById(id);

  console.log(auctionItem);

  if (!auctionItem) {
    return next(new ErrorHandler("Auction Item not found", 404));
  }

  if (!req.body.startTime || !req.body.endTime) {
    return next(
      new ErrorHandler("Starttime and Endtime for republish is mandatory.")
    );
  }

  if (new Date(auctionItem.endTime) > new Date(Date.now())) {
    return next(
      new ErrorHandler("Auction is already active, Cannot republish")
    );
  }

  let data = {
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
  };

  if (data.startTime < Date.now()) {
    return next(
      new ErrorHandler(
        "Auction Starting time must be greater tham present time",
        401
      )
    );
  }
  if (data.endTime <= data.startTime) {
    return next(
      new ErrorHandler("Auction Starting time must be less than end time", 401)
    );
  }

  data.bids = [];
  data.commissionCalculated = false;

  auctionItem = await Auction.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  const createdBy = await User.findByIdAndUpdate(
    req.user._id,
    { unpaidCommission: 0 },
    {
      new: true,
      runValidators: false,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    auctionItem,
    message: `Auction republish and will be active on ${req.body.startTime}`,
    createdBy,
  });
});
