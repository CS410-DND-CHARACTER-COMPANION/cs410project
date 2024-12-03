const express = require("express");
const router = express.Router();
const characterController = require("../controllers/characterController");

// Create a new character
router.post("/create", characterController.createCharacter);

// Get all characters
router.get("/", characterController.getAllCharacters);

// Get a character by username
router.get("/:username", characterController.getCharacterByUsername);

// Update a character
router.put("/:username", characterController.updateCharacter);

// Delete a character
router.delete("/:username", characterController.deleteCharacter);

module.exports = router;
