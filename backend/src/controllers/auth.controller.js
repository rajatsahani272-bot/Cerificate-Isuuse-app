import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";

export const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingAdmin =
      await Admin.findOne({
        email: normalizedEmail,
      });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "Admin with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message:
        "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(
      "Register Admin Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const admin =
      await Admin.findOne({
        email: normalizedEmail,
      });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(
      "Login Admin Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCurrentAdmin = async (
  req,
  res
) => {
  try {
    const admin =
      await Admin.findById(
        req.adminId
      ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error(
      "Get Current Admin Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};