import path from "path";
import { exec, execSync } from "child_process";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain } from "electron";
import { format } from "date-fns";
import { getHtml ,getAuthCmd, getExecuteFile, getExecutePath } from "./utils";
import { connectDataBase, findRecord, insertRecord } from "./sqlHelper";
import sharp from 'sharp'
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let templateFilePath = path.join(process.cwd(), "resources", "command");


if (import.meta.env.DEV) {
  templateFilePath = path.join(process.cwd(), "command");
}
console.log(templateFilePath, "templateFilePath");

const ytDlp = path.join(
  process.cwd(),
  "command",
  getExecutePath(),
  getExecuteFile("yt-dlp")
);

const ytDlpPath = `${getAuthCmd()} ${ytDlp}`;

const ffmpeg = path.join(
  process.cwd(),
  "command",
  getExecutePath(),
  getExecuteFile("ffmpeg")
);

const ffmpegPath = `${getAuthCmd()} ${ffmpeg}`;

const removeDuplicateImages = path.join(
  process.cwd(),
  "command",
  getExecutePath(),
  getExecuteFile("RemoveDuplicateImages")
);

const removeDuplicateImagesPath = `${getAuthCmd()} ${removeDuplicateImages}`;

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

// /../command
let dbPath = path.join(__dirname, "..", "..", "command");
if (import.meta.env.DEV) {
  dbPath = path.join(__dirname, "..", "command");
}

