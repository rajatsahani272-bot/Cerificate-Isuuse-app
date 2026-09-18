import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";

export const assignWinner = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { winnerPosition } = req.body;

    if (
      winnerPosition !== null &&
      ![1, 2, 3].includes(winnerPosition)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Winner position must be 1, 2, 3 or null",
      });
    }

    const team = await Team.findById(teamId);

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
          "You are not authorized to manage this team",
      });
    }

    if (winnerPosition === null) {
      team.winnerPosition = null;

      await team.save();

      return res.status(200).json({
        success: true,
        message: "Winner position removed",
        team,
      });
    }

    const existingWinner = await Team.findOne({
      hackathonId: team.hackathonId,
      winnerPosition,
      _id: { $ne: teamId },
    });

    if (existingWinner) {
      return res.status(409).json({
        success: false,
        message:
          `Another team is already assigned as ${winnerPosition}${winnerPosition === 1 ? "st" : winnerPosition === 2 ? "nd" : "rd"} winner`,
      });
    }

    team.winnerPosition = winnerPosition;

    await team.save();

    res.status(200).json({
      success: true,
      message:
        `${winnerPosition}${winnerPosition === 1 ? "st" : winnerPosition === 2 ? "nd" : "rd"} winner assigned successfully`,
      team,
    });
  } catch (error) {
    console.error(
      "Assign Winner Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getWinners = async (req, res) => {
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

    const winners = await Team.find({
      hackathonId,
      winnerPosition: {
        $in: [1, 2, 3],
      },
    }).sort({
      winnerPosition: 1,
    });

    res.status(200).json({
      success: true,
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error(
      "Get Winners Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllTeamsForWinner = async (
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

    const teams = await Team.find({
      hackathonId,
    }).sort({
      teamName: 1,
    });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error(
      "Get Teams For Winner Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};