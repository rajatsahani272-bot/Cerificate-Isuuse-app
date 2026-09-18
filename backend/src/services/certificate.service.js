import {
  getActiveTemplate,
} from "./template.service.js";

import {
  createCertificatePdf,
} from "./pdf.service.js";

import {
  uploadToCloudinary,
} from "./cloudinary.service.js";

const getCertificateType = (
  winnerPosition
) => {
  if (Number(winnerPosition) === 1) {
    return "FIRST_WINNER";
  }

  if (Number(winnerPosition) === 2) {
    return "SECOND_WINNER";
  }

  if (Number(winnerPosition) === 3) {
    return "THIRD_WINNER";
  }

  return "PARTICIPATION";
};

export const generateCertificatePdf = async ({
  participant,
  team,
  hackathon,
}) => {
  if (!participant) {
    throw new Error("Participant is missing");
  }

  if (!team) {
    throw new Error("Team is missing");
  }

  if (!hackathon) {
    throw new Error("Hackathon is missing");
  }

  const certificateType = getCertificateType(
    team.winnerPosition
  );

  const template = await getActiveTemplate(
    hackathon._id,
    certificateType
  );

  const certificateId =
    `CERT-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;

  const pdfBuffer = await createCertificatePdf({
    template,
    participant,
    team,
    certificateId,
  });

  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error(
      "Certificate PDF buffer was not generated"
    );
  }

  const result = await uploadToCloudinary(
    pdfBuffer,
    `certificate-${participant._id}-${Date.now()}.pdf`,
    "certificate-system/certificates",
    "application/pdf"
  );

  if (!result || !result.secure_url) {
    throw new Error(
      "Certificate PDF upload failed"
    );
  }

  return {
    certificateType,
    certificateId,
    pdfUrl: result.secure_url,
  };
};