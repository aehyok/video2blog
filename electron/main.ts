import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { exec } from 'child_process'
import {PythonShell} from 'python-shell';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.setMenu(null); 

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 主进程定义方法
ipcMain.on("call-main-cmd", async(event, args) => {
  console.log("主进程接收到子进程的数据",args);

  let info = "";
  // ffmpeg -version
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) {
      console.error(`执行出错: ${error}`);
      return;
    }
    info = stdout;
    console.log(`输出: ${info}`);
    event.reply("exec-child-btn",info);
  });
});

ipcMain.on("exec-python", (event, args) => {
  PythonShell.runString('x=4+1;print(x)', undefined).then((messages)=>{
    console.log('finished',messages);
  });
});

ipcMain.on("./electron/exec-python-file", (event, args) => {
  PythonShell.run('main.py', undefined).then((messages)=>{
    console.log('finished',messages);
  });
});

app.whenReady().then(createWindow)
