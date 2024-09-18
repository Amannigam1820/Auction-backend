import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  addNewAuctionItem,
  getAllAuctionItem,
  getAuctionDetail,
  getMyAuctionItem,
  removeFromAuction,
  republishItem,
} from "../controllers/auctionController.js";
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  trackCommissionStatus,
  addNewAuctionItem
);
router.get("/all", isAuthenticated, getAllAuctionItem);
router.get("/auction-details/:id", isAuthenticated, getAuctionDetail);
router.get(
  "/my",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  getMyAuctionItem
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("Auctioneer"),
  removeFromAuction
);

router.put("/republish/:id",isAuthenticated,isAuthorized("Auctioneer"),republishItem)

export default router;
