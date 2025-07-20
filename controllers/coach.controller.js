import user from "../models/user.js";
import Plan from "../models/plan.js";

export const coachClients = async (req, res) => {
  const coachId = req.params.coachId;
  try {
    console.log("coachId:", coachId);
    const coach = await user.findById(coachId).populate("assignedClients");

    console.log("coach:", coach);
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }

    return res.status(200).json(coach.assignedClients);
  } catch (error) {
    console.log("Error in coachClients:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createNewPlan = async (req, res) => {
  const {
    coachId,
    clientId,
    type,
    title,
    description,
    duration,
    difficulty,
    exercises = [],
    diet = [],
  } = req.body;
  try {
    const plan = new Plan({
      coach: coachId,
      client: clientId,
      type,
      title,
      description,
      duration,
      difficulty,
      exercises: type === "workout" ? exercises : [],
      diet: type === "diet" ? diet : [],
    });
    await plan.save();
    res.status(201).json({ message: "Plan created successfully" });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ message: "Error creating plan" });
  }
};

export const coachDashboardData = async (req, res) => {
  const { coachId } = req.params;
  try {
    const coach = await user.findById(coachId);
    if (!coach || coach.role !== "coach") {
      return res.status(404).json({
        error: "Coach not found",
      });
    }

    const clients = await user.find({ assignedCoach: coachId });

    const plans = await Plan.find({ coach: coachId });

    const enrichedClients = clients.map((client) => {
      const clientPlans = plans.filter(
        (plan) => plan.client.toString() === client._id.toString()
      );
      const completedPlans = clientPlans.filter((p) => p.completed).length;
      const totalPlans = clientPlans.length;
      const progress =
        totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

      return {
        _id: client._id,
        email: client.email,
        progress,
        activePlans: clientPlans.filter((p) => !p.completed).length,
        completedWorkouts: clientPlans.filter(
          (p) => p.type === "workout" && p.completed
        ).length,
        status: progress > 0 ? "active" : "inactive",
      };
    });

    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyData = Array(12).fill(0);
    const workoutData = Array(12).fill(0);
    const dietData = Array(12).fill(0);

    plans.forEach((plan) => {
      const date = new Date(plan.createdAt);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        monthlyData[month]++;
        if (plan.type === "workout") workoutData[month]++;
        if (plan.type === "diet") dietData[month]++;
      }
    });

    const stats = {
      totalClients: clients.length,
      activePlans: plans.filter((p) => !p.completed).length,
      completedPlans: plans.filter((p) => p.completed).length,
      thisWeekWorkouts: plans.filter(
        (p) =>
          p.type === "workout" &&
          !p.completed &&
          new Date(p.createdAt) >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    };

    stats.monthlyPlanChart = monthlyData;
    stats.monthlyWorkoutChart = workoutData;
    stats.monthlyDietChart = dietData;
    stats.availableYears = [
      ...new Set(plans.map((p) => new Date(p.createdAt).getFullYear())),
    ];

    return res.status(200).json({
      coach,
      clients: enrichedClients,
      plans,
      stats,
    });
  } catch (error) {
    console.log("error in coachDashboard:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getPlanById = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await Plan.findById(planId)
      .populate("coach", "email")
      .populate("client", "email");
    console.log("plan:", plan);
    if (!plan) {
      return res.status(404).json({
        error: "Plan not found",
      });
    }
    return res.status(200).json(plan);
  } catch (error) {
    console.log("Error in getPlanById:", error);
    return res.status(500).json({
      error: "internal server error",
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const planId = req.params.planId;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        error: "plan not found",
      });
    }
    if (req.user._id.toString() !== plan.coach.toString()) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }
    await Plan.findByIdAndDelete(planId);
    return res.status(200).json({
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.log("error in deletePlan:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
