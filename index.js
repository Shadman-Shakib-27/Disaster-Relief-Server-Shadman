const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// wLdcQTZZZRNeZ9yV

// Middleware
app.use(
  cors({
    // origin: "https://food-distribution2.netlify.app",
    // credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Hello Folks!! Connected To MongoDB");

    const db = client.db("assignment6");
    const collection = db.collection("users");
    const postsCollection = db.collection("posts");
    const galleryCollection = db.collection("gallery");

    // Supply Post Related Api

    // For Get All Post
    app.get("/api/v1/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });
    //  For Get Single Post
    app.get("/api/v1/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.findOne(query);
      res.send(result);
    });
    //  For Post
    app.post("/api/v1/posts", async (req, res) => {
      const post = req.body;
      console.log(post);
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });
    // For Delete
    app.delete("/api/v1/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });

    // Gallery Relatd Api
    app.get("/api/v1/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if Email Already Exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash The Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert User into The Database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User Registered Successfully!!!",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find User By Email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid Email Or Password" });
      }

      // Compare Hashed Password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid Email Or Password" });
      }

      // Generate JWT Token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "User Login Successfully!!!!",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    // Start The Server
    app.listen(port, () => {
      console.log(
        `Shadman's Disaster Relief Server is Running On http://localhost:${port}`
      );
    });
  } finally {
  }
}

run().catch(console.dir);

// Test Route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Shadman's Disaster Relief Server is Running Smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
