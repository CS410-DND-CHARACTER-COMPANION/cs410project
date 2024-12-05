const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("No token or invalid format");
    return res.status(403).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    req.userId = decoded.userId;
    console.log("Decoded Token:", decoded);
    next();
  });
};

module.exports = verifyToken;
