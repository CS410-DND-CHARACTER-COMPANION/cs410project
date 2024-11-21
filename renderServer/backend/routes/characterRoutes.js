const express = require('express'); // Import the express library
const router = express.Router(); // Create a new router instance
const characterController = require('../controllers/characterController'); // Import the character controller

// Route for creating a character
router.post('/create', characterController.createCharacter); // Handle POST requests to create a new character

// Route for getting all characters
router.get('/', characterController.getAllCharacters); // Handle GET requests to retrieve all characters

// Route for getting a character by ID
router.get('/:id', characterController.getCharacterById); // Handle GET requests to retrieve a character by its ID

module.exports = router; // Export the router for use in other parts of the application
