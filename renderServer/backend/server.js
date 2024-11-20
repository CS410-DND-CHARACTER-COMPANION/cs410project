const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require('./routes/userRoutes');
const verifyToken = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Port setup
const port = 3000;

// Database connection with mongoose
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));
  
// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route for user-related API endpoints
app.use('/api/users', userRoutes);

// Protected route example
app.get('/api/users/profile', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected profile route!' });
});

// Connect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// New route for character sheet page
app.get('/character-sheet-v1.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'character-sheet-v1.html'));
});

// socket.io connection
io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // get a list of all characters
  socket.on('getAllCharacters', async () => {
    try {
      const characters = await mongoose.model("CharacterSheet").find();
      socket.emit('charactersList', characters);
    } catch (e) {
      console.error("Error getting characters:", e);
      socket.emit('error', 'Failed to retrieve characters');
    }
  });

  // New handler for getting a single character
  socket.on('getCharacter', async (characterId) => {
    try {
      const character = await mongoose.model("CharacterSheet").findById(characterId);
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

  // real-time event: new character created
  socket.on('newCharacter', async (character) => {
    try {
      const newCharacter = new (mongoose.model("CharacterSheet"))(character);
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
      const newCharacter = new (mongoose.model("CharacterSheet"))(characterData);
      const result = await newCharacter.save();
      socket.emit('characterSaved', { success: true, characterId: result._id });
    } catch (e) {
      console.error("Error saving character:", e);
      socket.emit('characterSaved', { success: false, error: 'Failed to save character' });
    }
  });

  // real-time event: character sheet updated
  socket.on('updateCharacter', async (updatedCharacter) => {
    try {
      const character = await mongoose.model("CharacterSheet").findByIdAndUpdate(
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
    console.log("User disconnected:", socket.id);
  });
});

// Start listening on port
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
