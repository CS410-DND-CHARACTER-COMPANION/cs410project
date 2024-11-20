const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');

// Route for creating a character
router.post('/create', characterController.createCharacter);

// Route for getting all characters
router.get('/', characterController.getAllCharacters);

// Route for getting a character by ID
router.get('/:id', characterController.getCharacterById);

module.exports = router;
