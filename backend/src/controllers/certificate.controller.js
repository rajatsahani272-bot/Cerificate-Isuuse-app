
import Certificate from "../models/Certificate.js";
import Participant from "../models/Participant.js";
import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";

import {
  generateCertificatePdf,
} from "../services/certificate.service.js";

export const generateCertificates = async (
  req,
  res
) => {
  try {
    const { hackathonId } = req.body;

    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Hackathon ID is required",
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

    const participants = await Participant.find({
      hackathonId,
    });

    if (participants.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No participants found",
      });
    }

    const generatedCertificates = [];
    const errors = [];

    for (const participant of participants) {
      try {
        const team = await Team.findOne({
          _id: participant.teamId,
          hackathonId,
        });

        if (!team) {
          errors.push({
            participantId: participant._id,
            name:
              participant.name ||
              participant.fullName,
            message: "Team not found",
          });

          continue;
        }

        const existingCertificate =
          await Certificate.findOne({
            participantId: participant._id,
            hackathonId,
            status: "issued",
          });

        if (existingCertificate) {
          generatedCertificates.push(
            existingCertificate
          );

          continue;
        }

        const result =
          await generateCertificatePdf({
            participant,
            team,
            hackathon,
          });

        const certificate =
          await Certificate.create({
            certificateId:
              result.certificateId,
            hackathonId,
            participantId:
              participant._id,
            teamId: team._id,
            type:
              result.certificateType,
            pdfUrl: result.pdfUrl,
            status: "issued",
          });

        generatedCertificates.push(
          certificate
        );
      } catch (error) {
        errors.push({
          participantId: participant._id,
          name:
            participant.name ||
            participant.fullName ||
            "Unknown",
          message:
            error.message ||
            "Certificate generation failed",
        });
      }
    }

    return res.status(200).json({
      success: errors.length === 0,
      message:
        "Certificate generation completed",
      count: generatedCertificates.length,
      errorCount: errors.length,
      certificates:
        generatedCertificates,
      errors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
};

export const getCertificateByEmail = async (
  req,
  res
) => {
  try {
    const {
      hackathonId,
      email,
    } = req.body;

    if (!hackathonId || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon and email are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const participant =
      await Participant.findOne({
        hackathonId,
        email: normalizedEmail,
      }).populate("teamId");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const certificate =
      await Certificate.findOne({
        hackathonId,
        participantId: participant._id,
        status: "issued",
      }).populate(
        "participantId teamId hackathonId"
      );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found. It may not have been generated yet.",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCertificates = async (
  req,
  res
) => {
  try {
    const { hackathonId } = req.params;

    const hackathon =
      await Hackathon.findOne({
        _id: hackathonId,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const certificates =
      await Certificate.find({
        hackathonId,
      })
        .populate("participantId")
        .populate("teamId")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const revokeCertificate = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const certificate =
      await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const hackathon =
      await Hackathon.findOne({
        _id: certificate.hackathonId,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to revoke this certificate",
      });
    }

    if (certificate.status === "revoked") {
      return res.status(400).json({
        success: false,
        message:
          "Certificate is already revoked",
      });
    }

    certificate.status = "revoked";

    await certificate.save();

    return res.status(200).json({
      success: true,
      message:
        "Certificate revoked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteCertificate = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const certificate =
      await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const hackathon =
      await Hackathon.findOne({
        _id: certificate.hackathonId,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this certificate",
      });
    }

    await Certificate.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Certificate deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to delete certificate",
    });
  }
};