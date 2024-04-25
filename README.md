## 两个目标
- 另外一个是将视频转换为中文文章
- 一个是对视频字幕进行翻译，并重新生成双语视频文件

## 流程

- 视频转文章的思路流程
```
1、输入视频url之后
2、先通过yt-dlp解析视频url获取视频信息
3、通过yt-dlp下载视频
4、如果存在字幕，则直接进行下载
5、可能是非中文字幕，则需要进行翻译字幕
6、如果不存在字幕，则通过whisper来生成字幕文件，并翻译为中文
7、然后通过gemini将字幕转换为文章。并将视频中的图片进行提取，手动插入到文章中
```

- 视频转字幕后重新生成双语视频
```
1、输入视频url之后
2、先通过yt-dlp解析视频url获取视频信息
3、通过yt-dlp下载视频
4、如果存在字幕，则直接进行下载,下载后进行翻译，并进行微调字幕
5、如果不存在字幕，则通过whisper来生成字幕文件，并进行翻译字幕
6、然后通过ffmpeg将字幕文件和视频文件进行合并
```

- python srt2ass https://github.com/ewwink/python-srt2ass
- nodejs srt2ass https://github.com/rakuzen25/subsrt-ts

## prompt
```
现在你作为一个科技博主，请先精读上面的字幕，然后根据字幕内容再进行分段，分的段落不要太多，尽量保持在4到8段左右，分段后要对分段内容进行整理,注意一定不需要总结也不要进行删减内容，只是进行整理和微调，并标记字幕时间的区间


现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，不能再多。并且再次提醒你，目录下的内容不能进行删减和总结哟

现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，一定一定不能再多了。并且再次提醒你，目录下的所有内容不能进行删减和总结哟，后半段的内容也不能进行偷工减料。
将上述输出的内容最终转换为Quill 富文本编辑器的Delta的JSON格式。

现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，一定一定不能再多了。并且再次提醒你，目录下的所有内容不能进行删减和总结哟，后半段的内容也不能进行偷工减料。将上述输出的内容最终转换为markdown格式，目录上添加##，目录下的内容不做任何处理就行了
```

## 项目使用重点说明
pnpm electron vite vue3使用pnpm暂时报错了
```
// 先直接使用npm 
node -v   20.11.0
npm -v 10.2.4

// 安装项目依赖
npm i 

// 本地运行项目
npm run start

// 本地编译打包（目前测试的是window的exe可以运行）
// 同时可嵌入静态资源 exe可执行文件供给外部主进程使用
npm run build
```


## 数据存储使用sqlite3
```
// 暂时将数据库存放在command目录下了database.sqlite3 相当于本地记录所有的数据
```

## 可参考项目
  - https://github.com/caoxiemeihao/electron-vite-samples
  - https://github.com/1111mp/electron_client
  - https://github.com/fanchenio/DawnLauncher
  - https://summarize.ing/
  - https://github.com/nashsu/FreeAskInternet

## 技术栈
- ffmpeg
  -  https://miaopei.github.io/2019/05/04/FFmpeg/FFmpeg%E5%91%BD%E4%BB%A4%E5%A4%A7%E5%85%A8/#2-FFMPEG-%E7%9B%AE%E5%BD%95%E5%8F%8A%E4%BD%9C%E7%94%A8
## 参考文档
- https://www.electronjs.org/zh/docs/latest/tutorial/quick-start

## 初始化项目
- https://electron-vite.github.io/guide/getting-started.html

  pnpm i 安装依赖
  pnpm start 本地运行项目
  pnpm build 编译打包项目

## 中文乱码问题
chcp 65001

## 主进程和渲染进程间的通信
- https://www.cnblogs.com/badaoliumangqizhi/p/13040619.html

## 先安装两个工具
```
// 先设置成全局环境变量，方便通过名字直接调用
https://github.com/TheAlgorithms/Python
https://github.com/yt-dlp/yt-dlp
https://www.ffmpeg.org/download.html

// yt-dlp运行环境是需要安装python
yt-dlp --version
ffmpeg -version
```

## Menu菜单的设置
```
https://www.electronjs.org/zh/docs/latest/api/menu
```

## 引入node原生模块
```
https://www.electronjs.org/zh/docs/latest/tutorial/using-native-node-modules
```

## Electron 获取当前用户data存放目录
- https://segmentfault.com/a/1190000044417762

## npm build 报错 node-gyp

- https://github.com/caoxiemeihao/electron-vite-samples/issues/9
- https://www.cnblogs.com/RaySirBlog/p/17337079.html


## sqlite3 操作数据库api
- https://github.com/TryGhost/node-sqlite3/wiki/API

## python 打包成exe
- https://github.com/brentvollebregt/auto-py-to-exe


## ffmpeg
```
// 提取视频中的音频文件
ffmpeg -i input.mp4 -vn -c:a copy output.aac
```

## electron-build 打包添加静态资源
- https://www.cnblogs.com/mrwh/p/12961446.html?ivk_sa=1024320u
  区分开发环境和打包后的环境进行处理
## electron-builder编译时报错
```
  reason=prebuild-install failed with error (run with env DEBUG=electron-builder to get more information)
                                            error=prebuild-install info begin Prebuild-install version 7.1.2
      prebuild-install warn This package does not support N-API version 36
```

解决的办法是因为sqlite3的版本问题 
npm install -E sqlite3@5.1.6

## ass字幕文件
- https://www.ottoli.org/howto/assfonts
- https://github.com/kira-96/ASS-file

## whisper 模型
```
//https://www.bilibili.com/read/cv23285680/
//https://blog.csdn.net/a71468293a/article/details/135995878

// 下载模型
model_size_or_path="指定模型位置"
如果不指定下载模型的位置，则下载到默认的路径 C:\Users\Administrator\.cache\whisper


```


## 暂时没用使用到 rebuild 
- https://github.com/electron/rebuild
```
    "rebuild------": "electron-rebuild -f -w sqlite3"
```

## mac下编译报错（sh: electron-builder: command not found）
```
npm i electron-builder
```

## 无法打开“yt-dlp”，因为Apple无法检查其是否包含恶意软件。
- https://www.jb51.net/os/MAC/881275.html
- 系统设置=>隐私与安全性=>往下拉可以看到=>安全性  yt-dlp =>点击允许即可


## opencv 模块安装
```
https://juejin.cn/post/7344572677393629222?searchId=20240412093508984473C394A8A2777775#heading-1

// 安装opencv
https://opencv.org/releases/

// 配置系统环境变量
OPENCV_DIR D:\opencv\build
OPENCV_BIN D:\opencv\build\x64\vc16\bin
OPENCV_INCLUDE_DIR D:\opencv\build\include
OPENCV_LIB_DIR D:\opencv\build\x64\vc16\bin
```
## 安装poetry 来管理python包
- https://juejin.cn/post/7337964441613287474?searchId=20240419174927096A3DB84F121D75E79C