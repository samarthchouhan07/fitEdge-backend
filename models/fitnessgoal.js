import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    text: String,
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const fitnessGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  type: String,
  targetValue: Number,
  targetUnit: String,
  currentValue: Number,
  deadline: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "intermediate",
  },
  isPublic: { type: Boolean, default: false },
  reminderFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "never"],
    default: "daily",
  },
  milestones: [milestoneSchema],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
});

export default mongoose.model("FitnessGoal", fitnessGoalSchema);