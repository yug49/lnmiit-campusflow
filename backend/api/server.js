// This file is the entry point for serverless functions on Vercel
const app = require('./index');

// Vercel serverless function handler
module.exports = (req, res) => {
  // Log incoming requests in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log(`[Vercel] Received ${req.method} request to ${req.url}`);
  }
  
  // Forward the request to our Express app
  return app(req, res);
};
