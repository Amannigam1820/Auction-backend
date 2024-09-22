import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  deleteAuctionItem,
  deletePaymentProof,
  fetchAllUser,
  getAllPaymentProof,
  getPaymentProofDetail,
  monthlyRevenue,
  updateProofStatus,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.delete(
  "/auction-item/delete/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  deleteAuctionItem
);

router.get(
  "/payment-proof/getAll",
  isAuthenticated,
  isAuthorized("Super Admin"),
  getAllPaymentProof
);

router.get(
  "/payment-proof/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  getPaymentProofDetail
);

router.put(
  "/payment-proof/status/update/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  updateProofStatus
);

router.delete(
  "/payment-proof/delete/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  deletePaymentProof
);

router.get(
  "/getUser",
  isAuthenticated,
  isAuthorized("Super Admin"),
  fetchAllUser
);
router.get(
  "/monthly-revenue",
  isAuthenticated,
  isAuthorized("Super Admin"),
  monthlyRevenue
);

export default router;
