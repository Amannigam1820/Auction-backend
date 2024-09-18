import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Errorhandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";

export const placeBids = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const auctionItem = await Auction.findById(id);

  if (!auctionItem) {
    return next(new Errorhandler("Item not Found", 404));
  }

  const { amount } = req.body;
  if (!amount) {
    return next(new Errorhandler("please place your bid", 404));
  }
  if (amount < auctionItem.startingBid) {
    return next(new Errorhandler("Please bid more than the starting bid"));
  }
  if (amount <= auctionItem.currentBid) {
    return next(new Errorhandler("bid amount more than current bid"));
  }
  // if(new Date(auctionItem.endTime) < Date.now()){
  //   return next(new Errorhandler("You can't place bid, this Auction is over"))
  // }

  try {
    const existingBid = await Bid.findOne({
      "bidder.id": req.user._id,
      auctionItem: auctionItem._id,
    });
    const existingBidInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() == req.user._id.toString()
    );

    if (existingBid && existingBidInAuction) {
      existingBid.amount = amount;
      existingBidInAuction.amount = amount;
      await existingBid.save();
      await existingBidInAuction.save();
      auctionItem.currentBid = amount;
    } else {
      const bidderDetail = await User.findById(req.user._id);
      const bid = await Bid.create({
        amount,
        bidder: {
          id: bidderDetail._id,
          userName: bidderDetail.userName,
          profileImage: bidderDetail.profileImage?.url,
        },
        auctionItem: auctionItem._id,
      });
      auctionItem.bids.push({
        userId: req.user._id,
        userName: bidderDetail.userName,
        profileImage: bidderDetail.profileImage?.url,
        amount: amount,
      });
      auctionItem.currentBid =amount;
    }

      await auctionItem.save();

      //console.log(auctionItem.currentBid);
      
      res.status(201).json({
        success: true,
        message: "Bid Placed!",
        currentBid: auctionItem.currentBid,
      });
    
  } catch (error) {
    return next(new Errorhandler(error.message || "Failed to placed bid", 500));
  }
});
