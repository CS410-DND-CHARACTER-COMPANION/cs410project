const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']; // Extract token from the Authorization header
  if (!token) return res.status(403).json({ message: 'No token provided' }); // Respond with 403 if no token is provided

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' }); // Handle verification errors

    req.userId = decoded.userId; // Store the user ID from the decoded token in the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyToken; // Export the verifyToken middleware
