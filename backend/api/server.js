// This file is the entry point for serverless functions on Vercel
const app = require('./index');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Log incoming requests in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log(`[Vercel] Received ${req.method} request to ${req.url}`);
  }
  
  // Properly handle the Express app as middleware
  return new Promise((resolve, reject) => {
    try {
      // Set a timeout to avoid hanging requests
      const timeout = setTimeout(() => {
        console.error('[Vercel] Request timeout');
        res.status(504).json({ error: 'Gateway Timeout' });
        resolve();
      }, 10000);
      
      // Add a listener to handle when the response is complete
      res.on('finish', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      // Process the request with the Express app
      app(req, res);
    } catch (error) {
      console.error('[Vercel] Error handling request:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
      }
      resolve();
    }
  });
};
