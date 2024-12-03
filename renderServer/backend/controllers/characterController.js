const Character = require("../models/characterModel");

// Create a new character
exports.createCharacter = async (req, res) => {
    try {
        const newCharacter = new Character(req.body);
        await newCharacter.save();
        res.status(201).json(newCharacter);
    } catch (error) {
        res.status(500).json({
            message: "Error saving character",
            error: error.message,
        });
    }
};

// Get all characters
exports.getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.find(
            {},
            "username name species class level currentHp maxHp"
        );
        res.status(200).json(characters);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving characters",
            error: error.message,
        });
    }
};

// Get a single character by username
exports.getCharacterByUsername = async (req, res) => {
    try {
        const character = await Character.findOne({
            username: req.params.username,
        });
        if (!character) {
            return res.status(404).json({ message: "Character not found" });
        }
        res.status(200).json(character);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving character",
            error: error.message,
        });
    }
};

// Update a character
exports.updateCharacter = async (req, res) => {
    try {
        const { username } = req.params;
        const updateData = req.body;

        // Find and update the character
        const updatedCharacter = await Character.findOneAndUpdate(
            { username: username },
            { $set: updateData },
            {
                new: true, // Return the modified document
                runValidators: true, // Run model validation
            }
        );

        if (!updatedCharacter) {
            return res.status(404).json({ message: "Character not found" });
        }

        res.status(200).json(updatedCharacter);
    } catch (error) {
        res.status(500).json({
            message: "Error updating character",
            error: error.message,
        });
    }
};

// Delete a character
exports.deleteCharacter = async (req, res) => {
    try {
        const { username } = req.params;
        const deletedCharacter = await Character.findOneAndDelete({
            username: username,
        });

        if (!deletedCharacter) {
            return res.status(404).json({ message: "Character not found" });
        }

        res.status(200).json({
            message: "Character deleted successfully",
            character: deletedCharacter,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting character",
            error: error.message,
        });
    }
};
