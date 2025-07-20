import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String,
  weight: String,
  rest: String,
  notes: String,
});

const dietItemSchema = new mongoose.Schema({
  meal: String,
  time: String,
  calories: String,
  notes: String,
});

const planSchema = new mongoose.Schema(
  {
    coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["workout", "diet"], required: true },
    title: String,
    description: String,
    duration: String,
    difficulty: String,
    exercises: [exerciseSchema],
    diet: [dietItemSchema],
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);