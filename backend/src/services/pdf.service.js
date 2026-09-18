import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

const downloadFile = async (url) => {
  if (!url) {
    throw new Error("Template file URL is missing");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to download template. Status: ${response.status}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
};

const getExtension = (fileName, fileUrl) => {
  const source = fileName || fileUrl || "";

  const cleanSource = source
    .split("?")[0]
    .split("#")[0];

  const fileNameFromSource = cleanSource
    .split("/")
    .pop()
    .toLowerCase();

  if (!fileNameFromSource.includes(".")) {
    return "";
  }

  return fileNameFromSource.split(".").pop();
};

const drawCenteredText = (
  page,
  text,
  y,
  size,
  font,
  color = rgb(0, 0, 0)
) => {
  const textWidth = font.widthOfTextAtSize(
    text,
    size
  );

  const pageWidth = page.getWidth();

  page.drawText(text, {
    x: (pageWidth - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
};

export const createCertificatePdf = async ({
  template,
  participant,
  team,
  certificateId,
}) => {
  if (!template) {
    throw new Error("Certificate template is missing");
  }

  if (!participant) {
    throw new Error("Participant data is missing");
  }

  if (!team) {
    throw new Error("Team data is missing");
  }

  if (!certificateId) {
    throw new Error("Certificate ID is missing");
  }

  const templateUrl =
    template.fileUrl || template.imageUrl;

  if (!templateUrl) {
    throw new Error("Template URL is missing");
  }

  const extension = getExtension(
    template.fileName,
    templateUrl
  );

  if (!["png", "jpg", "jpeg"].includes(extension)) {
    throw new Error(
      `Unsupported template format: ${
        extension || "unknown"
      }. Only PNG, JPG and JPEG are supported`
    );
  }

  const templateBuffer = await downloadFile(
    templateUrl
  );

  const pdfDoc = await PDFDocument.create();

  let image;

  try {
    if (extension === "png") {
      image = await pdfDoc.embedPng(
        templateBuffer
      );
    } else {
      image = await pdfDoc.embedJpg(
        templateBuffer
      );
    }
  } catch (error) {
    throw new Error(
      `Unable to process template image: ${error.message}`
    );
  }

  const page = pdfDoc.addPage([
    image.width,
    image.height,
  ]);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const regularFont = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  const pageHeight = page.getHeight();

  const participantName =
    participant.name?.trim() ||
    participant.fullName?.trim() ||
    "Participant";

  const teamName =
    team.teamName
      ?.trim()
      .replace(/^team\s*/i, "") || "";

  const participantY = pageHeight * 0.53;
  const teamY = pageHeight * 0.455;

  drawCenteredText(
    page,
    participantName,
    participantY,
    30,
    boldFont,
    rgb(0, 0, 0)
  );

  if (teamName) {
    drawCenteredText(
      page,
      teamName,
      teamY,
      20,
      boldFont,
      rgb(0, 0, 0)
    );
  }

  page.drawText(certificateId, {
    x: 35,
    y: 35,
    size: 10,
    font: regularFont,
    color: rgb(0.35, 0.35, 0.35),
  });

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
};