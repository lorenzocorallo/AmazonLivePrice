const electron = require("electron");
const { app, BrowserWindow, globalShortcut } = require("electron");

function createWindow() {
  let win = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 700,
    frame: false,
    webPreferences: { nodeIntegration: true },
    resizable: true,
  });
  win.loadURL(`file://${__dirname}/index.html`);
  win.on("closed", () => {
    win = null;
  });
  // win.webContents.openDevTools();
  globalShortcut.register("f5", function () {
    // do nothing
  });
  globalShortcut.register("CommandOrControl+R", function () {
    //do nothing
  });
}

app.whenReady().then(createWindow);
