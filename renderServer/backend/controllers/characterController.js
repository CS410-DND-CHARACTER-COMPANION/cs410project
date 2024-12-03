// Import the Character model
const Character = require("../models/Character");

// Save a new character
exports.createCharacter = async (req, res) => {
    try {
        // Create a new character instance with request body
        const newCharacter = new Character(req.body);
        // Save the character to the database
        await newCharacter.save();
        // Respond with the created character and a 201 status
        res.status(201).json(newCharacter);
    } catch (error) {
        // Handle errors with a 500 status
        res.status(500).json({ message: "Error saving character" });
    }
};

// Get all characters
exports.getAllCharacters = async (req, res) => {
    try {
        // Retrieve all characters from the database
        const characters = await Character.find();
        // Respond with the list of characters and a 200 status
        res.status(200).json(characters);
    } catch (error) {
        // Handle errors with a 500 status
        res.status(500).json({ message: "Error retrieving characters" });
    }
};

// Get a single character by ID
exports.getCharacterById = async (req, res) => {
    try {
        // Find character by ID from request parameters
        const character = await Character.findById(req.params.id);
        if (!character) {
            // Handle case where character is not found
            return res.status(404).json({ message: "Character not found" });
        }
        // Respond with the found character and a 200 status
        res.status(200).json(character);
    } catch (error) {
        // Handle errors with a 500 status
        res.status(500).json({ message: "Error retrieving character" });
    }
};
