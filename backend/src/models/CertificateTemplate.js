import mongoose from "mongoose";

const certificateTemplateSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
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

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CertificateTemplate = mongoose.model(
  "CertificateTemplate",
  certificateTemplateSchema
);

export default CertificateTemplate;