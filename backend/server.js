const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const connectDB = require("./config/db");
const { errorHandler } = require("./utils/errorHandler");
const path = require("path");

// Simple rate limiting middleware
const rateLimit = (windowMs, max) => {
    const requests = new Map();
    const cleanup = setInterval(() => {
        const now = Date.now();
        requests.forEach((timestamps, ip) => {
            // Filter out timestamps outside the window
            requests.set(
                ip,
                timestamps.filter((time) => now - time < windowMs)
            );
            // Remove empty entries
            if (requests.get(ip).length === 0) {
                requests.delete(ip);
            }
        });
    }, windowMs);

    // Ensure cleanup interval doesn't keep process running
    cleanup.unref();

    return (req, res, next) => {
        const ip =
            req.ip ||
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress;

        // Initialize or get timestamps for this IP
        const timestamps = requests.get(ip) || [];

        // Check if rate limit is exceeded
        if (timestamps.length >= max) {
            return res.status(429).json({
                success: false,
                message: "Too many requests, please try again later.",
            });
        }

        // Add current timestamp and update map
        timestamps.push(Date.now());
        requests.set(ip, timestamps);

        next();
    };
};

// Initialize express app
const app = express();

// Security middleware for production
if (config.nodeEnv === "production") {
    // Force HTTPS in production
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });

    // Set security headers
    app.use((req, res, next) => {
        res.setHeader(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        );
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        next();
    });
}

// Configure CORS based on environment
const corsOptions = {
    origin:
        config.nodeEnv === "production"
            ? ["https://your-production-domain.com"] // Update with your actual production domain
            : "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply rate limiting middleware
app.use(rateLimit(15 * 60 * 1000, 100)); // 15 minutes window, max 100 requests

// Routes
app.use("/api/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
// const noDuesRoutes = require('./routes/noDues.routes');
// const eventRoutes = require('./routes/event.routes');
const mouRoutes = require("./routes/mou.routes");
const votingRoutes = require("./routes/voting.routes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/nodues', noDuesRoutes);
// app.use('/api/events', eventRoutes);
app.use("/api/mou", mouRoutes);
app.use("/api/voting", votingRoutes);

// Global error handler
app.use(errorHandler);

// Function to find an available port
const findAvailablePort = (startPort, maxAttempts = 10) => {
    return new Promise((resolve, reject) => {
        // Try to listen on the port
        const tryPort = (port, attemptsLeft) => {
            const server = require("http").createServer();

            server.on("error", (err) => {
                if (err.code === "EADDRINUSE") {
                    console.log(
                        `Port ${port} is busy, trying port ${port + 1}...`
                    );
                    if (attemptsLeft > 0) {
                        tryPort(port + 1, attemptsLeft - 1);
                    } else {
                        reject(
                            new Error(
                                "Could not find an available port after multiple attempts"
                            )
                        );
                    }
                } else {
                    reject(err);
                }
            });

            server.on("listening", () => {
                // Found an available port, close this test server
                server.close(() => {
                    resolve(port);
                });
            });

            server.listen(port);
        };

        tryPort(startPort, maxAttempts);
    });
};

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();

        // Get the configured port or default to 5000
        const configuredPort = config.port || 5000;

        try {
            // Find an available port starting from the configured one
            const availablePort = await findAvailablePort(configuredPort);

            // Start the server on the available port
            app.listen(availablePort, () => {
                if (availablePort !== configuredPort) {
                    console.log(
                        `Port ${configuredPort} was busy, using port ${availablePort} instead.`
                    );
                }
                console.log(`Server running on port ${availablePort}`);
            });
        } catch (portError) {
            console.error("Failed to find available port:", portError.message);
            process.exit(1);
        }
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
