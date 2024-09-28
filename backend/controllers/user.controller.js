import User from "../models/user.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { username, email, fullName, currentPassword, newPassword } = req.body;

  let { profileImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedRes = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedRes.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profileImg = profileImg || user.profileImg;

    user = await user.save();

    //password in res should be null
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUserProfile controller", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
