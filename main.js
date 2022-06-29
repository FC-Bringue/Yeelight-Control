const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const server = require("./server/index");

let mainWindow;

app.commandLine.appendSwitch("ignore-certificate-errors");
if (require("electron-squirrel-startup")) return app.quit();

function createWindow() {
  var tray = null;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "/logo.png"),
  });

  mainWindow.loadURL("http://localhost:3001/");

  // Active le panneau DevTool.
  //mainWindow.webContents.openDevTools();

  // Fermeture fenetre
  mainWindow.on("closed", function () {
    // Elimine la valeur
    mainWindow = null;
  });

  mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
    tray = createTray();
  });

  mainWindow.on("restore", function (event) {
    mainWindow.show();
    tray.destroy();
  });
}

// Crée l'app une fois l'application chargée.
app.on("ready", createWindow);

function createTray() {
  let appIcon = new electron.Tray(path.join(__dirname, "/logo.png"));
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: "Show",
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: "Exit",
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  appIcon.on("double-click", function (event) {
    mainWindow.show();
  });
  appIcon.setToolTip("Moze Yeelight Control");
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}
