import user from "../models/user.js";

export const getCoaches = async (req, res) => {
  try {
    const coaches = await user
      .find({ role: "coach" })
      .select("name email status assignedClients")
      .populate("assignedClients", "name email");
    return res.status(200).json(coaches);
  } catch (error) {
    console.log("Error in getCoaches:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await user
      .find({ role: "user" })
      .select("name email role status plan createdAt assignedCoach")
      .populate("assignedCoach", "name email");
    console.log("users:",users)
    return res.status(200).json(users);
  } catch (error) {
    console.log("error in getUsers:", error);
    return res.status(500).json({
      error: "internal server error",
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await user.countDocuments({ role: "client" });
    const totalCoaches = await user.countDocuments({ role: "coach" });
    const activeAssignments = await user.countDocuments({
      role: "user",
      assignedCoach: { $ne: null },
    });
    return res
      .status(200)
      .json({ totalUsers, totalCoaches, activeAssignments });
  } catch (error) {
    console.log("Error in getStats:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const recentActivity = async (req, res) => {
  try {
    const users = await user
      .find()
      .select("name email role createdAt assignedCoach")
      .populate("assignedCoach", "name email")
      .sort({ createdAt: -1 })
      .limit(10);
    console.log("users in recentActivity:",users) 
    const activity = users.map((user) => ({
      action:
        user.role === "user"
          ? "New user registered"
          : user.role === "coach"
          ? "New coach added"
          : "Admin activity",
      user: user.name || user.email,
      time: user.createdAt,
      details:
        user.role === "user" && user.assignedCoach
          ? `Assigned to ${user.assignedCoach.name || user.assignedCoach.email}`
          : null,
    }));
    console.log("activites in recentActivity:",activity)
    res.status(200).json(activity);
  } catch (error) {
    console.log("Error in recentActivity:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const assignClientToCoach = async (req, res) => {
  const { coachId, clientId } = req.body;
  try {
    const coach = await user.findById(coachId);
    const client = await user.findById(clientId);

    if (!client || client.role !== "user") {
      console.log("client not found", clientId);
      return res.status(404).json({
        error: "client not found ",
      });
    }

    if (!coach || coach.role !== "coach") {
      console.log("coach not found:", coachId);
      return res.status(404).json({
        error: "Coach not found",
      });
    }
    coach.assignedClients.push(clientId);
    await coach.save();

    client.assignedCoach = coachId;
    await client.save();
    return res.status(200).json({
      message: "Client assigned to coach successfully",
    });
  } catch (error) {
    console.log("Error in assignClientToCoach:", error);
    return res.status(500).json({
      error: "Interrnal server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user_ = await user.findById(req.params.id);
    if (!user_) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    if (user_.role === "coach") {
      await user.updateMany(
        { assignedCoach: user_._id },
        { $set: { assignedCoach: null } }
      );
    }
    if (user_.role === "user") {
      await user.updateMany(
        { assignedClients: user_._id },
        { $pull: { assignedClients: user_._id } }
      );
    }
    await user_.deleteOne({ _id: user_._id });
    return res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    console.log("Error in deleteUser:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  const { name, status, plan, specialization } = req.body;
  try {
    const user_ = await user.findById(req.params.id);
    if (!user_) {
      return res.status(404).json({ error: "User not found" });
    }
    user_.name = name || user_.name;
    user_.status = status || user_.status;
    if (user_.role === "user") user_.plan = plan || user_.plan;
    if (user_.role === "coach")
      user_.specialization = specialization || user_.specialization;
    await user_.save();
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.log("error in updateUser:",error)
    res.status(500).json({ error: "Server error" });
  }
};

export const getUser=async (req, res) => {
  try {
    const user_ = await user.findById(req.params.id)
      .select("name email role status plan specialization createdAt assignedCoach assignedClients")
      .populate("assignedCoach assignedClients", "name email");
    if (!user_) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user_);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}