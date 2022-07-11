const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const helmet = require("helmet");
const cors = require("cors");

const { Yeelight } = require("yeelight-node");

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(express.json());
app.use(helmet());
app.use(cors());

var apiToken = null;
/* var apiToken = "aa"; */

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const convertRgbToDecimal = (rgbList) => {
  return rgbList[0] * 65536 + rgbList[1] * 256 + rgbList[2];
};

app.post("/api/changeLights", async (req, res) => {
  const { listOfLights, typeOfAction } = req.body;

  console.log("listOfLights", listOfLights, "typeOfAction", typeOfAction);

  if (apiToken === null) {
    return res.status(401).json({
      message: "Generez un token dans l'application",
    });
  }

  if (!typeOfAction) {
    return res.status(400).json({
      message: "Veuillez choisir une action",
    });
  }

  if (!listOfLights) {
    return res.status(400).json({
      message: "Veuillez spécifiée une liste de lumières",
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
  try {
    listOfLights.forEach(async (light) => {
      console.log("connect to light");
      let yeelight = await new Yeelight({ ip: light.ip, port: 55443 });

      var status = await yeelight.get_prop("power");
      status = JSON.parse(status);
      console.log("get status", status);

      switch (typeOfAction) {
        case "power":
          console.log("Action is power");
          if (status.result[0] === "on") {
            let power = await yeelight.set_power("off");
            console.log("Light is on, turning it off", power);
          } else {
            let power = await yeelight.set_power("on");
            console.log("Light is off, turning it on", power);
          }
          break;
        case "color":
          console.log("Action is color");
          if (status.result[0] === "off") {
            let power = await yeelight.set_power("on");
            console.log("Light is off, turning it on", power);
          }
          let dodoColor = await new Promise((r) => setTimeout(r, 1500));
          let getRedColor = hexToRgb(light.color).r;
          let getGreenColor = hexToRgb(light.color).g;
          let getBlueColor = hexToRgb(light.color).b;
          let color = await yeelight.set_rgb(
            [getRedColor, getGreenColor, getBlueColor],
            "smooth",
            500
          );
          console.log("Light color change", color);
          break;
        case "flow":
          if (status.result[0] === "off") {
            let power = await yeelight.set_power("on");
            console.log("Light is off, turning it on", power);
          }
          let dodoFlow = await new Promise((r) => setTimeout(r, 1500));
          let dataFlow = [];
          light.flow.forEach((flow, index) => {
            console.log("flow", flow, index);
            let rgbFlow = [
              hexToRgb(flow).r,
              hexToRgb(flow).g,
              hexToRgb(flow).b,
            ];
            let infos = [3000, 1, convertRgbToDecimal(rgbFlow), 99];
            dataFlow.push(infos);
          });
          console.log("dataFlow", dataFlow);
          let flow = await yeelight.start_cf(0, 1, dataFlow);
          console.log("Light flow change", flow);
          break;
        default:
          break;
      }

      yeelight.closeConnection();
    });

    return res.status(200).json({ message: "eeee" });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la modification des lumières",
      error: error,
    });
  }
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
