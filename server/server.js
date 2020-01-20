require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { rpc, allowedRpcMethods } = require("./rpc");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../dist")));

app.use(
  cors({
    origin: true
  })
);

app.use(bodyParser.json());

app.post("/api/rpc", async (req, res) => {
  const { action } = req.body || {};

  if (!action) {
    return res.status(422).send("Missing action");
  } else if (!allowedRpcMethods.includes(action)) {
    return res.status(422).send("RPC action not allowed");
  }

  const result = await rpc(action);

  return res.send(result);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(process.env.SERVER_PORT);

console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`);
