const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Convert fs functions to Promise based
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);
const copyFileAsync = promisify(fs.copyFile);

// Base uploads directory
const UPLOADS_DIR = path.join(__dirname, "../uploads");

/**
 * Ensure the upload directory exists
 * @param {String} dirPath - Directory path to ensure
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await mkdirAsync(dirPath, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

/**
 * Store file locally
 * @param {String} sourcePath - Path to source file
 * @param {String} userId - User ID to use in path
 * @param {String} fileType - Type of file (profile or signature)
 * @returns {Promise} - Object with file URL and path
 */
const storeFileLocally = async (sourcePath, userId, fileType) => {
  try {
    // Create user-specific directory
    const userDir = path.join(UPLOADS_DIR, "users", userId);
    await ensureDirectoryExists(userDir);

    // Generate destination filename and path
    const filename = `${fileType}-${Date.now()}${path.extname(sourcePath)}`;
    const destPath = path.join(userDir, filename);

    // Move file from temp upload to permanent storage
    await copyFileAsync(sourcePath, destPath);

    // Delete the source file after copying
    try {
      await unlinkAsync(sourcePath);
    } catch (err) {
      // Log but don't fail if source file deletion fails
      console.warn(`Failed to delete source file: ${err.message}`);
    }

    // Get relative path for URL (remove the base directory part)
    const relativePath = path.join("uploads", "users", userId, filename);
    const url = `/${relativePath.replace(/\\/g, "/")}`; // Ensure URL uses forward slashes

    return {
      url,
      path: destPath,
    };
  } catch (error) {
    throw new Error(`Failed to store file locally: ${error.message}`);
  }
};

/**
 * Delete local file
 * @param {String} filePath - Path to file to delete
 * @returns {Promise} - Result of deletion
 */
const deleteLocalFile = async (filePath) => {
  if (!filePath) return null;

  try {
    // Only delete if the file exists and is within our uploads directory
    if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete local file: ${error.message}`);
  }
};

module.exports = {
  storeFileLocally,
  deleteLocalFile,
};
