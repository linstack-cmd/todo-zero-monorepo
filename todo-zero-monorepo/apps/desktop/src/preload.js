const { contextBridge } = require("electron");

// Expose any APIs the renderer needs
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
});
