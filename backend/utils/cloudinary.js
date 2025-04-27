const cloudinary = require("cloudinary").v2;
const config = require("../config/config");
const fs = require("fs");
const { promisify } = require("util");

// Convert fs.unlink to Promise based
const unlinkAsync = promisify(fs.unlink);

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Path to file to upload
 * @param {String} folder - Folder in Cloudinary to upload to
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });

    // Delete the local file after upload
    await unlinkAsync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Still try to delete the file even if upload failed
    try {
      await unlinkAsync(filePath);
    } catch (e) {
      /* ignore */
    }
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of file to delete
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
