import User from "../models/user.js";
import FitnessGoals from "../models/fitnessgoal.js";

export const getuserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email phone bio location socialMedia achievements targets profileImage coverImage memberSince"
    );

    if (!user) {
      return res.status(404).json({
        error: "user not found ",
      });
    }

    return res.status(200).json(user.toObject());
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      location,
      socialMedia,
      achievements,
      targets,
      profileImage,
      coverImage,
    } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.socialMedia = {
      instagram: socialMedia?.instagram || user.socialMedia.instagram,
      twitter: socialMedia?.twitter || user.socialMedia.twitter,
      facebook: socialMedia?.facebook || user.socialMedia.facebook,
    };
    user.achievements = achievements || user.achievements;
    user.targets = targets || user.targets;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error in updateUserProfile:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name email phone bio location socialMedia achievements targets profileImage coverImage memberSince role"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.status(200).json(user.toObject());
  } catch (error) {
    console.log("Error in getuserProfileById:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
