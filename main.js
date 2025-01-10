const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const Steamworks = require('steamworks.js')
const steamAppId = 480 // 480 is the test app id for valve's "spacewar"
const steam = Steamworks.init(steamAppId)

let mainWindow

console.log('hi from main.js')

app.on('ready', () => {
  // steam.on('ready', () => {
  //   console.log(`Logged in as ${steam.localplayer.name}`)
  // })

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    // mainWindow.loadURL('https://auto-cards.com')
    mainWindow.loadURL('http://localhost:3000/steam')

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('main-to-renderer', {
        username: 'SteamUser123',
        id: '123456',
        steam: steam.localplayer.getName(),
      })
    })
  }

  function handleSetTitle(event, title) {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win?.setTitle(title)
  }

  app.whenReady().then(() => {
    ipcMain.on('set-title', handleSetTitle)
    createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

Steamworks.electronEnableSteamOverlay()
