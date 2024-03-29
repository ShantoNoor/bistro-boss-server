const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
const userCollection = database.collection("users");
const menuCollection = database.collection("Menu");
const reviewCollection = database.collection("reviews");
const cartCollection = database.collection("carts");

app.get("/", async (req, res) => {
  res.send("Bistro Boss server is Running");
});

//user related
app.get("/users", async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "User already exists", insertedId: null });
  }

  res.send(await userCollection.insertOne(user));
});

app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await userCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await userCollection.deleteOne(query);
  res.send(result);
})

//menu related
app.get("/menu", async (req, res) => {
  res.send(await menuCollection.find().toArray());
});

//reviews related
app.get("/reviews", async (req, res) => {
  res.send(await reviewCollection.find().toArray());
});

//carts related
app.get("/carts", async (req, res) => {
  res.send(await cartCollection.find(req.query).toArray());
});

app.post("/carts", async (req, res) => {
  res.send(await cartCollection.insertOne(req.body));
});

app.listen(port, () => {
  console.log(`Bistro Boss server listening on port ${port}`);
});
