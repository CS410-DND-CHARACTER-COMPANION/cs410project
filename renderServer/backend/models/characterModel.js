const mongoose = require('mongoose'); // Import the mongoose library for MongoDB object modeling

// Define the character schema with relevant fields
const characterSchema = new mongoose.Schema({
    name: String,         // Character's name
    species: String,      // Character's species
    class: String,        // Character's class
    level: Number,        // Character's level
    ac: Number,           // Armor Class
    currentHP: Number,    // Current Hit Points
    maxHP: Number,        // Maximum Hit Points
    inventory: Array,     // Inventory items (array)
    // Add other fields as needed
});

// Create a model for the Character using the defined schema
const Character = mongoose.model('Character', characterSchema);

// Export the Character model for use in other parts of the application
module.exports = Character;
