import fitnessgoal from "../models/fitnessgoal.js";

export const createGoal = async (req, res) => {
  try {
    const goal = new fitnessgoal(req.body);
    await goal.save();
    return res.status(201).json(goal);
  } catch (error) {
    console.log("Error in createGoal:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllGoals = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const goals = await fitnessgoal.find(query).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (error) {
    console.log("Error in getAllGoals:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getSingleGoal = async (req, res) => {
  try {
    const goal = await fitnessgoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    return res.status(200).json(goal);
  } catch (error) {
    console.log("Error in getSingleGoal:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const updated = await fitnessgoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.status(200).json(updated);
  } catch (error) {
    console.log("Error in updateGoal:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    await fitnessgoal.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.log("Error in deleteGoal:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const toggleMilestone = async (req, res) => {
  const { goalId, milestoneId } = req.params;
  try {
    const goal = await fitnessgoal.findById(goalId);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ error: "Milestone not found" });
    milestone.completed = !milestone.completed;
    const completedMilestones = goal.milestones.filter(
      (m) => m.completed
    ).length;
    goal.progress =
      goal.milestones.length === 0
        ? 0
        : Math.round((completedMilestones / goal.milestones.length) * 100);

    await goal.save();

    return res.status(200).json({ success: true, milestone });
  } catch (error) {
    console.log("Error in toggleMilestone:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
