const { contextBridge, ipcRenderer } = require('electron/renderer')

console.log('hi from preload')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  onMainEvent: (channel, callback) => {
    const validChannels = ['main-to-renderer'] // Define valid channels
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },
})
