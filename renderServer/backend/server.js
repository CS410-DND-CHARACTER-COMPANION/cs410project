
const express = require("express"); // Import the Express framework
const path = require("path"); // Import path module for file path handling
const http = require("http"); // Import HTTP module to create a server
const { Server } = require("socket.io"); // Import Socket.IO for real-time communication
const mongoose = require("mongoose"); // Import Mongoose for MongoDB interactions
const dotenv = require("dotenv"); // Import dotenv to manage environment variables
const userRoutes = require('./routes/userRoutes'); // Import user-related routes
const verifyToken = require('./middleware/authMiddleware'); // Import middleware for token verification
const Character = require('./models/characterModel'); // Import the Character model

// Load environment variables from .env file
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server); // Initialize Socket.IO server

// Port setup: use environment variable or default to 3000
const port = process.env.PORT || 3000;

// Database connection with Mongoose
const uri = process.env.MONGO_URI; // Get MongoDB URI from environment variables
if (!uri) {
    console.error("MONGO_URI is not defined in the environment variables."); // Log error if URI is missing
    process.exit(1); // Exit if MONGO_URI is not defined
}

// Connect to MongoDB and handle connection success or error
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB")) // Log success message
    .catch(err => console.error("MongoDB connection error:", err)); // Log connection error

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend'))); // Adjust path for correct directory structure

// Route for user-related API endpoints
app.use('/api/users', userRoutes);

// Protected route example: requires token verification
app.get('/api/users/profile', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected profile route!' }); // Respond with a message
});

// Connect to frontend: serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html')); // Serve index.html
});

// New route for character sheet page
app.get('/character-sheet-v1.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'character-sheet-v1.html')); // Serve character sheet HTML
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log("A user connected:", socket.id); // Log when a user connects

    // Get a list of all characters
    socket.on('getAllCharacters', async () => {
        try {
            const characters = await Character.find(); // Fetch all characters from the database
            socket.emit('charactersList', characters); // Emit the list of characters to the client
        } catch (e) {
            console.error("Error getting characters:", e); // Log error
            socket.emit('error', 'Failed to retrieve characters'); // Emit error message
        }
    });

    // New handler for getting a single character by ID
    socket.on('getCharacter', async (username) => {
        try {
            const character = await Character.findOne({ username: username }); // Search by username
            if (character) {
                socket.emit('characterData', character); // Emit character data if found
            } else {
                socket.emit('error', 'Character not found'); // Emit error if not found
            }
        } catch (e) {
            console.error("Error retrieving character:", e); // Log error
            socket.emit('error', 'Failed to retrieve character'); // Emit error message
        }
    });

    // Real-time event: new character created
    socket.on('newCharacter', async (character) => {
        try {
            const newCharacter = new Character(character); // Create a new character instance
            await newCharacter.save(); // Save the new character to the database
            io.emit('characterAdded', newCharacter); // Emit event to all clients
        } catch (e) {
            console.error("Error creating character:", e); // Log error
            socket.emit('error', 'Failed to create character'); // Emit error message
        }
    });

    // Save character event
    socket.on('saveCharacter', async ({ userId, characterId, data }) => {
        try {
            // Check if username already exists
            const existingCharacter = await Character.findOne({ username: data.username });
            if (existingCharacter) {
                socket.emit('characterSaved', {
                    success: false,
                    error: 'Username already exists. Please choose a different username.'
                });
                return;
            }

            // Format the data to match the schema
            const characterData = {
                username: data.username,
                name: data.name,
                species: data.species,
                class: data.class,
                level: parseInt(data.level),
                background: data.background,
                subclass: data.subclass,
                xp: parseInt(data.xp) || 0,
                strength: parseInt(data.strength),
                dexterity: parseInt(data.dexterity),
                constitution: parseInt(data.constitution),
                intelligence: parseInt(data.intelligence),
                wisdom: parseInt(data.wisdom),
                charisma: parseInt(data.charisma),
                ac: parseInt(data.ac),
                currentHp: parseInt(data['current-hp']), // Note the different field name
                maxHp: parseInt(data['max-hp']), // Note the different field name
                initiative: parseInt(data.initiative),
                speed: parseInt(data.speed),
                hasShield: Boolean(data.shield),
                inventory: Array.isArray(data.equipment) ? data.equipment : []
            };

            const newCharacter = new Character(characterData);
            const result = await newCharacter.save();
            socket.emit('characterSaved', {
                success: true,
                characterId: result._id,
                username: result.username
            });
        } catch (e) {
            console.error("Error saving character:", e);
            socket.emit('characterSaved', {
                success: false,
                error: e.code === 11000 ? 'Username already exists' : 'Failed to save character'
            });
        }
    });

    // Real-time event: character sheet updated
    socket.on('updateCharacter', async (updatedCharacter) => {
        try {
            const character = await Character.findByIdAndUpdate(
                updatedCharacter._id, // Find character by ID
                updatedCharacter, // Update with new data
                { new: true } // Return the updated document
            );
            io.emit('characterUpdated', character); // Emit updated character to all clients
        } catch (e) {
            console.error("Error updating character:", e); // Log error
            socket.emit('error', 'Failed to update character'); // Emit error message
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User  disconnected:", socket.id); // Log when a user disconnects
    });
});

// Start listening on the defined port
server.listen(port, () => {
    console.log("DnD app listening on port " + port); // Log server start message
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...'); // Log shutdown message
    await mongoose.connection.close(); // Close MongoDB connection
    server.close(() => {
        console.log('Server closed'); // Log server closure
        process.exit(0); // Exit the process
    });
});
