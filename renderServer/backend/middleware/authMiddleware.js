// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.headers["authorization"];
  // Respond with 403 if no token is provided
  if (!token) return res.status(403).json({ message: "No token provided" });

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Handle verification errors
    if (err)
      return res.status(500).json({ message: "Failed to authenticate token" });
    // Store the user ID from the decoded token in the request object
    req.userId = decoded.userId;
    // Proceed to the next middleware or route handler
    next();
  });
};

// Export the verifyToken middleware
module.exports = verifyToken;
