import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  fileBuffer,
  fileName,
  folder = "certificate-system/templates",
  mimetype = ""
) => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(fileBuffer)) {
      return reject(
        new Error("Invalid file buffer")
      );
    }

    if (!fileName) {
      return reject(
        new Error("File name is required")
      );
    }

    const isPdf =
      mimetype === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf");

    const extension = isPdf ? ".pdf" : "";

    const publicId = fileName
      .replace(/\.[^/.]+$/, "")
      .concat(extension);

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: isPdf ? "raw" : "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result?.secure_url) {
            return reject(
              new Error(
                "Cloudinary upload returned no URL"
              )
            );
          }

          resolve(result);
        }
      );

    uploadStream.on("error", reject);

    uploadStream.end(fileBuffer);
  });
};