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
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);  // Create HTTP server
const io = new Server(server);          // Attach socket.io to the server

// Set up express server to erve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

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

// Connect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
});

// socket.io connection
io.on('connection', async (socket) => {
  // Log when a user connects
  console.log("A user connected:", socket.id);
  // get a list of all characters
  socket.on('getAllCharacters', async () => {
    // Connect to MongoDB
    const client = new MongoClient(uri);
    try {
      // Connect to MongoDB
      await client.connect();
      // Get all characters from the database
      const characters = await client.db("dnd_screen")
        .collection("character_sheets")
        .find()
        .toArray();
      // emit "charactersList" event
      socket.emit('charactersList', characters);
      // emit "DMOverviewcharactersList" event
      socket.emit('DMOverviewcharactersList', characters);
    } catch (e) {
      // Log error
      console.error("Error getting characters:", e);
      // emit "error" event
      socket.emit('error', 'Failed to retrieve characters');
    } finally {
      // Close the MongoDB client
      await client.close();
    }
  });
  
  // get a character by ID
  socket.on('getCharacterByID', async (CharID, callback) => {
    const client = new MongoClient(uri);
    callback = typeof callback == "function" ? callback : () => {};
    try {
      // Connect to MongoDB
      await client.connect();
      // Attempts to find the one edited character with IDs
      const FoundCharacter = await client.db("dnd_screen").collection("character_sheets").findOne({"_id": new ObjectId(CharID)});
      // Return back the character
      callback(FoundCharacter)
    }
    catch (e)
    {
      // Log error
      console.error("Error updating characters:", e);
      // emit "error" event
      socket.emit('error', 'Failed to update characters');
      // Return back the error
      callback({error:e.message});
    } finally
    {
      // Close the MongoDB client
      await client.close();
    }
    //socket.emit('ReturnCharByID') // Log when a user disconnects
  });

  // real-time event: new character created
  socket.on('newCharacter', async (character) => {
    // Log the new character
    console.log('New character received:', character);
    const client = new MongoClient(uri);
    try {
      // Connect to MongoDB
      await client.connect();
      // Insert the new character into the database
      const result = await client.db("dnd_screen").collection("character_sheets").insertOne(character);
      // Log the new character's ID
      console.log(`New character created with the following id: ${result.insertedId}`);
      // Set the character's ID to the new ID
      character._id = result.insertedId;
      // Broadcast the 'characterAdded' event to all connected clients
      io.emit('characterAdded', character);
    } catch (e) {
      // Log error
      console.error("Error creating character:", e);
      // emit "error" event
      socket.emit('error', 'Failed to create character');
    } finally {
      // Close the MongoDB client
      await client.close();
    }
  });

  // Test -j
  socket.on('updateCharacter', async (updatedCharacterData) => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      CharID = updatedCharacterData._id
      delete updatedCharacterData._id
      const result = await client.db("dnd_screen").collection("character_sheets").updateOne(
        { _id: new ObjectId(CharID) }, 
        { $set: updatedCharacterData}
      );
      if (result) 
      {
        //console.log("updated");
      }
      else { console.log(result); }
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }

    // for (UpdAttribute in updatedCharacterData)
    // {
    //   try {
    //     await client.connect();
    //     const result = await client.db("dnd_screen").collection("character_sheets").updateOne(
    //       { _id: updatedCharacterData._id }, 
    //       { $set: {UpdAttribute: updatedCharacterData[UpdAttribute]}}
    //     );
    //     if (result) 
    //     {
    //       console.log("updated");
    //     }
    //     else { console.log(result); }
    //   } catch (e) {
    //     console.error(e);
    //   } finally {
    //     await client.close();
    //   }
    // }
    //console.log("Hope")
  });

  // // real-time event: character sheet updated
  // socket.on('updateCharacter', async (updatedCharacter) => {
  //   const client = new MongoClient(uri);
  //   try {
  //     await client.connect();
  //     const result = await client.db("dnd_screen").collection("character_sheets").updateOne(
  //       { _id: updatedCharacter._id }, 
  //       { $set: updatedCharacter }
  //     );

  //     console.log('Character updated: ${updatedCharacter.name}');
      
  //     // Broadcast the 'characterUpdated' event to all connected clients
  //     io.emit('characterUpdated', updatedCharacter);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     await client.close();
  //   }
  // });

  // Log when a user disconnects
  socket.on("disconnect", () => {
    // Log when a user disconnects
    console.log("User disconnected:", socket.id);
  });
});

// Start listening on port
server.listen(port, () => {
  // Log when the server starts listening
  console.log("DnD app listening on port " + port)
});

// Handle shutdown
process.on('SIGINT', async () => {
  // Log when the server is shutting down
  console.log('\nShutting down...');
  // Close the server, will wait for all connections to close
  server.close(() => {
    // Log when the server is closed
    console.log('Server closed');
    // Exit the process
    process.exit(0);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Terminate the process BEFORE closing the IDE (The server will stays on if not)
