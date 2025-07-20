import express from "express"
import { createGoal, deleteGoal, getAllGoals, getSingleGoal, updateGoal,toggleMilestone } from "../controllers/goal.controller.js"

const router=express.Router()

router.post("/",createGoal)
router.get("/",getAllGoals)
router.get("/:id",getSingleGoal)
router.put("/:id",updateGoal)
router.delete("/:id",deleteGoal)
router.patch("/:goalId/milestones/:milestoneId/toggle", toggleMilestone);

export default router