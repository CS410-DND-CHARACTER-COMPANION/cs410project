/*
CS410
******* Everyone put your name please *******
Team 3: Nicole Strounine, Kam Lun Cheung

DND Character Sheet Webapp

This app will allow players and DMs to log in, create and store character
sheets, as well as update them in real time. The DM will also have the ability
to update any character sheet in real time. 

*/

// Required modules
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");//Fred testing
const dotenv = require("dotenv");//Fred testing
const userRoutes = require("./backend/routes/userRoutes");// Fred testing
const verifyToken = require('./backend/middleware/authMiddleware'); // Adjust path if needed


// Load environment variables/Fred testing
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server);          // Attach socket.io to the server

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Port setup
const port = 3000;


// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, // Use the new URL parser (recommended for compatibility)
  useUnifiedTopology: true, // Use the new unified topology layer for better server discovery and monitoring
})
.then(() => console.log("Connected to MongoDB")) // Log a success message if connected
.catch(err => console.error("MongoDB connection error:", err)); // Log an error if the connection fails

// Middleware to parse JSON requests
app.use(express.json()); // Allows Express to parse incoming JSON requests

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend'))); // Serve static files like HTML, CSS, JS from 'frontend'

// Route for user-related API endpoints
app.use("/api/users", userRoutes); // Directs all /api/users requests to the userRoutes module

// Protected route example (requires authentication)
app.get('/api/users/profile', verifyToken, (req, res) => { // Use verifyToken middleware to protect this route
  res.json({ message: 'This is a protected profile route!' }); // Send a response if the token is valid
});

/*Commented for testing 
// Database connection
const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
*/

// Connect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
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

      // emit "charactersList" event
      socket.emit('charactersList', characters);
    } catch (e) {
      console.error("Error getting characters:", e);
      socket.emit('error', 'Failed to retrieve characters');
    } finally {
      await client.close();
    }
  });

  // real-time event: new character created
  socket.on('newCharacter', async (character) => {
    console.log('New character received:', character);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      // Insert the new character into the database
      const result = await client.db("dnd_screen").collection("character_sheets").insertOne(character);
      console.log(`New character created with the following id: ${result.insertedId}`);
      character._id = result.insertedId;

      // Broadcast the 'characterAdded' event to all connected clients
      io.emit('characterAdded', character);
    } catch (e) {
        console.error("Error creating character:", e);
        socket.emit('error', 'Failed to create character');
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
        { _id: updatedCharacter._id }, 
        { $set: updatedCharacter }
      );

      console.log('Character updated: ${updatedCharacter.name}');
      
      // Broadcast the 'characterUpdated' event to all connected clients
      io.emit('characterUpdated', updatedCharacter);
    } catch (e) {
      console.error(e);
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
  console.log("DnD app listening on port " + port)
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  server.close(() => {
      console.log('Server closed');
      process.exit(0);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Terminate the process BEFORE closing the IDE (The server will stays on if not)
