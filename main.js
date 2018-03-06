const autoUpdater = require("electron-updater").autoUpdater
const {app, BrowserWindow, dialog, shell} = require('electron');
// app.showExitPrompt = true;
const path = require('path');
const url = require('url');
autoUpdater.autoDownload = false;
const {systemPreferences} = require('electron')

systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Morpheus Update',
    message: 'Found updates, do you want to download?',
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      shell.openExternal('https://software.broadinstitute.org/morpheus/', {activate: true});
    }
  })
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({show: false, icon: __dirname + '/favicon.ico'});

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    autoUpdater.checkForUpdates();
  });
  // Hide the menu
  win.setMenu(null);
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  win.webContents.openDevTools();

  // win.on('close', (e) => {
  //   if (app.showExitPrompt) {
  //     e.preventDefault() // Prevents the window from closing
  //     dialog.showMessageBox({
  //       type: 'question',
  //       buttons: ['Yes', 'No'],
  //       title: 'Confirm',
  //       message: 'Are you sure you want to close Morpheus?'
  //     }, function (response) {
  //       if (response === 0) { // Runs the following if 'Yes' is clicked
  //         app.showExitPrompt = false
  //         win.close();
  //       }
  //     })
  //   }
  // })

  win.on('closed', () => {
    win = null;
    app.quit();
  });
}

app.on('ready', function () {
  createWindow();

});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});


