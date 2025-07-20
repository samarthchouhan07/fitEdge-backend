import message from "../models/message.js";
import user from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await user
      .find({ _id: { $ne: req.user.userId } })
      .select("name email role profileImage");

    const onlineUsers = req.app.get("onlineUsers") || new Set();

    const usersWithDetails = await Promise.all(
      users.map(async (u) => {
        const lastMessage = await message
          .findOne({
            $or: [
              { sender: req.user.userId, receiver: u._id },
              { sender: u._id, receiver: req.user.userId },
            ],
          })
          .sort({ createdAt: -1 })
          .populate("sender", "name email")
          .populate("receiver", "name email");

        const unreadCount = await message.countDocuments({
          sender: u._id,
          receiver: req.user.userId,
          isRead: false,
        });

        console.log(`Last message for user ${u._id}:`, {
          content: lastMessage ? lastMessage.content : "None",
          createdAt: lastMessage ? lastMessage.createdAt : "None",
        });

        return {
          ...u.toObject(),
          lastMessage: lastMessage ? lastMessage.content : "",
          lastTime: lastMessage
            ? formatRelativeTime(new Date(lastMessage.createdAt))
            : "",
          lastMessageTime: lastMessage ? new Date(lastMessage.createdAt) : null,
          unread: unreadCount,
          online: onlineUsers.has(u._id.toString()),
          profileImage: u.profileImage || "",
        };
      })
    );

    const sortedUsers = usersWithDetails.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return b.lastMessageTime - a.lastMessageTime;
    });

    return res.status(200).json(sortedUsers);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getChatHistroy = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await message
      .find({
        $or: [
          { sender: req.user.userId, receiver: userId },
          { sender: userId, receiver: req.user.userId },
        ],
      })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getChatHistroy:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const newMessage = new message({
      sender: req.user.userId,
      receiver,
      content,
      isRead: false,
    });
    await newMessage.save();
    const populatedMessage = await message
      .findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");
    return res.status(200).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    return res.status(500).json({
      error: "internal server error",
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await message.updateMany(
      { sender: userId, receiver: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hour${
      Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""
    } ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""
    } ago`;
  return date.toLocaleDateString();
};
