const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.blxzqo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("BistroBossDB");
const menuCollection = database.collection("Menu");
const reviewCollection = database.collection("reviews");

app.get("/", async (req, res) => {
  res.send("Bistro Boss server is Running");
});

app.get("/menu", async (req, res) => {
  res.send(await menuCollection.find().toArray());
});

app.get("/reviews", async (req, res) => {
  res.send(await reviewCollection.find().toArray());
});

app.listen(port, () => {
  console.log(`Bistro Boss server listening on port ${port}`);
});
