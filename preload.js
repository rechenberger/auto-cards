const { contextBridge, ipcRenderer } = require('electron/renderer')

console.log('hi from preload')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
})
