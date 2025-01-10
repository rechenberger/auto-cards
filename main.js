const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
    },
  })

  // Lade deine Next.js-Seite
  mainWindow.loadURL('https://auto-cards.com') // Produktions-URL
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
