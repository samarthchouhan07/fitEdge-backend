import express from "express";
import {
  getAllUsers,
  getChatHistroy,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", authMiddleware, getAllUsers);
router.get("/messages/:userId", authMiddleware, getChatHistroy);
router.post("/messages", authMiddleware, sendMessage);
router.post("/messages/:userId/read", authMiddleware, markMessagesAsRead);

export default router;
