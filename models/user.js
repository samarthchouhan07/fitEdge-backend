import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["user", "coach", "admin"],
      default: "user",
    },
    assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedCoach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    socialMedia: {
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    specialization: { type: String, default: null },
    achievements: [{ type: String, default: [] }],
    targets: [{ type: String, default: [] }],
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    memberSince: { type: String, default: new Date().getFullYear().toString() },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
