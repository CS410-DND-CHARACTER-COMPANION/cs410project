// backend/models/characterModel.js
const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: String,
    class: String,
    level: Number,
    // Add other fields as needed
});

const Character = mongoose.model('Character', characterSchema);
module.exports = Character;
