import path from 'path'
import { exec } from 'child_process'
import {PythonShell} from 'python-shell';
import fs from "fs-extra"
import { app, BrowserWindow, ipcMain } from 'electron'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// 主进程初始化sqlite3数据库存放路径
// app.getPath('userData') 
ipcMain.handle('local-sqlite3-db', () => {
  let sqlite3Path = path.join(app.getPath('userData'), 'database.sqlite3');
  console.log(sqlite3Path, "主进程获取到数据库路径")
  return sqlite3Path;
})

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.svg'),
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false, // Allow Ajax cross
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  app.quit()
  win = null
})

app.whenReady().then(createWindow)


// 主进程定义方法
ipcMain.on("call-yt-dlp", (event, args,isDownloadVideo) => {
  console.log("主进程接收到子进程的数据",args,isDownloadVideo);

  let info = "";
  // ffmpeg -version
  console.log(process.cwd(), "process.cwd")

  const locationPath = `${process.cwd()}\\command\\`

  let cmd = "";
  cmd = isDownloadVideo ? `chcp 65001 && ${process.cwd()}\\command\\yt-dlp -P ${locationPath} ${args} -o "%(id)s.%(ext)s" --write-subs`: `chcp 65001 && ${process.cwd()}\\command\\yt-dlp -P ${locationPath} ${args} -o "%(id)s.%(ext)s" --skip-download --write-subs`;
  process.env.NODE_STDOUT_ENCODING = 'utf-8';

  exec(cmd, {encoding: "utf8"}, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行出错: ${error}`);
      return;
    }
    info = stdout;
    console.log(`输出: ${info}`);

    const vttPath = `${locationPath}dIyQl99oxlg.zh-Hans.vtt`
    const packageString = fs.readFileSync(vttPath).toString();
    event.reply("call-output",packageString);
  });
});