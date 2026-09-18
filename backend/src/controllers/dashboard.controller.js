import Hackathon from "../models/Hackathon.js";
import Team from "../models/Team.js";
import Participant from "../models/Participant.js";
import Certificate from "../models/Certificate.js";

export const getDashboardStats = async (req, res) => {
  try {
    const hackathons = await Hackathon.countDocuments({
      createdBy: req.adminId,
    });

    const hackathonIds = await Hackathon.find({
      createdBy: req.adminId,
    }).distinct("_id");

    const teams = await Team.countDocuments({
      hackathonId: { $in: hackathonIds },
    });

    const participants = await Participant.countDocuments({
      hackathonId: { $in: hackathonIds },
    });

    const winners = await Team.countDocuments({
      hackathonId: { $in: hackathonIds },
      winnerPosition: { $in: [1, 2, 3] },
    });

    const certificates = await Certificate.countDocuments({
      hackathonId: { $in: hackathonIds },
    });

    res.status(200).json({
      success: true,
      stats: {
        hackathons,
        teams,
        participants,
        winners,
        certificates,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};