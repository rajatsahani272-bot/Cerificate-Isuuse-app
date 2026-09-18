import Participant from "../models/Participant.js";
import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";

export const createParticipant = async (req, res) => {
  try {
    const {
      hackathonId,
      teamId,
      name,
      email,
      college,
    } = req.body;

    if (!hackathonId || !teamId || !name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon, team, name and email are required",
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

    const team = await Team.findOne({
      _id: teamId,
      hackathonId,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found for this hackathon",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingParticipant =
      await Participant.findOne({
        hackathonId,
        email: normalizedEmail,
      });

    if (existingParticipant) {
      return res.status(409).json({
        success: false,
        message:
          "Participant with this email already exists",
      });
    }

    const participant =
      await Participant.create({
        hackathonId,
        teamId,
        name: name.trim(),
        email: normalizedEmail,
        college: college?.trim(),
      });

    res.status(201).json({
      success: true,
      message: "Participant added successfully",
      participant,
    });
  } catch (error) {
    console.error(
      "Create Participant Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getParticipants = async (req, res) => {
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

    const participants =
      await Participant.find({
        hackathonId,
      })
        .populate(
          "teamId",
          "teamName registrationId winnerPosition"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (error) {
    console.error(
      "Get Participants Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateParticipant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const participant =
      await Participant.findById(id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: participant.hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this participant",
      });
    }

    const {
      name,
      email,
      college,
      teamId,
    } = req.body;

    if (teamId) {
      const team = await Team.findOne({
        _id: teamId,
        hackathonId: participant.hackathonId,
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          message:
            "Team not found for this hackathon",
        });
      }

      participant.teamId = teamId;
    }

    if (email) {
      const normalizedEmail =
        email.trim().toLowerCase();

      const existingParticipant =
        await Participant.findOne({
          hackathonId:
            participant.hackathonId,
          email: normalizedEmail,
          _id: { $ne: id },
        });

      if (existingParticipant) {
        return res.status(409).json({
          success: false,
          message:
            "Participant with this email already exists",
        });
      }

      participant.email = normalizedEmail;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Participant name is required",
        });
      }

      participant.name = name.trim();
    }

    if (college !== undefined) {
      participant.college =
        college.trim();
    }

    await participant.save();

    res.status(200).json({
      success: true,
      message:
        "Participant updated successfully",
      participant,
    });
  } catch (error) {
    console.error(
      "Update Participant Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteParticipant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const participant =
      await Participant.findById(id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: participant.hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this participant",
      });
    }

    await Participant.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Participant deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Participant Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};