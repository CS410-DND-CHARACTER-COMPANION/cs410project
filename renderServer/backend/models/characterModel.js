const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: String,
    species: String,
    class: String,
    level: Number,
    ac: Number,
    currentHP: Number,
    maxHP: Number,
    inventory: Array,
    // Add other fields as needed
});

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;
