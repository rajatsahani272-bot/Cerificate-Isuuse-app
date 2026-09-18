import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    registrationId: {
      type: String,
      required: true,
      trim: true,
    },

    winnerPosition: {
      type: Number,
      enum: [1, 2, 3, null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index(
  { hackathonId: 1, registrationId: 1 },
  { unique: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;