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

// Database connection
const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Express app and HTTP server setup
const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server);          // Attach socket.io to the server

// Port setup
const port = 3000;

// Connect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
});

// socket.io connection
io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // real-time event: new character created
  socket.on('newCharacter', async (character) => {
    console.log('New character received:', character);

    try {
      await client.connect();
      // Insert the new character into the database
      const result = await client.db("dnd_screen").collection("character_sheets").insertOne(character);
      console.log(`New character created with the following id: ${result.insertedId}`);

      // Broadcast the 'characterAdded' event to all connected clients
      io.emit('characterAdded', character);
    } catch (e) {
        console.error(e);
    } finally {
      await client.close();
    }
  });

  // real-time event: character sheet updated
  socket.on('updateCharacter', async (updatedCharacter) => {
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Terminate the process BEFORE closing the IDE (The server will stays on if not)