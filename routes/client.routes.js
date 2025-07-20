import express from "express";
import { getClientPlans, markPlanAsDone } from "../controllers/client.controller.js";

const router = express.Router();
router.get("/plans/:clientId", getClientPlans);
router.post("/plans/done/:planId",markPlanAsDone)

export default router; 