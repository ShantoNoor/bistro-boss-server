const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

// jwt related
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// middlewares
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

//user related
app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

app.get("/users/admin/:email", verifyToken, async (req, res) => {
  const email = req.params.email;

  if (email !== req.decoded.email) {
    return res.status(403).send({ message: "forbidden access" });
  }

  const query = { email: email };
  const user = await userCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === "admin";
  }
  res.send({ admin });
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

app.patch("/users/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
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

app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

//menu related
app.get("/menu", async (req, res) => {
  res.send(await menuCollection.find().toArray());
});

app.post('/menu', verifyToken, verifyAdmin, async (req, res) => {
  res.send(await menuCollection.insertOne(req.body));
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
