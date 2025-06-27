const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    downloadImage: async (imageUrl) => {
        try {
            return await ipcRenderer.invoke('download-image', imageUrl);
        } catch (error) {
            console.error('IPC Error:', error);
            return { success: false, error: error.message };
        }
    }
});