/**
 * Standard API response handler
 */

// Success response
exports.success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

// Error response
exports.error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// Not found response
exports.notFound = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    error: message,
  });
};

// Unauthorized response
exports.unauthorized = (res, message = "Unauthorized access") => {
  return res.status(401).json({
    success: false,
    error: message,
  });
};

// Forbidden response
exports.forbidden = (res, message = "Access forbidden") => {
  return res.status(403).json({
    success: false,
    error: message,
  });
};

// Bad request response
exports.badRequest = (res, message = "Bad request") => {
  return res.status(400).json({
    success: false,
    error: message,
  });
};
