const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bistro Boss server is Running");
});

app.listen(port, () => {
  console.log(`Bistro Boss server listening on port ${port}`);
});
