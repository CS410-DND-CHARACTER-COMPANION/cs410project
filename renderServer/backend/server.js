// Import the Express framework
const express = require("express");
// Import path module for file path handling
const path = require("path");
// Import HTTP module to create a server
const http = require("http");
// Import Socket.IO for real-time communication
const { Server } = require("socket.io");
// Import Mongoose for MongoDB interactions
const mongoose = require("mongoose");
// Import dotenv to manage environment variables
const dotenv = require("dotenv");
// Import user-related routes
const userRoutes = require("./routes/userRoutes");
// Import middleware for token verification
const verifyToken = require("./middleware/authMiddleware");
// Import the Character model
const Character = require("./models/characterModel");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
// Initialize Socket.IO server
const io = new Server(server);

// Port setup: use environment variable or default to 3000
const port = process.env.PORT || 3000;

// Get MongoDB URI from environment variables
const uri = process.env.MONGO_URI;
if (!uri) {
    // Log error if URI is missing
    console.error("MONGO_URI is not defined in the environment variables.");
    // Exit if MONGO_URI is not defined
    process.exit(1);
}

// Connect to MongoDB and handle connection success or error
mongoose
    .connect(uri)
    // Log success message
    .then(() => console.log("Connected to MongoDB"))
    // Log connection error
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, "../frontend")));

// Route for user-related API endpoints
app.use("/api/users", userRoutes);

// Protected route example: requires token verification
app.get("/api/users/profile", verifyToken, (req, res) => {
    res.json({ message: "This is a protected profile route!" });
});

// Connect to frontend: serve the main HTML file
app.get("/", (req, res) => {
    // Serve index.html
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// New route for character sheet page
app.get("/character-sheet-v1.html", (req, res) => {
    // Serve character sheet HTML
    res.sendFile(path.join(__dirname, "../frontend", "character-sheet-v1.html"));
});

// Socket.IO connection event
io.on("connection", (socket) => {
    // Log when a user connects
    console.log("A user connected:", socket.id);

    // Get a list of all characters
    socket.on("getAllCharacters", async () => {
        try {
            // Fetch all characters from the database
            const characters = await Character.find();
            // Emit the list of characters to the client
            socket.emit("charactersList", characters);
        } catch (e) {
            console.error("Error getting characters:", e);
            socket.emit("error", "Failed to retrieve characters");
        }
    });

    // New handler for getting a single character by ID
    socket.on("getCharacter", async (username) => {
        try {
            // Search by username
            const character = await Character.findOne({ username: username });
            if (character) {
                // Emit character data if found
                socket.emit("characterData", character);
            } else {
                // Emit error if not found
                socket.emit("error", "Character not found");
            }
        } catch (e) {
            // Log error
            console.error("Error retrieving character:", e);
            // Emit error message
            socket.emit("error", "Failed to retrieve character");
        }
    });

    // Real-time event: new character created
    socket.on("newCharacter", async (character) => {
        try {
            // Create a new character instance
            const newCharacter = new Character(character);
            // Save the new character to the database
            await newCharacter.save();
            // Emit event to all clients
            io.emit("characterAdded", newCharacter);
        } catch (e) {
            // Log error
            console.error("Error creating character:", e);
            // Emit error message
            socket.emit("error", "Failed to create character");
        }
    });

    // Save character event
    socket.on("saveCharacter", async ({ userId, characterId, data }) => {
        try {
            // Check if username already exists
            const existingCharacter = await Character.findOne({
                username: data.username,
            });
            if (existingCharacter) {
                socket.emit("characterSaved", {
                    success: false,
                    error: "Username already exists. Please choose a different username.",
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
                currentHp: parseInt(data["current-hp"]),
                maxHp: parseInt(data["max-hp"]),
                initiative: parseInt(data.initiative),
                speed: parseInt(data.speed),
                hasShield: Boolean(data.shield),
                inventory: Array.isArray(data.equipment) ? data.equipment : [],
            };

            const newCharacter = new Character(characterData);
            const result = await newCharacter.save();
            socket.emit("characterSaved", {
                success: true,
                characterId: result._id,
                username: result.username,
            });
        } catch (e) {
            console.error("Error saving character:", e);
            socket.emit("characterSaved", {
                success: false,
                error:
                    e.code === 11000
                        ? "Username already exists"
                        : "Failed to save character",
            });
        }
    });

    // Real-time event: character sheet updated
    socket.on("updateCharacter", async (updatedCharacter) => {
        try {
            const character = await Character.findByIdAndUpdate(
                // Find character by ID
                updatedCharacter._id,
                // Update with new data
                updatedCharacter,
                // Return the updated document
                { new: true }
            );

            // Emit updated character to all clients
            io.emit("characterUpdated", character);
        } catch (e) {
            console.error("Error updating character:", e);
            socket.emit("error", "Failed to update character");
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        // Log when a user disconnects
        console.log("User  disconnected:", socket.id);
    });
});

// Start listening on the defined port
server.listen(port, () => {
    // Log server start message
    console.log("DnD app listening on port " + port);
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
    // Log shutdown message
    console.log("\nGracefully shutting down...");
    // Close MongoDB connection
    await mongoose.connection.close();
    server.close(() => {
        // Log server closure
        console.log("Server closed");
        process.exit(0);
    });
});
