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
// const userRoutes = require('./backend/routes/userRoutes');// Fred testing
// const verifyToken = require('./backend/middleware/authMiddleware'); // Adjust path if needed


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

// Database connection
const uri = "mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB using Mongoose
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware to parse JSON requests
app.use(express.json()); // Allows Express to parse incoming JSON requests

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend'))); // Serve static files like HTML, CSS, JS from 'frontend'

// // Route for user-related API endpoints
// app.use('/api/users', userRoutes); // Directs all /api/users requests to the userRoutes module

// // Protected route example (requires authentication)
// app.get('/api/users/profile', verifyToken, (req, res) => { // Use verifyToken middleware to protect this route
//   res.json({ message: 'This is a protected profile route!' }); // Send a response if the token is valid
// });

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
      socket.emit('DMOverviewcharactersList', characters);
    } catch (e) {
      console.error("Error getting characters:", e);
      socket.emit('error', 'Failed to retrieve characters');
    } finally {
      await client.close();
    }
  });
  
  socket.on('getCharacterByID', async (CharID, callback) => {
    const client = new MongoClient(uri);
    callback = typeof callback == "function" ? callback : () => {};
    try {
      await client.connect();

      // Attempts to find the one edited character with IDs
      const FoundCharacter = await client.db("dnd_screen").collection("character_sheets").findOne({"_id": new ObjectId(CharID)});
      callback(FoundCharacter) // Return back
    }
    catch (e)
    {
        console.error("Error updating characters:", e);
        socket.emit('error', 'Failed to update characters');
        callback({error:e.message});
      } finally
      {
        await client.close();
      }
    //socket.emit('ReturnCharByID') // Log when a user disconnects
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