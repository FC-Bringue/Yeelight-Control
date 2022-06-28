const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const helmet = require("helmet");

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(express.json());
app.use(helmet());

var apiToken;

app.get("/api", async (req, res) => {
  return res.status(200).json({ message: "eeee" });
});

app.post("/api/setToken", async (req, res) => {
  const { token } = req.body;

  console.log(token);

  apiToken = token;

  return res.status(200).json({ message: "Token Reçu" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
