// backend/routes/characterRoutes.js
const express = require('express');
const Character = require('../models/characterModel');
const router = express.Router();

// POST route to save character data
router.post('/create', async (req, res) => {
    try {
        const character = new Character(req.body);
        await character.save();
        res.status(201).redirect('/display'); // Redirect to CDS after saving
    } catch (error) {
        res.status(400).send('Error saving character: ' + error.message);
    }
});

module.exports = router;
