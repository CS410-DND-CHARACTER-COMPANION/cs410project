const Character = require('../models/Character'); // Import the Character model

// Save a new character
exports.createCharacter = async (req, res) => {
    try {
        const newCharacter = new Character(req.body); // Create a new character instance with request body
        await newCharacter.save(); // Save the character to the database
        res.status(201).json(newCharacter); // Respond with the created character and a 201 status
    } catch (error) {
        res.status(500).json({ message: 'Error saving character' }); // Handle errors with a 500 status
    }
};

// Get all characters
exports.getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.find(); // Retrieve all characters from the database
        res.status(200).json(characters); // Respond with the list of characters and a 200 status
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving characters' }); // Handle errors with a 500 status
    }
};

// Get a single character by ID
exports.getCharacterById = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id); // Find character by ID from request parameters
        if (!character) {
            return res.status(404).json({ message: 'Character not found' }); // Handle case where character is not found
        }
        res.status(200).json(character); // Respond with the found character and a 200 status
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving character' }); // Handle errors with a 500 status
    }
};
