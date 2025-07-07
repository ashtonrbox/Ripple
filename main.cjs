
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');

async function downloadImage(imageUrl, filename) {
    try {
        console.log("(Fetch) Downloading image:", imageUrl);
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const saveDir = path.join(__dirname, 'ripple_bgs');
        await fs.mkdir(saveDir, { recursive: true });

        const fullPath = path.join(saveDir, filename);
        await fs.writeFile(fullPath, buffer);

        return fullPath;
    } catch (error) {
        throw error;
    }
}

ipcMain.handle('download-image', async (event, imageUrl) => {
    try {
        console.log("(Initial) Downloading image:", imageUrl);
        const filename = `bg-${Date.now()}.jpg`;
        const filePath = await downloadImage(imageUrl, filename);
        return { success: true, filePath };
    } catch (err) {
        console.error('Image download failed:', err);
        return { success: false, error: err.message };
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 608,
        resizable: false,
        titleBarStyle: 'hidden',
        frame: false,
        icon: path.join(__dirname, 'assets/icon.icns'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, 
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.platform === "darwin") {
        win.setWindowButtonVisibility(false);
    }

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});