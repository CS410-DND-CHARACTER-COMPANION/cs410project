const express = require('express'); // Import the express library
const router = express.Router(); // Create a new router instance

// Example route to get a list of users
router.get('/', (req, res) => {
  // Placeholder for database logic to retrieve users
  res.json({ message: 'List of users' }); // Respond with a JSON message
});

// Example route to get a specific user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id; // Extract user ID from request parameters
  // Placeholder for database lookup logic for the specific user
  res.json({ message: `User  data for user ID: ${userId}` }); // Respond with user data
});

// Example route to create a new user
router.post('/', (req, res) => {
  const newUser  = req.body; // Get new user data from the request body
  // In a real app, you'd validate and save this to a database
  res.status(201).json({ // Respond with a 201 status for successful creation
    message: 'User  created successfully',
    user: newUser , // Include the created user data in the response
  });
});

module.exports = router; // Export the router for use in other parts of the application
