// Required Modules
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

// Database connection
let db;
MongoClient.connect(uri)
  .then((client) => {
    console.log("Connected to MongoDB from userModule");
    db = client.db("dnd_screen");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Controllers

// Register User
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with success and the token
    res.status(201).json({
      message: "User registered successfully!",
      token, // Return the token
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Email provided:", email); // Debug log
  console.log("Password provided:", password); // Debug log

  try {
      const user = await db.collection("users").findOne({ email });
      if (!user) {
          console.log("User not found");
          return res.status(400).json({ message: "User not found" });
      }

      console.log("Stored hashed password:", user.password); // Debug log

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch); // Debug log

      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
      });

      res.json({ token });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Server error" });
  }
};


// Export functions
module.exports = {
  registerUser,
  loginUser,
};
