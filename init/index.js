const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const dotenv = require("dotenv");

dotenv.config();

// Uncomment this to use local MongoDB
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// MongoDB Atlas connection URI
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_ATLAS_URI;

// Mongoose connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function main() {
  try {
    // Connect to MongoDB using Mongoose
    // await mongoose.connect(MONGO_URL, mongooseOptions);
    await mongoose.connect(uri, mongooseOptions);
    console.log("Connected to DB");

    // Initialize data
    await initDB();
    console.log("Data was initialized");

    // Close the Mongoose connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error connecting to the database or initializing data:", err);
    mongoose.connection.close();
  }
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
  } catch (err) {
    console.error("Error initializing data:", err);
  }
};

main();
