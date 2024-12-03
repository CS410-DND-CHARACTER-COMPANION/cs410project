// Import the mongoose library for MongoDB object modeling
const mongoose = require("mongoose");

// Define the character schema with relevant fields
const characterSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: { type: String, required: true },
    species: { type: String, required: true },
    class: { type: String, required: true },
    level: { type: Number, required: true },
    background: String,
    subclass: String,
    xp: { type: Number, default: 0 },
    strength: { type: Number, required: true },
    strengthModifier: { type: Number, default: 0 },
    dexterity: { type: Number, required: true },
    dexterityModifier: { type: Number, default: 0 },
    constitution: { type: Number, required: true },
    constitutionModifier: { type: Number, default: 0 },
    intelligence: { type: Number, required: true },
    intelligenceModifier: { type: Number, default: 0 },
    wisdom: { type: Number, required: true },
    wisdomModifier: { type: Number, default: 0 },
    charisma: { type: Number, required: true },
    charismaModifier: { type: Number, default: 0 },
    ac: { type: Number, required: true },
    currentHp: { type: Number, required: true },
    maxHp: { type: Number, required: true },
    initiative: Number,
    speed: Number,
    hasShield: { type: Boolean, default: false },
    inventory: [String],
});

// Create a model for the Character using the defined schema
const Character = mongoose.model(
    "Character",
    characterSchema,
    "character_sheets"
);

// Export the Character model for use in other parts of the application
module.exports = Character;
