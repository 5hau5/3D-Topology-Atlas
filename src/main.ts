import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

let win: BrowserWindow | null = null;

function createWindow() {
  console.log('Creating window...');
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false
    }
  });

  const devURL = 'http://localhost:5173'; // Vite dev server port
  if (process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === 'development') {
    const url = process.env.VITE_DEV_SERVER_URL || devURL;
    win.loadURL(url).catch(console.error);
  } else {
    const indexPath = join(__dirname, 'renderer/index.html');
    win.loadFile(indexPath).catch(console.error);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());

// IPC handlers
ipcMain.handle('dialog:openFile', async (_event, filters) => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: filters || [] });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('file:saveBytes', async (_event, defaultPath: string, bytes: Uint8Array) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath,
    filters: [{ name: 'Topology Lesson', extensions: ['topo', 'zip'] }]
  } as any);
  if (canceled || !filePath) return { ok: false };
  writeFileSync(filePath, Buffer.from(bytes));
  return { ok: true, path: filePath };
});

ipcMain.handle('file:read', async (_event, filePath: string) => {
  return readFileSync(filePath, 'utf-8');
});

// New: read binary for GLB files
ipcMain.handle('file:readBinary', async (_event, filePath: string) => {
  const buffer = readFileSync(filePath);
  return Array.from(buffer);
});
