// Import the express library
const express = require("express");
// Create a new router instance
const router = express.Router();

// Example route to get a list of users
router.get("/", (req, res) => {
  // Placeholder for database logic to retrieve users
  res.json({ message: "List of users" });
});

// Example route to get a specific user by ID
router.get("/:id", (req, res) => {
  // Extract user ID from request parameters
  const userId = req.params.id;
  // Placeholder for database lookup logic for the specific user
  res.json({ message: `User  data for user ID: ${userId}` });
});

// Example route to create a new user
router.post("/", (req, res) => {
  // Get new user data from the request body
  const newUser = req.body;
  // In a real app, you'd validate and save this to a database
  res.status(201).json({
    // Respond with a 201 status for successful creation
    message: "User  created successfully",
    // Include the created user data in the response
    user: newUser,
  });
});

// Export the router for use in other parts of the application
module.exports = router;
