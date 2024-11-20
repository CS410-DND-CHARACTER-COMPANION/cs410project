const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");
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

// Database connection
const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB using Mongoose
mongoose.connect(uri)
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
io.on('connection', async (socket) => {
  console.log("A user connected:", socket.id);

  // get a list of all characters
  socket.on('getAllCharacters', async () => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const characters = await client.db("dnd_screen").collection("character_sheets").find().toArray();
      socket.emit('charactersList', characters);
    } catch (e) {
      console.error("Error getting characters:", e);
      socket.emit('error', 'Failed to retrieve characters');
    } finally {
      await client.close();
    }
  });

  // New handler for getting a single character
  socket.on('getCharacter', async (characterId) => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const character = await client.db("dnd_screen")
        .collection("character_sheets")
        .findOne({ _id: new ObjectId(characterId) });
      
      if (character) {
        socket.emit('characterData', character);
      } else {
        socket.emit('error', 'Character not found');
      }
    } catch (e) {
      console.error("Error retrieving character:", e);
      socket.emit('error', 'Failed to retrieve character');
    } finally {
      await client.close();
    }
  });

  // real-time event: new character created
  socket.on('newCharacter', async (character) => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const result = await client.db("dnd_screen").collection("character_sheets").insertOne(character);
      console.log(`New character created with the following id: ${result.insertedId}`);
      character._id = result.insertedId;
      io.emit('characterAdded', character);
    } catch (e) {
      console.error("Error creating character:", e);
      socket.emit('error', 'Failed to create character');
    } finally {
      await client.close();
    }
  });

  // Save character
  socket.on('saveCharacter', async (characterData) => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const result = await client.db("dnd_screen")
        .collection("character_sheets")
        .insertOne(characterData);
      
      console.log(`Character saved with ID: ${result.insertedId}`);
      socket.emit('characterSaved', { 
        success: true, 
        characterId: result.insertedId 
      });
    } catch (e) {
      console.error("Error saving character:", e);
      socket.emit('characterSaved', { 
        success: false, 
        error: 'Failed to save character' 
      });
    } finally {
      await client.close();
    }
  });

  // real-time event: character sheet updated
  socket.on('updateCharacter', async (updatedCharacter) => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const result = await client.db("dnd_screen").collection("character_sheets").updateOne(
        { _id: new ObjectId(updatedCharacter._id) }, 
        { $set: updatedCharacter }
      );
      console.log(`Character updated: ${updatedCharacter.name}`);
      io.emit('characterUpdated', updatedCharacter);
    } catch (e) {
      console.error("Error updating character:", e);
      socket.emit('error', 'Failed to update character');
    } finally {
      await client.close();
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
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
