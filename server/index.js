const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const helmet = require("helmet");

const { Yeelight } = require("yeelight-node");

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(express.json());
app.use(helmet());

var apiToken = null;

app.post("/api/changeLights", async (req, res) => {
  const { listOfLights } = req.body;

  if (apiToken === null) {
    return res.status(401).json({
      message: "Generez un token dans l'application",
    });
  }

  console.log(req.headers["authorization"]);

  //Get bearer token from header
  const bearerToken = req.headers["authorization"];
  if (bearerToken !== `Bearer ${apiToken}`) {
    return res.status(401).json({
      message: "Token invalide",
    });
  }

  //Compare bearer token with api token
  if ("Bearer " + apiToken !== bearerToken) {
    return res.status(401).json({
      message: "Token invalide",
    });
  }

  listOfLights.forEach(async (light) => {
    let yeelight = await new Yeelight({ ip: light.ip, port: 55443 });

    yeelight.set_power("on");

    yeelight.closeConnection();
  });

  return res.status(200).json({ message: "eeee" });
});

app.post("/api/setToken", async (req, res) => {
  const { token } = req.body;

  console.log(token);

  apiToken = String(token);

  return res.status(200).json({ message: "Token Reçu" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
