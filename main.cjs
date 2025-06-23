const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 608,
    resizable: false,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.platform === "darwin") {
    win.setWindowButtonVisibility(false);
  }

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);