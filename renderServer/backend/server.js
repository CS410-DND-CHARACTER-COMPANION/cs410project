
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require('./routes/userRoutes');
const verifyToken = require('./middleware/authMiddleware');
const Character = require('./models/characterModel'); // Import the Character model

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Port setup
const port = process.env.PORT || 3000;  // Use environment port for Render

// Database connection with mongoose
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("MONGO_URI is not defined in the environment variables.");
    process.exit(1); // Exit if MONGO_URI is not defined
}

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));  // Adjust path for correct directory structure

// Route for user-related API endpoints
app.use('/api/users', userRoutes);

// Protected route example
app.get('/api/users/profile', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected profile route!' });
});

// Connect to frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));  // Corrected path
});

// New route for character sheet page
app.get('/character-sheet-v1.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'character-sheet-v1.html'));  // Corrected path
});

// socket.io connection
io.on('connection', (socket) => {
    console.log("A user connected:", socket.id);

    // Get a list of all characters
    socket.on('getAllCharacters', async () => {
        try {
            const characters = await Character.find();
            socket.emit('charactersList', characters);
        } catch (e) {
            console.error("Error getting characters:", e);
            socket.emit('error', 'Failed to retrieve characters');
        }
    });

    // New handler for getting a single character
    socket.on('getCharacter', async (characterId) => {
        try {
            const character = await Character.findById(characterId);
            if (character) {
                socket.emit('characterData', character);
            } else {
                socket.emit('error', 'Character not found');
            }
        } catch (e) {
            console.error("Error retrieving character:", e);
            socket.emit('error', 'Failed to retrieve character');
        }
    });

    // Real-time event: new character created
    socket.on('newCharacter', async (character) => {
        try {
            const newCharacter = new Character(character); // Simplified instantiation
            await newCharacter.save();
            io.emit('characterAdded', newCharacter);
        } catch (e) {
            console.error("Error creating character:", e);
            socket.emit('error', 'Failed to create character');
        }
    });

    // Save character
    socket.on('saveCharacter', async (characterData) => {
        try {
            const newCharacter = new Character(characterData); // Simplified instantiation
            const result = await newCharacter.save();
            socket.emit('characterSaved', { success: true, characterId: result._id });
        } catch (e) {
            console.error("Error saving character:", e);
            socket.emit('characterSaved', { success: false, error: 'Failed to save character' });
        }
    });

    // Real-time event: character sheet updated
    socket.on('updateCharacter', async (updatedCharacter) => {
        try {
            const character = await Character.findByIdAndUpdate(
                updatedCharacter._id,
                updatedCharacter,
                { new: true }
            );
            io.emit('characterUpdated', character);
        } catch (e) {
            console.error("Error updating character:", e);
            socket.emit('error', 'Failed to update character');
        }
    });

    socket.on("disconnect", () => {
        console.log("User  disconnected:", socket.id);
    });
});

// Start listening on the defined port
server.listen(port, () => {
    console.log("DnD app listening on port " + port);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    await mongoose.connection.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
