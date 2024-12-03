// Import the express library
const express = require("express");
// Create a new router instance
const router = express.Router();
// Import the character controller
const characterController = require("../controllers/characterController");

// Handle POST requests to create a new character
router.post("/create", characterController.createCharacter);
// Handle GET requests to retrieve all characters
router.get("/", characterController.getAllCharacters);
// Handle GET requests to retrieve a character by its ID
router.get("/:id", characterController.getCharacterById);

// Export the router for use in other parts of the application
module.exports = router;
