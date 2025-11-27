import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('atlasAPI', {
  openFile: (filters?: any[]) => ipcRenderer.invoke('dialog:openFile', filters),
  saveBytes: (defaultName: string, bytes: Uint8Array) => ipcRenderer.invoke('file:saveBytes', defaultName, bytes),
  readFileText: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  readFileArrayBuffer: async (filePath: string) => {
    const arr = await ipcRenderer.invoke('file:readBinary', filePath);
    return new Uint8Array(arr);
  }
});
