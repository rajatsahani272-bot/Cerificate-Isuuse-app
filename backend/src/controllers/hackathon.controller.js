import mongoose from "mongoose";
import Hackathon from "../models/Hackathon.js";

export const createHackathon = async (req, res) => {
  try {
    const {
      name,
      description,
      organization,
      logo,
      startDate,
      endDate,
      issueDate,
      status,
    } = req.body;

    if (
      !name ||
      !organization ||
      !startDate ||
      !endDate ||
      !issueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, organization, start date, end date and issue date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const issue = new Date(issueDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      Number.isNaN(issue.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date provided",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    if (issue < end) {
      return res.status(400).json({
        success: false,
        message: "Issue date cannot be before end date",
      });
    }

    const hackathon = await Hackathon.create({
      name: name.trim(),
      description: description?.trim() || "",
      organization: organization.trim(),
      logo: logo?.trim() || "",
      startDate: start,
      endDate: end,
      issueDate: issue,
      status: status || "upcoming",
      createdBy: req.adminId,
    });

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      hackathon,
    });
  } catch (error) {
    console.error(
      "Create Hackathon Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getHackathons = async (
  req,
  res
) => {
  try {
    const hackathons = await Hackathon.find({
      status: {
        $in: [
          "upcoming",
          "active",
          "completed",
        ],
      },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons,
    });
  } catch (error) {
    console.error(
      "Get Hackathons Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAdminHackathons = async (
  req,
  res
) => {
  try {
    const hackathons = await Hackathon.find({
      createdBy: req.adminId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons,
    });
  } catch (error) {
    console.error(
      "Get Admin Hackathons Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getHackathon = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    const hackathon =
      await Hackathon.findOne({
        _id: id,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.status(200).json({
      success: true,
      hackathon,
    });
  } catch (error) {
    console.error(
      "Get Hackathon Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateHackathon = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    const hackathon =
      await Hackathon.findOne({
        _id: id,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const {
      name,
      description,
      organization,
      logo,
      startDate,
      endDate,
      issueDate,
      status,
    } = req.body;

    const newStartDate = startDate
      ? new Date(startDate)
      : hackathon.startDate;

    const newEndDate = endDate
      ? new Date(endDate)
      : hackathon.endDate;

    const newIssueDate = issueDate
      ? new Date(issueDate)
      : hackathon.issueDate;

    if (
      Number.isNaN(
        newStartDate.getTime()
      ) ||
      Number.isNaN(
        newEndDate.getTime()
      ) ||
      Number.isNaN(
        newIssueDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date provided",
      });
    }

    if (newEndDate < newStartDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    if (newIssueDate < newEndDate) {
      return res.status(400).json({
        success: false,
        message:
          "Issue date cannot be before end date",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Hackathon name is required",
        });
      }

      hackathon.name = name.trim();
    }

    if (description !== undefined) {
      hackathon.description =
        description.trim();
    }

    if (organization !== undefined) {
      if (!organization.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Organization is required",
        });
      }

      hackathon.organization =
        organization.trim();
    }

    if (logo !== undefined) {
      hackathon.logo = logo.trim();
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "upcoming",
        "active",
        "completed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid hackathon status",
        });
      }

      hackathon.status = status;
    }

    hackathon.startDate = newStartDate;
    hackathon.endDate = newEndDate;
    hackathon.issueDate = newIssueDate;

    await hackathon.save();

    res.status(200).json({
      success: true,
      message:
        "Hackathon updated successfully",
      hackathon,
    });
  } catch (error) {
    console.error(
      "Update Hackathon Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteHackathon = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    const hackathon =
      await Hackathon.findOne({
        _id: id,
        createdBy: req.adminId,
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    await Hackathon.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message:
        "Hackathon deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Hackathon Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};