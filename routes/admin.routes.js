import express from "express";
import {
  assignClientToCoach,
  getCoaches,
  getStats,
  getUsers,
  recentActivity,
  deleteUser,
  updateUser,
  getUser,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/coaches", getCoaches);
router.get("/users", getUsers);
router.get("/stats", authMiddleware, getStats);
router.get("/activity", authMiddleware, recentActivity);
router.post("/assign", assignClientToCoach);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

export default router;
