const multer = require("multer");
const path = require("path");

// Set storage engine for local storage (temporary before uploading to cloud)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists or is created on startup
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File type check
const fileFilter = (req, file, cb) => {
  // Only allow images and PDF for signature
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;

  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: Only images (jpeg, jpg, png, gif) and PDF files are allowed!"
      )
    );
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
  fileFilter: fileFilter,
});

module.exports = { upload };
