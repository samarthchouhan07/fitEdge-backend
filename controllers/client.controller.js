import plan from "../models/plan.js";

export const getClientPlans = async (req, res) => {
  const { clientId } = req.params;
  // console.log("clientId:", clientId);

  try {
    const plans = await plan
      .find({ client: clientId })
      .populate("coach", "name email");
    console.log("plans in getClientPlans:", plans);
    return res.status(200).json(plans);
  } catch (error) {
    console.log("Error in getClientPlans:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const markPlanAsDone = async (req, res) => {
  const { planId } = req.params;
  try {
    const updatedPlan = await plan.findByIdAndUpdate(
      planId,
      { completed: true },
      { new: true }
    );
    // console.log("updatedPlan:",updatedPlan)
    return res.status(200).json(updatedPlan);
  } catch (error) {
    console.log("Error in markPlanAsDone:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
