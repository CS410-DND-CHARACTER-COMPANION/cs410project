/*
CS410
******* Everyone put your name please *******
Team 3: Nicole Strounine, 

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
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Express app and HTTP server setup
const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server);            // Attach socket.io to the server

// Port setup
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json()); 

// Port things
server.listen(port, () => {
  console.log("DnD app listening on port " + port)
});

// The "main" function when User gets in the address
app.get('/', (req, res) => {
  // Connect to frontend file
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
});

io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // Handle real-time events like character updates here

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Route to create a new character
app.post('/api/characters', async (req, res) => {
  const newCharacter = req.body;  // Expect new character data in request body

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const result = await client.db("dnd_screen").collection("character_sheets").insertOne(newCharacter);
    res.status(201).json({ message: "Character created", characterId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create character" });
  } finally {
    await client.close();
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Terminate the process BEFORE closing the IDE (The server will stays on if not)
