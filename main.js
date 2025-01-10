const { app, BrowserWindow } = require('electron')
const path = require('path')

const Steamworks = require('steamworks.js')
const steamAppId = 480 // 480 is the test app id for valve's "spacewar"
const steam = Steamworks.init(steamAppId)

let mainWindow

app.on('ready', () => {
  // steam.on('ready', () => {
  //   console.log(`Logged in as ${steam.localplayer.name}`)
  // })

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: { contextIsolation: false, nodeIntegration: false },
  })

  // mainWindow.loadURL('https://auto-cards.com')
  mainWindow.loadURL('http://localhost:3000/steam')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

Steamworks.electronEnableSteamOverlay()
