const Character = require('../models/Character');

// Save a new character
exports.createCharacter = async (req, res) => {
    try {
        const newCharacter = new Character(req.body);
        await newCharacter.save();
        res.status(201).json(newCharacter); // Send the saved character back to the client
    } catch (error) {
        res.status(500).json({ message: 'Error saving character' });
    }
};

// Get all characters
exports.getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.find();
        res.status(200).json(characters);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving characters' });
    }
};

// Get a single character by ID
exports.getCharacterById = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        res.status(200).json(character);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving character' });
    }
};
