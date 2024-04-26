import path from "path";
import { exec, execSync } from "child_process";
import { connect, get, run } from "./sqlite3";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain } from "electron";
import { format } from "date-fns";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let templateFilePath = path.join(process.cwd(), "/resources/command");

if (import.meta.env.DEV) {
  templateFilePath = path.join(process.cwd(), "/command");
}
console.log(templateFilePath, "templateFilePath");

// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
console.log(__dirname, "main.ts");
console.log(process.platform, "main.ts");
console.log(process.cwd(), import.meta.env.DEV, "cwd.ts");

let dbPath = path.join(__dirname, "../../command");
if (import.meta.env.DEV) {
  dbPath = path.join(__dirname, "../command");
}

process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
// 主进程初始化sqlite3数据库存放路径
// app.getPath('userData')
ipcMain.handle("local-sqlite3-db", async () => {
  let sqlite3Path = path.join(dbPath, "database.sqlite3");
  console.log(sqlite3Path, "主进程获取到数据库路径");
  await connect(sqlite3Path);
  return sqlite3Path;
});

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    icon: path.join(process.env.VITE_PUBLIC, "logo.svg"),
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegrationInWorker: true, // 则在Web Worker中允许使用Node.js
      contextIsolation: false,
      nodeIntegration: true, //渲染进程中允许使用Node.js
      webSecurity: false, // 禁用了一些安全策略，例如跨源资源共享（CORS）和同源策略（SOP），允许跨域请求。
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  app.quit();
  win = null;
});

app.whenReady().then(createWindow);

