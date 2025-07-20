import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import coachRoutes from "./routes/coach.routes.js";
import clientRoutes from "./routes/client.routes.js";
import fitnessGoalsRoutes from "./routes/fitnessGoals.routes.js";
import userRoutes from "./routes/user.routes.js"
import chatRoutes from "./routes/chat.routes.js";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import Message from "./models/message.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const onlineUsers = new Set();
const socketUserMap = new Map();
app.set("onlineUsers", onlineUsers);
console.log("onlineUsers:", onlineUsers);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/goals", fitnessGoalsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user",userRoutes)

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    socketUserMap.set(socket.id, userId);
    onlineUsers.add(userId);
    console.log(`User ${userId} joined room, online users:`, [...onlineUsers]);
    io.emit("userStatusUpdate", { userId, online: true });
  });

  socket.on("sendMessage", async ({ sender, receiver, content }) => {
    try {
      const message = new Message({ sender, receiver, content, isRead: false });
      await message.save();
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");
      io.to(receiver).emit("receiveMessage", populatedMessage);
      io.to(sender).emit("receiveMessage", populatedMessage);
      io.to(sender).emit("refreshUsers");
      io.to(receiver).emit("refreshUsers");
      console.log(`Message sent from ${sender} to ${receiver}`);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  }); 

  socket.on("messagesRead", async ({ senderId, receiverId }) => {
    try {
      const updatedMessages = await Message.find({
        sender: receiverId,
        receiver: senderId,
        isRead: false,
      }).select("_id");
      await Message.updateMany(
        { sender: receiverId, receiver: senderId, isRead: false },
        { $set: { isRead: true } }
      );
      io.to(receiverId).emit("messageRead", {
        messageIds: updatedMessages.map((msg) => msg._id.toString()),
      });
      io.to(receiverId).emit("refreshUsers");
      io.to(senderId).emit("refreshUsers");
    } catch (error) {
      console.log("Error in messagesRead:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const userId = socketUserMap.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      socketUserMap.delete(socket.id);
      console.log(`user ${userId} disconnected, online users:`, [
        ...onlineUsers,
      ]);
      io.emit("userStatusUpdate", { userId, online: false });
    }
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));