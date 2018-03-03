const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const jsonfile = require('jsonfile')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 600
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') {
    setTimeout(() => {
      app.quit()

    }, 1000);
  // }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})


electron.ipcMain.on('log', function (e, data) {
  console.log('LOG', data)
})

electron.ipcMain.on('save', function (e, data) {
  console.log('save')
  jsonfile.writeFile(data.path, data.data, { flag: 'w' }, function (err) {
    if (err) {
      console.error(err)
    }
  })
})