// 主进程定义方法
ipcMain.on("call-yt-dlp", async (event, videoUrl, isDownloadVideo) => {
  console.log("主进程接收到子进程的数据", videoUrl, isDownloadVideo);

  let info = "";
  // ffmpeg -version
  console.log(process.cwd(), "process.cwd");

  let record: any = await findRecord(videoUrl);

  // 通过url判断该记录是否存在
  if (record) {
    const packageString = getFolderDateJson(record.FolderDate);
    event.reply("call-output", true, packageString);
  } else {
    // 通过url判断视频类型
    const type = videoUrl.includes("youtu.be") ? "youtube" : "";
    console.log(type, "type", type == "", type == "");
    if (type == "") {
      // false则不支持该视频链接的转换
      event.reply("call-output", false, "");
      return;
    }

    const createInfo = createMetadata(videoUrl);

    const platform = process.platform;
    console.log(platform, "platform");
    let authCmd = `chcp 65001 &&`;
    let ytdlp = "yt-dlp.exe";
    let locationPath =  `${process.cwd()}\\command\\${createInfo.folderDate}`

    let cmd = "";
    cmd = isDownloadVideo ? 
    `chcp 65001 && ${process.cwd()}\\command\\yt-dlp -P ${ locationPath } ${ videoUrl } -o "%(id)s.%(ext)s" --write-subs`: 
    `chcp 65001 && ${process.cwd()}\\command\\yt-dlp --dump-json -P ${ locationPath } ${ videoUrl } -o "%(id)s.%(ext)s" --skip-download --write-subs`;
    if (platform !== "win32") {
      authCmd = "";
      ytdlp = "yt-dlp"
      locationPath = path.join(templateFilePath, createInfo.folderDate) ;

      cmd = isDownloadVideo
      ? `${authCmd} ${process.cwd()}/command/${ytdlp} -P ${locationPath} ${videoUrl} -o "%(id)s.%(ext)s" --write-subs`
      : `${authCmd} ${process.cwd()}/command/${ytdlp} --dump-json -P ${locationPath} ${videoUrl} -o "%(id)s.%(ext)s" --skip-download --write-subs`;
    }

    console.log(authCmd, "authCmd");
    process.env.NODE_STDOUT_ENCODING = "utf-8";

    exec(cmd, { encoding: "utf8" }, async (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error}`);
        return;
      }
      info = stdout;
      console.log(`输出: ${info}`);

      var vttFileName = findJsonFilesInDirectorySync(locationPath, ".vtt");
      console.log(vttFileName, "vttFileName")
      const vttPath = path.join(locationPath, vttFileName);

      const sourceSubtitles = fs.readFileSync(vttPath).toString();

      const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      record = {
        $Id: createInfo.id,
        $Title: createInfo.title,
        $Path: videoUrl,
        $Type: type,
        $SourceSubtitles: sourceSubtitles,
        $TargetSubtitles: "",
        $CreateTime: dateTime,
        $LocationVideoPath: "",
        $FolderDate: createInfo.folderDate,
      };
      await insertRecord(record);

      event.reply("call-output", true, sourceSubtitles);
    });
  }
});


// 获取时间区间的视频帧图片列表（先生成再说）
ipcMain.on("call-image-ffmpeg", async (event, folderDate, everyStartTime, everyEndTime)=> {
  const platform = process.platform;
  let authCmd = `chcp 65001 &&`;
  if (platform !== "win32") {
    authCmd = "";
  }

  const videoPath = getFolderDatePath(folderDate, ".webm");

  const startTimeName = everyStartTime.replace(/[:.]/g, "");
  const imagePath = `${process.cwd()}\\command\\${folderDate}\\${startTimeName}`;
  console.log('imagePath', imagePath)
  if(!fs.existsSync(imagePath)) {
    console.log('imagePath111111111', imagePath)
    fs.mkdirSync(imagePath); 
    const cmd = `${authCmd} ${process.cwd()}\\command\\ffmpeg.exe -i ${videoPath} -ss ${everyStartTime} -t ${everyEndTime} -vf "fps=1" ${imagePath}\\output_image%03d.png`;
    console.log(cmd, 'cmd')
    execSync(cmd);

    // 生成完图片再对图片进行去重复

    const cvString = `${authCmd} ${process.cwd()}\\command\\RemoveDuplicateImages.exe ${imagePath}`;
    execSync(cvString);
  }

  fs.readdir(imagePath, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      fs.readFile(path.join(imagePath, file), (err, data) => {
        if (err) throw err;
        const base64Image = Buffer.from(data).toString('base64');
        
        event.sender.send('call-image-ffmpeg-render', { file, data:base64Image });
      });
    });
  });
});

/**
 * 在指定目录下查找元数据json文件
 * @param directoryPath
 * @returns
 */
const findJsonFilesInDirectorySync = (
  directoryPath: string,
  type: string = ".json"
) => {
  try {
    const files = fs.readdirSync(directoryPath);
    const jsonFile = files.find((file) => path.extname(file) === type);
    return jsonFile ?? "";
  } catch (err) {
    console.error("Error:", err);
    return "";
  }
};

/**
 * 通过url查找数据库记录
 * @param url
 */
const findRecord = async (url: string) => {
  const record = await get(
    `select * from ParsingVideo s where s.Path = ?`,
    url
  );
  return record;
};

const insertRecord = async (data: any) => {
  const insertSql = `insert into ParsingVideo (Id, Title, Path, Type, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath, FolderDate) 
                     values ($Id, $Title, $Path, $Type, $SourceSubtitles, $TargetSubtitles, $CreateTime, $LocationVideoPath, $FolderDate)`;
  return await run(insertSql, data);
};

/**
 * 根据视频url创建本地文件夹和生成元数据json文件
 * @param url
 * @returns
 */
const createMetadata = (url: string) => {
  const folderDate = format(new Date(), "yyyy-MM-dd-HH-mm-ss");
  console.log(folderDate, "date-folderDate");

  const locationPath = `${process.cwd()}\\command\\${folderDate}`
  let cmd = "";
  // 只下载元数据信息

  const platform = process.platform;
  console.log(platform, "platform");
  let authCmd = `chcp 65001 &&`;
  if (platform !== "win32") {
    authCmd = "";
  }

  cmd = `${authCmd} ${process.cwd()}/command/yt-dlp ${url}  -P ${locationPath} --write-info-json --skip-download  -o "%(id)s.%(ext)s"`;

  execSync(cmd);
  const jsonFile: string | undefined =
    findJsonFilesInDirectorySync(locationPath);

  const jsonPath = path.join(locationPath, jsonFile);
  const packageJson = fs.readJsonSync(jsonPath);
  const title = packageJson.title;
  console.log(title, "title");
  console.log("JSON files found:", jsonFile);
  console.log(cmd, "cmd-metadata");

  return {
    folderDate,
    title: title,
    id: jsonFile.split(".")[0],
  };
};

/**
 * 根据folderDate来获取文件夹中的jsons字幕
 */
const getFolderDateJson = (folderDate: string, prefix: string = ".vtt") => {
  const locationPath = path.join(templateFilePath, folderDate);

  var vttFileName = findJsonFilesInDirectorySync(locationPath, prefix);
  const vttPath = path.join(locationPath, vttFileName);
  console.log(vttPath, "vttPath=========");
  const packageString = fs.readFileSync(vttPath).toString();
  return packageString;
};

/**
 * 根据folderDate来获取文件夹中的jsons字幕
 */
const getFolderDatePath = (folderDate: string, prefix: string = ".vtt") => {
  const locationPath = path.join(templateFilePath, folderDate);

  var fileName = findJsonFilesInDirectorySync(locationPath, prefix);
  const url = path.join(locationPath, fileName);
  console.log(url, "url=========");
  return url;
};


