
import CertificateTemplate from "../models/CertificateTemplate.js";
import Hackathon from "../models/Hackathon.js";

import {
  uploadToCloudinary,
} from "../services/cloudinary.service.js";

export const createTemplate = async (req, res) => {
  try {
    const {
      hackathonId,
      type,
    } = req.body;

    if (!hackathonId || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon and template type are required",
      });
    }

    const allowedTypes = [
      "PARTICIPATION",
      "FIRST_WINNER",
      "SECOND_WINNER",
      "THIRD_WINNER",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template type",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Template file is required",
      });
    }

    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message:
          "Only PNG and JPG template files are supported",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const existingTemplate =
      await CertificateTemplate.findOne({
        hackathonId,
        type,
        isActive: true,
      });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message:
          "An active template of this type already exists",
      });
    }

    const extension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const safeFileName =
      req.file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-");

    const uniqueFileName =
      `${hackathonId}-${type}-${Date.now()}-${safeFileName}.${extension}`;

    console.log("Template Upload Details:", {
      originalName: req.file.originalname,
      generatedName: uniqueFileName,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    const result = await uploadToCloudinary(
      req.file.buffer,
      uniqueFileName,
      "certificate-system/templates",
      req.file.mimetype
    );

    const template =
      await CertificateTemplate.create({
        hackathonId,
        type,
        fileUrl: result.secure_url,
        fileName: uniqueFileName,
        isActive: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Certificate template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error(
      "Create Template Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
};

export const getTemplates = async (
  req,
  res
) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findOne({
      _id: hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const templates =
      await CertificateTemplate.find({
        hackathonId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error(
      "Get Templates Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteTemplate = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const template =
      await CertificateTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: template.hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this template",
      });
    }

    await CertificateTemplate.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Certificate template deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Template Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};