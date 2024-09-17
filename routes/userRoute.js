import {
  fetchLeaderboard,
  getUserProfile,
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/userController.js";

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/me", isAuthenticated, getUserProfile);
router.delete("/logout", isAuthenticated,  userLogout);
router.get("/leaderboard", fetchLeaderboard);

export default router;
