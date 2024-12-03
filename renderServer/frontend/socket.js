// Import required modules
const Character = require("./models/characterModel");
const mongoose = require("mongoose");

// Socket.IO connection and event handling
module.exports = (io) => {
    // Connection event handler
    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Utility function for error handling
        const handleSocketError = (eventName, error) => {
            console.error(`Error in ${eventName}:`, error);
            socket.emit("error", {
                event: eventName,
                message: error.message || "An unexpected error occurred",
            });
        };

        // Get all characters list
        socket.on("getAllCharacters", async () => {
            try {
                const characters = await Character.find(
                    {},
                    "username name species class level currentHp maxHp ac"
                );
                socket.emit("charactersList", characters);
            } catch (error) {
                handleSocketError("getAllCharacters", error);
            }
        });

        // Get a single character by username
        socket.on("getCharacter", async (username) => {
            try {
                if (!username) {
                    throw new Error("Username is required");
                }

                const character = await Character.findOne({ username: username });

                if (!character) {
                    socket.emit("error", {
                        event: "getCharacter",
                        message: "Character not found",
                    });
                    return;
                }

                socket.emit("characterData", character);
            } catch (error) {
                handleSocketError("getCharacter", error);
            }
        });

        // Create a new character
        socket.on("saveCharacter", async (data) => {
            try {
                const { userId, characterId, data: characterData } = data;

                // Validate required fields
                const requiredFields = [
                    "username",
                    "name",
                    "species",
                    "class",
                    "level",
                    "strength",
                    "dexterity",
                    "constitution",
                    "intelligence",
                    "wisdom",
                    "charisma",
                    "currentHp",
                    "maxHp",
                    "ac",
                ];

                const missingFields = requiredFields.filter(
                    (field) => !characterData[field]
                );
                if (missingFields.length > 0) {
                    throw new Error(
                        `Missing required fields: ${missingFields.join(", ")}`
                    );
                }

                // Check for existing username
                const existingCharacter = await Character.findOne({
                    username: characterData.username,
                });

                if (existingCharacter) {
                    socket.emit("characterSaved", {
                        success: false,
                        error:
                            "Username already exists. Please choose a different username.",
                    });
                    return;
                }

                // Create new character
                const newCharacter = new Character(characterData);
                const savedCharacter = await newCharacter.save();

                // Emit success and broadcast
                socket.emit("characterSaved", {
                    success: true,
                    characterId: savedCharacter._id,
                    username: savedCharacter.username,
                });

                // Broadcast to all clients
                io.emit("characterAdded", savedCharacter);
            } catch (error) {
                handleSocketError("saveCharacter", error);
                socket.emit("characterSaved", {
                    success: false,
                    error: error.message || "Failed to save character",
                });
            }
        });

        // Update existing character
        socket.on("updateCharacter", async (data) => {
            try {
                const { userId, characterId, updates } = data;

                // Validate updates
                if (!updates.username) {
                    throw new Error("Username is required for character update");
                }

                const updatedCharacter = await Character.findOneAndUpdate(
                    { username: updates.username },
                    { $set: updates },
                    {
                        new: true, // Return the modified document
                        runValidators: true, // Run model validation
                    }
                );

                if (!updatedCharacter) {
                    socket.emit("error", {
                        event: "updateCharacter",
                        message: "Character not found",
                    });
                    return;
                }

                // Broadcast updated character to all clients
                io.emit("characterUpdated", updatedCharacter);

                // Confirm update to the requesting client
                socket.emit("characterUpdateConfirmed", updatedCharacter);
            } catch (error) {
                handleSocketError("updateCharacter", error);
            }
        });

        // Delete a character
        socket.on("deleteCharacter", async (username) => {
            try {
                if (!username) {
                    throw new Error("Username is required");
                }

                const deletedCharacter = await Character.findOneAndDelete({ username });

                if (!deletedCharacter) {
                    socket.emit("error", {
                        event: "deleteCharacter",
                        message: "Character not found",
                    });
                    return;
                }

                // Broadcast deletion to all clients
                io.emit("characterDeleted", username);

                socket.emit("characterDeleteConfirmed", {
                    username: username,
                    message: "Character successfully deleted",
                });
            } catch (error) {
                handleSocketError("deleteCharacter", error);
            }
        });

        // Periodic health check
        socket.on("ping", (timestamp) => {
            socket.emit("pong", {
                originalTimestamp: timestamp,
                serverTimestamp: Date.now(),
            });
        });

        // Disconnection event
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    // Server-wide error handler
    io.on("error", (error) => {
        console.error("Socket.IO server error:", error);
    });
};
