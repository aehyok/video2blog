import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'node:path'
import { exec } from 'child_process'
import {PythonShell} from 'python-shell';
import fs from "fs-extra"
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

  // win.setMenu(null);

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
    createWindow();
    createMenu();
  }
})

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

app.whenReady().then(() => {
  createWindow();
  createMenu();
})


// 创建 menu
function createMenu() {
  let menuStructure = [
      {
          label: '配置',
          submenu: [
              {
                  label: '配置',
                  click() {
                      // createConfigWindow()
                  }
              },
              {
                  label: '刷新', // 刷新页面
                  click() {
                      // refreshWindows()
                  }
              },
              {
                  label: '打开调试窗口',
                  click(menuItem:any, targetWindow: any) {
                       targetWindow.openDevTools()
                  }
              },
              {
                  label: '关闭调试窗口',
                  click(menuItem: any, targetWindow: any) {
                      targetWindow.closeDevTools()
                  }
              },
          ]
      },
      {
          label: '编辑',
          role: 'editMenu'
      },
      {
          label: '文件夹',
          submenu: [
              // {label: '打开 Rime 配置文件夹', click() {shell.openPath(getRimeConfigDir())}},
              // {label: '打开 Rime 程序文件夹', click() {shell.openPath(getRimeExecDir())}},
              // {
              //     label: '打开工具配置文件夹', click() {
              //         let configDir = path.join(os.homedir(), CONFIG_FILE_PATH)
              //         shell.openPath(configDir)
              //     }
              // },
          ]
      },
      {
          label: '码表处理工具',
          submenu: [
              {
                  label: '码表处理工具',
                  click() {
                      // showToolWindow()
                  }
              },
          ]
      },
      {
          label: '关于',
          submenu: [
              {label: '最小化', role: 'minimize'},
              {label: '关于', role: 'about'},
              {type: 'separator'},
              {label: '退出', role: 'quit'},
          ]
      },
  ]
  let menu = Menu.buildFromTemplate(menuStructure)
  Menu.setApplicationMenu(menu)
}
