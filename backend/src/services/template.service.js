
import CertificateTemplate from "../models/CertificateTemplate.js";

export const getActiveTemplate = async (
  hackathonId,
  type
) => {
  if (!hackathonId) {
    throw new Error("Hackathon ID is required");
  }

  if (!type) {
    throw new Error("Certificate type is required");
  }

  const template =
    await CertificateTemplate.findOne({
      hackathonId,
      type,
      isActive: true,
    }).lean();

  if (!template) {
    throw new Error(
      `Active ${type} template not found for this hackathon`
    );
  }

  const templateUrl =
    template.fileUrl || template.imageUrl;

  if (!templateUrl) {
    throw new Error(
      `${type} template URL is missing`
    );
  }

  return {
    ...template,
    fileUrl: templateUrl,
  };
};