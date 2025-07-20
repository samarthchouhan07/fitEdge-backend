import express from "express";
import {
  getuserProfile,
  getUserProfileById,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router=express.Router()

router.get("/profile",authMiddleware,getuserProfile)
router.put("/profile",authMiddleware,updateUserProfile)
router.get("/profile/:userId",authMiddleware,getUserProfileById)

export default router