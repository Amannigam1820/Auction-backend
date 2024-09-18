import { User } from "../models/userSchema.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";

export const trackCommissionStatus = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.unpaidCommission > 0) {
    return next(
      new ErrorHandler(
        "You have unpaid commissions. Please pay them before posting a new auction.",
        401
      )
    );
  }
  next();
});
