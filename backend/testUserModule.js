const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// MongoDB URI and Database Setup
const uri = process.env.MONGO_URI;
const dbName = "dnd_project";
const collectionName = "users";

// Helper Functions
const connectToDatabase = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB for testing...");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

const clearDatabase = async (client) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  await collection.deleteMany({});
  console.log("Database cleared.");
};

// Test for registerUser
const testRegisterUser = async (client) => {
  console.log("Testing registerUser...");

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Simulate a registration request
  const username = "testUser";
  const email = "testuser@example.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    username,
    email,
    password: hashedPassword,
  };

  const result = await collection.insertOne(newUser);

  if (result.insertedId) {
    console.log("registerUser test passed.");
  } else {
    throw new Error("registerUser test failed.");
  }
};

// Test for loginUser
const testLoginUser = async (client) => {
  console.log("Testing loginUser...");

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Insert a user for testing login
  const email = "testuser@example.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    username: "testUser",
    email,
    password: hashedPassword,
  };

  await collection.insertOne(user);

  // Simulate a login request
  const foundUser = await collection.findOne({ email });

  if (!foundUser) {
    throw new Error("loginUser test failed: User not found.");
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    throw new Error("loginUser test failed: Password mismatch.");
  }

  const token = jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  if (token) {
    console.log("loginUser test passed.");
  } else {
    throw new Error("loginUser test failed: Token generation failed.");
  }
};

// Run Tests
const runTests = async () => {
  const client = await connectToDatabase();

  try {
    await clearDatabase(client); // Clear the database before testing
    await testRegisterUser(client);
    await testLoginUser(client);
    console.log("All tests passed!");
  } catch (error) {
    console.error("Error during testing:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB after testing.");
  }
};

runTests();
