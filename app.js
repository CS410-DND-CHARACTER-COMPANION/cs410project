// var msg = 'Hello World';
// console.log(msg);

// Server Set Up
const express = require("express")
const path = require("path")
const app = express()
// Port things
const port = 3000
app.listen(port, () => {
  console.log("DnD app listening on port " + port)
})
// Server Set Up (End)

// The "main" function when User gets in the address
app.get('/', (req, res) => {
  // Connect to frontend file
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

////////////////////////////////////////////////////////////////////////////////////////////////////
// Terminate the process BEFORE closing the IDE (The server will stays on if not)
