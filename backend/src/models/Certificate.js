import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PARTICIPATION",
        "FIRST_WINNER",
        "SECOND_WINNER",
        "THIRD_WINNER",
      ],
      required: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;