process.env.DIST = path.join(__dirname, "..", "dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "..", "public");

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
// 主进程初始化sqlite3数据库存放路径
ipcMain.handle("local-sqlite3-db", async () => {
  let sqlite3Path = path.join(dbPath, "database.sqlite3");
  console.log(sqlite3Path, "主进程获取到数据库路径");
  await connectDataBase(sqlite3Path);
  return sqlite3Path;
});

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    icon: path.join(process.env.VITE_PUBLIC, "logo.svg"),
    webPreferences: {
      preload: path.join(__dirname, ".", "preload.js"),
      nodeIntegrationInWorker: true, // 则在Web Worker中允许使用Node.js
      contextIsolation: false,
      nodeIntegration: true, //渲染进程中允许使用Node.js
      webSecurity: false, // 禁用了一些安全策略，例如跨源资源共享（CORS）和同源策略（SOP），允许跨域请求。
      webviewTag: true,
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

ipcMain.on("call-yt-dlp-video", async(event,videoUrl: string) => {
  let record: any = await findRecord(videoUrl);
  console.log(record, "record-------------------")
  let locationPath = path.join(
    process.cwd(),
    "command",
    record.FolderDate
  );

  const cmd = `${ytDlpPath} -P ${locationPath} ${videoUrl} -o "%(id)s.%(ext)s" `
  execSync(cmd);

  event.reply("reply-download-video");
});

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
    event.reply("call-render-output", true, packageString);
  } else {
    const matchStrings = ["youtu.be", "twitter.com", "youtube.com", "bilibili.com", "toutiao.com"]; // 添加你需要匹配的字符串到这个数组中

    let isMatched = matchStrings.some(function (matchString) {
      return videoUrl.includes(matchString);
    });

    // 头条专属
    if(videoUrl.indexOf("toutiao.com") > 0) {
      let jsonString = await getHtml(videoUrl);
      let json = JSON.parse(jsonString);
      console.log(json.data.initialVideo.videoPlayInfo.video_list, "----------------json")
      let listLength = json.data.initialVideo.videoPlayInfo.video_list.length;
      console.log(listLength, "list-Length-------------")
      if(listLength > 0) {
        let backupUrl = json.data.initialVideo.videoPlayInfo.video_list[listLength-1].backup_url;
        console.log(backupUrl.split("?a=24"), "backup_url");
        videoUrl = backupUrl.split("?a=24")[0]
        console.log(videoUrl, "====videoUrl====")
        isMatched = true
      }
    }

    if (!isMatched) {
      // false则不支持该视频链接的转换
      event.reply("reply-render-output", false, "");
      return;
    }

    const createInfo = createMetadata(videoUrl);

    let locationPath = path.join(
      process.cwd(),
      "command",
      createInfo.folderDate
    );

    // 一个字幕一个字幕的进行判断下载
    let cmd = "";
    cmd = isDownloadVideo
      ? `${ytDlpPath} -P ${locationPath} ${videoUrl} -o "%(id)s.%(ext)s" --write-subs --sub-lang "zh.*,en.*,danmaku.xml"`
      : `${ytDlpPath} --dump-json -P ${locationPath} ${videoUrl} -o "%(id)s.%(ext)s" --skip-download --write-subs --sub-lang "zh.*,en.*,danmaku.xml"`;

    process.env.NODE_STDOUT_ENCODING = "utf-8";
    console.log(cmd, "download");
    exec(cmd, { encoding: "utf8" }, async (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error}`);
        return;
      }
      info = stdout;
      console.log(`输出: ${info}`);

      let sourceSubtitles = "";
      let hasVtt = false;
      let vttFileName: string | undefined = "";
      try {
        vttFileName = findJsonFilesInDirectorySync(locationPath, "zh");
        if(!vttFileName) {
          vttFileName = findJsonFilesInDirectorySync(locationPath, "en");
        }

        console.log(vttFileName, "vttFileName");
        const vttPath = path.join(locationPath, vttFileName);
        hasVtt = true;
        sourceSubtitles = fs.readFileSync(vttPath).toString();
      }
      catch (e) {
        hasVtt = false
        sourceSubtitles= "此视频无字幕文件"
      }
      const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      record = {
        $Id: createInfo.id,
        $Title: createInfo.title,
        $Path: videoUrl,
        $SourceSubtitles: sourceSubtitles,
        $TargetSubtitles: "",
        $CreateTime: dateTime,
        $LocationVideoPath: "",
        $FolderDate: createInfo.folderDate,
        $Env: import.meta.env.MODE,
        $HasVtt: hasVtt,
        $HasVideo: isDownloadVideo,
      };
      await insertRecord(record);

      event.reply("reply-output", true, sourceSubtitles);
    });
  }
});

// 获取时间区间的视频帧图片列表（先生成再说）
ipcMain.on(
  "call-image-ffmpeg",
  async (event, folderDate, everyStartTime, everyEndTime, multiple) => {
    let videoPath = getFolderDatePath(folderDate, ".webm");
    console.log(videoPath, "videoPath-webm");
    videoPath =
      videoPath === "" ? getFolderDatePath(folderDate, ".mp4") : videoPath;
    console.log(videoPath, "videoPath-mp4");

    const startTimeName = everyStartTime.replace(/[.:,-]/g, "");
    console.log(startTimeName, "startTimeName")
    const imagePath = path.join(
      process.cwd(),
      "command",
      folderDate,
      startTimeName
    );

    console.log("imagePath", imagePath);

    if (!fs.existsSync(imagePath)) {
      fs.mkdirSync(imagePath);

      const imageUrl = path.join(imagePath, "%03d.png");
      everyStartTime = everyStartTime.replace(/[,-]/g, ".");
      everyEndTime = everyEndTime.replace(/[,-]/g, ".");
      const cmd = `${ffmpegPath} -i ${videoPath} -ss ${everyStartTime} -to ${everyEndTime} -vf "fps=3/1" ${imageUrl}`;
      console.log(cmd, "cmd");
      execSync(cmd);

      // 首次默认去重复
      removeSimilarImages(imagePath, 10);
    }

    // 生成完图片再对图片进行去重复

    if(multiple > 0)
    {
      removeSimilarImages(imagePath, multiple);
    } 
    reloadImages(event, imagePath);
  }
);


ipcMain.on("call-get-duration", (event, folderDate) => {
  const jsonPath: any = getFolderDatePath(folderDate, ".json");
  console.log(jsonPath, "----jsonPath----")
  const packageJson = fs.readJsonSync(jsonPath);
  console.log(packageJson.duration, "----packageJson----")
  event.reply("reply-duration", packageJson.duration);
}) 

ipcMain.on("call-image-compress", (event, folderDate, everyStartTime, list) => {
  console.log("call-image-compress", list)
  const startTimeName = everyStartTime.replace(/[.:,-]/g, "");
  const locationPath = path.join(process.cwd(),"command", folderDate, startTimeName);
  list.forEach(async(item: any, index: number) => {
    console.log(item, "fileName")
    let fileName = item.split('.')[0];
    let fileType = item.split('.')[1];
    let fullFileName = `${fileName}-bak.${fileType}`;

    let sourceImagePath = path.join(locationPath, item);
    let targetImagePath = path.join(locationPath, fullFileName);
    await sharp(sourceImagePath).png({ quality: 75 }).toFile(targetImagePath)
    await fs.remove(sourceImagePath);
    if(list.length == index +1) {
      console.log("list-end")
      event.reply("reply-image-compress");
    }
    console.log('list-index')
  })

})
/**
 * 重新读取图片
 * @param event 
 * @param imagePath 
 */
const reloadImages = (event: any,imagePath: string) => {
  fs.readdir(imagePath, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      fs.stat(path.join(imagePath, file), (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`File size: ${stats.size} bytes`);
        console.log(`Created at: ${stats.birthtime}`);
        console.log(`Last modified at: ${stats.mtime}`);

        fs.readFile(path.join(imagePath, file), (err, data) => {
          if (err) throw err;
          const base64Image = Buffer.from(data).toString("base64");
          console.log(file, "read-file");
          event.sender.send("call-image-ffmpeg-render", {
            size: stats.size,
            file,
            data: base64Image,
          });
        });
      });

      
    });
  });
}

/**
 * 移除相似图片
 * @param imagePath 
 * @param multiple 
 */
const removeSimilarImages = (imagePath: string, multiple: number) => {
  const cvString = `${removeDuplicateImagesPath} ${imagePath}  ${multiple}`; 
  execSync(cvString);
}


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
    console.log(files, "files", "type", type);

    let jsonFile: string | undefined  =""
    if([".webm", ".mp4", ".json"].includes(type)) {
      jsonFile = files.find((file) => path.extname(file) === type);
    }
    else {
      // 匹配符合模式的字符串
      let pattern = new RegExp(type + '.*\\.vtt');
      // 循环检查每个字符串是否匹配模式
      for (var i = 0; i < files.length; i++) {
        if (pattern.test(files[i])) {
          jsonFile = files[i];
          break; // 找到第一个匹配后退出循环
        }
      }
    }

    console.log(jsonFile, "jsonFile--------");
    return jsonFile ?? "";
  } catch (err) {
    console.error("Error:", err);
    return "";
  }
};

/**
 * 根据视频url创建本地文件夹和生成元数据json文件
 * @param url
 * @returns
 */
const createMetadata = (url: string) => {
  const folderDate = format(new Date(), "yyyy-MM-dd-HH-mm-ss");
  console.log(folderDate, "date-folderDate");

  const locationPath = path.join(process.cwd(),"command", folderDate);
  let cmd = "";
  cmd = ` ${ytDlpPath} ${url}  -P ${locationPath} --write-info-json --skip-download  -o "%(id)s.%(ext)s"`;

  console.log(cmd, "cmd-123");
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
 * 根据folderDate来获取文件夹中的字幕
 */
const getFolderDateJson = (folderDate: string, prefix: string = ".vtt") => {
  const locationPath = path.join(templateFilePath, folderDate);

  var vttFileName = findJsonFilesInDirectorySync(locationPath, "zh");
  if(!vttFileName) {
    vttFileName = findJsonFilesInDirectorySync(locationPath, "en");
  }
  const vttPath = path.join(locationPath, vttFileName);
  if(vttPath) {
    console.log(vttPath, "vttPath=========");
    const str = fs.readFileSync(vttPath).toString();
    return str;
  } 
  return ""
};

/**
 * 根据folderDate来获取文件夹中的json字幕
 */
const getFolderDatePath = (folderDate: string, prefix: string = ".vtt") => {
  const locationPath = path.join(templateFilePath, folderDate);

  var fileName = findJsonFilesInDirectorySync(locationPath, prefix);
  console.log(fileName, "fileName=========");
  if (fileName) {
    const url = path.join(locationPath, fileName);
    console.log(url, "url=========");
    return url;
  }
  return "";
};
