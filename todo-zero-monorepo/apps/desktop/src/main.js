const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// In development, load the Vite dev server URL
// In production, load the built web app or a local HTML file
const DEV_URL = process.env.VITE_DEV_URL || "http://localhost:5173";
const IS_DEV = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 720,
    minWidth: 380,
    minHeight: 500,
    title: "Todo Zero",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (IS_DEV) {
    win.loadURL(DEV_URL);
    // Uncomment to open DevTools:
    // win.webContents.openDevTools();
  } else {
    // In production, serve the built web app
    win.loadFile(path.join(__dirname, "..", "web-dist", "index.html"));
  }

  return win;
}

// Simple menu
const menuTemplate = [
  {
    label: "Todo Zero",
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
    ],
  },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
