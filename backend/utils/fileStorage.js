const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { uploadToCloudinary, deleteFromCloudinary } = require("./cloudinary");
const localFileStorage = require("./localFileStorage");
const config = require("../config/config");

// Convert fs functions to Promise based
const unlinkAsync = promisify(fs.unlink);

/**
 * Store file based on environment
 * In production: Upload to Cloudinary
 * In development: Store locally
 *
 * @param {String} filePath - Path to source file
 * @param {String} userId - User ID to use in path
 * @param {String} fileType - Type of file (profile or signature)
 * @returns {Promise} - Object with file URL, path, and publicId (for Cloudinary)
 */
const storeFile = async (filePath, userId, fileType) => {
  try {
    // In production, use Cloudinary
    if (config.nodeEnv === "production") {
      const folder = `users/${userId}`;
      const result = await uploadToCloudinary(filePath, folder);

      return {
        url: result.url,
        publicId: result.publicId,
        path: null, // No local path in production
      };
    }
    // In development, use local file storage
    else {
      const result = await localFileStorage.storeFileLocally(
        filePath,
        userId,
        fileType
      );
      return {
        url: result.url,
        path: result.path,
        publicId: null,
      };
    }
  } catch (error) {
    throw new Error(`Failed to store file: ${error.message}`);
  }
};

/**
 * Delete file based on environment
 * In production: Delete from Cloudinary
 * In development: Delete from local storage
 *
 * @param {Object} file - File object with path and publicId
 * @returns {Promise} - Result of deletion
 */
const deleteFile = async (file) => {
  if (!file) return null;

  try {
    // In production, delete from Cloudinary
    if (config.nodeEnv === "production") {
      if (file.publicId) {
        return await deleteFromCloudinary(file.publicId);
      }
    }
    // In development, delete from local storage
    else {
      if (file.path) {
        return await localFileStorage.deleteLocalFile(file.path);
      }
    }
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = {
  storeFile,
  deleteFile,
};
