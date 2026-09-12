import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "landguard_secret_jwt_key_2026";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, department, district, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required fields." });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email address already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `USR-${Date.now()}`;

    const newUser = await UserModel.create({
      id: userId,
      email,
      passwordHash,
      name,
      role: role || "VIEWER",
      department: department || "Land Acquisition Department",
      district: district || "All",
      phone: phone || "+91 98765 43210"
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to register user." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email credentials or user not found." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to log in." });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await UserModel.findOne({ id: req.user.id }).select("-passwordHash");
    if (!user) {
      return res.json({ user: req.user });
    }

    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch user profile." });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone, emailNotificationsEnabled, whatsappEnabled, notificationPreferences } = req.body;
    const userId = req.user?.id || "USR-001";

    // If MongoDB is connected, update Mongoose record
    if (mongoose.connection.readyState === 1) {
      const updated = await UserModel.findOneAndUpdate(
        { id: userId },
        {
          $set: {
            phone,
            emailNotificationsEnabled,
            whatsappEnabled,
            notificationPreferences
          }
        },
        { new: true }
      ).select("-passwordHash");
      return res.json({ success: true, user: updated });
    }

    // In-memory / Fallback mode when MongoDB URI is not set
    return res.json({
      success: true,
      message: "Notification preferences updated in active session.",
      user: {
        id: userId,
        phone: phone || "+91 98765 43210",
        emailNotificationsEnabled: emailNotificationsEnabled !== false,
        whatsappEnabled: whatsappEnabled !== false,
        notificationPreferences: notificationPreferences || {}
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update notification preferences" });
  }
};
