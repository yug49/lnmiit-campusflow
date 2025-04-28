// Standalone serverless function to test MongoDB connection
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    console.log('[MongoDB Test] Testing MongoDB connection...');
    
    // Attempt database connection
    const conn = await connectDB();
    
    // If successful, return success message
    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful',
      host: conn.connection.host,
      database: conn.connection.db.databaseName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MongoDB Test] Connection failed:', error.message);
    
    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};