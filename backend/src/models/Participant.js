import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    college: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

participantSchema.index(
  { hackathonId: 1, email: 1 },
  { unique: true }
);

const Participant = mongoose.model(
  "Participant",
  participantSchema
);

export default Participant;