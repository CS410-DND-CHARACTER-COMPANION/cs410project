const mongoose = require('mongoose'); // Import the mongoose library for MongoDB interactions

// Function to connect to the MongoDB database
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the connection URI from environment variables
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Use the new URL parser
            useUnifiedTopology: true, // Use the unified topology layer
        });
        console.log('MongoDB connected'); // Log success message upon successful connection
    } catch (error) {
        console.error('MongoDB connection error:', error); // Log any connection errors
        process.exit(1); // Exit the process with an error code
    }
};

module.exports = connectDB; // Export the connectDB function for use in other parts of the application
