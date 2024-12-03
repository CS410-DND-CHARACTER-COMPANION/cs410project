// Import the mongoose library for MongoDB interactions
const mongoose = require("mongoose");

// Function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the connection URI from environment variables
        await mongoose.connect(process.env.MONGO_URI, {
            // Use the new URL parser
            useNewUrlParser: true,
            // Use the unified topology layer
            useUnifiedTopology: true,
        });

        // Log success message upon successful connection
        console.log("MongoDB connected");
    } catch (error) {
        // Log any connection errors
        console.error("MongoDB connection error:", error);
        // Exit the process with an error code
        process.exit(1);
    }
};

// Export the connectDB function for use in other parts of the application
module.exports = connectDB;
