    import express from "express";
  import { isAuthenticated } from "../middlewares/auth.js";
import { addNewAuctionItem } from "../controllers/auctionController.js";
  
  const router = express.Router();
  
  router.post("/new",isAuthenticated,   addNewAuctionItem)
  
  export default router;
  