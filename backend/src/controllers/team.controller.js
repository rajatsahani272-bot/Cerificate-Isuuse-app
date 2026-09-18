import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";
import Participant from "../models/Participant.js";

export const createTeam = async (req, res) => {
  try {
    const {
      hackathonId,
      teamName,
      registrationId,
    } = req.body;

    if (
      !hackathonId ||
      !teamName ||
      !registrationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hackathon, team name and registration ID are required",
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

    const normalizedRegistrationId =
      registrationId.trim();

    const existingTeam = await Team.findOne({
      hackathonId,
      registrationId: normalizedRegistrationId,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message:
          "Team with this registration ID already exists",
      });
    }

    const team = await Team.create({
      hackathonId,
      teamName: teamName.trim(),
      registrationId:
        normalizedRegistrationId,
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error(
      "Create Team Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Team with this registration ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getTeams = async (req, res) => {
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

    const teams = await Team.find({
      hackathonId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error(
      "Get Teams Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: team.hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this team",
      });
    }

    const {
      teamName,
      registrationId,
    } = req.body;

    if (
      teamName !== undefined &&
      !teamName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    if (
      registrationId !== undefined &&
      !registrationId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration ID is required",
      });
    }

    if (registrationId !== undefined) {
      const normalizedRegistrationId =
        registrationId.trim();

      const existingTeam = await Team.findOne({
        hackathonId: team.hackathonId,
        registrationId:
          normalizedRegistrationId,
        _id: { $ne: id },
      });

      if (existingTeam) {
        return res.status(409).json({
          success: false,
          message:
            "Team with this registration ID already exists",
        });
      }

      team.registrationId =
        normalizedRegistrationId;
    }

    if (teamName !== undefined) {
      team.teamName = teamName.trim();
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    console.error(
      "Update Team Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Team with this registration ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const hackathon = await Hackathon.findOne({
      _id: team.hackathonId,
      createdBy: req.adminId,
    });

    if (!hackathon) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this team",
      });
    }

    const participantCount =
      await Participant.countDocuments({
        teamId: team._id,
      });

    if (participantCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This team has participants. Remove all team members before deleting the team.",
      });
    }

    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Team Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};