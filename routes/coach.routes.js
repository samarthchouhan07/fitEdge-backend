import express from "express";
import {
  coachClients,
  coachDashboardData,
  createNewPlan,
  deletePlan,
  getPlanById,
} from "../controllers/coach.controller.js";

const router = express.Router();

router.get("/clients/:coachId", coachClients);
router.post("/create-plan", createNewPlan);
router.get("/dashboard/:coachId", coachDashboardData);
router.get('/plan/:planId',getPlanById) 
router.delete("/plan/:planId",deletePlan)

export default router;