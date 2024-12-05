// Import the express library
const express = require("express");
const { registerUser, loginUser } = require("../userModule");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Static route for profile
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "This is a protected profile route!", userId: req.userId });
});

// User registration route
router.post("/register", registerUser);

// User login route
router.post("/login", loginUser);

// Dynamic route for user by ID
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ message: `User data for user ID: ${userId}` });
});

module.exports = router;

