## 如何运行

- node和npm的版本在这附近应该都可以跑起来
```
node -v   20.11.0
npm -v 10.2.4
```

- 安装项目依赖
```
npm i 
```

- 本地window下运行
```
npm run start-win
```
- 本地mac下运行
```
npm run start-mac
```
> 主要在于win下命令行中中文乱码，mac下不会出现这个问题，于是使用 chcp 65001 命令来解决这个问题

## 如何编译
- 通过git仓库打tag标签来触发编译
github action workflow

- 其中python脚本

在window开发环境下打包，会在/command/win目录下生成exe文件
```
pyinstaller --onefile RemoveDuplicateImages.py -y --distpath  ../command/win
```

生成requirements.txt
```
poetry export -f requirements.txt --output requirements.txt
```

// mac下运行
// python3 -v 3.11.2
// pip3 -v 24.0

```
pip3 install -r requirements.txt
```
## 我的两个目标
- 一个是将视频转换为图文笔记
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

## prompt
```
// 第一个版本
现在你作为一个科技博主，请先精读上面的字幕，然后根据字幕内容再进行分段，分的段落不要太多，尽量保持在4到8段左右，分段后要对分段内容进行整理,注意一定不需要总结也不要进行删减内容，只是进行整理和微调，并标记字幕时间的区间

//第二个版本
现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，不能再多。并且再次提醒你，目录下的内容不能进行删减和总结哟

//第三个版本
现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，一定一定不能再多了。并且再次提醒你，目录下的所有内容不能进行删减和总结哟，后半段的内容也不能进行偷工减料。
将上述输出的内容最终转换为Quill 富文本编辑器的Delta的JSON格式。

//第四个版本
现在你作为一个科技博主，请先精读上面的字幕，然后直接对上面的字幕进行整理成一篇文章进行输出，记住一定一定不要删减任何内容，也不要进行总结。对输出的文章增加目录功能，而且目录标题一定一定要精简，并且在目录上添加字幕时间区间，目录最多4到8个，一定一定不能再多了。并且再次提醒你，目录下的所有内容不能进行删减和总结哟，后半段的内容也不能进行偷工减料。将上述输出的内容最终转换为markdown格式，目录上添加##，目录下的内容不做任何处理就行了
```

- 暂定的终极版本
```
  角色： 你现在作为一个资深的科技博主
  任务：
  1、精读字幕： 请仔细阅读提供的字幕内容。
  2、生成博文： 将字幕内容整理成一篇博文，务必保留所有信息，不做任何删减或总结。
  3、创建目录：
    目录标题需精简，并包含对应内容的时间区间，时间区间要精确。
    目录数量控制在 4-8 个。
    目录格式使用 markdown，即在标题前添加 ##。
    所有生成的目录后面都要添加时间区间，前言中的目录列表可以不添加时间区间。
  4、正文格式：
    保留字幕内容的完整性，不做任何删减或总结。要整理成博文内容啊。
    无需对正文内容进行 markdown 格式处理。
  目标：
  生成一篇包含完整字幕内容的博文，并配有清晰、精简的目录，方便读者阅读和导航。开头是前言加上目录，然后后面以目录正文的形式展示剩余内容。
  注意：
  确保忠实于原始字幕内容，避免信息丢失。
  目录应简洁明了，方便读者快速定位所需信息。
  优化说明：
  在原提示词的基础上，强调了保留所有信息的重要性，避免博文内容被删减。
  明确了目录格式的要求，使用 markdown 形式，并限制了目录数量，确保简洁易读。
  细化了任务步骤，使指令更清晰易懂。
  最终我直接复制markdown内容使用。
  ---------------------------------
  按照这个格式给我输出一个模板我看看
```

## 技术栈
- ffmpeg
  -  https://miaopei.github.io/2019/05/04/FFmpeg/FFmpeg%E5%91%BD%E4%BB%A4%E5%A4%A7%E5%85%A8/#2-FFMPEG-%E7%9B%AE%E5%BD%95%E5%8F%8A%E4%BD%9C%E7%94%A8
- 参考文档
   - https://www.electronjs.org/zh/docs/latest/tutorial/quick-start

-  初始化项目
   - https://electron-vite.github.io/guide/getting-started.html

- 主进程和渲染进程间的通信
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

- Menu菜单的设置
  - https://www.electronjs.org/zh/docs/latest/api/menu

- 引入node原生模块
  - https://www.electronjs.org/zh/docs/latest/tutorial/using-native-node-modules

-  Electron 获取当前用户data存放目录
   - https://segmentfault.com/a/1190000044417762

- npm build 报错 node-gyp
  - https://github.com/caoxiemeihao/electron-vite-samples/issues/9
  - https://www.cnblogs.com/RaySirBlog/p/17337079.html

- sqlite3 操作数据库api
  - https://github.com/TryGhost/node-sqlite3/wiki/API

- python 打包成exe
  - https://github.com/brentvollebregt/auto-py-to-exe

- electron-build 打包添加静态资源
  - https://www.cnblogs.com/mrwh/p/12961446.html?ivk_sa=1024320u
    区分开发环境和打包后的环境进行处理
- electron-builder编译时报错
```
  reason=prebuild-install failed with error (run with env DEBUG=electron-builder to get more information)
                                            error=prebuild-install info begin Prebuild-install version 7.1.2
      prebuild-install warn This package does not support N-API version 36
```
  解决的办法是因为sqlite3的版本问题 
  npm install -E sqlite3@5.1.6

- whisper 模型
```
//https://www.bilibili.com/read/cv23285680/
//https://blog.csdn.net/a71468293a/article/details/135995878

// 下载模型
model_size_or_path="指定模型位置"
如果不指定下载模型的位置，则下载到默认的路径 C:\Users\Administrator\.cache\whisper

```

-  mac下编译报错（sh: electron-builder: command not found）
  ```
  npm i electron-builder
```
-  无法打开“yt-dlp”，因为Apple无法检查其是否包含恶意软件。
   - https://www.jb51.net/os/MAC/881275.html
   - 系统设置=>隐私与安全性=>往下拉可以看到=>安全性  yt-dlp =>点击允许即可

- 安装poetry 来管理python包
   - https://juejin.cn/post/7337964441613287474?searchId=20240419174927096A3DB84F121D75E79C

## 可参考项目
  - https://github.com/caoxiemeihao/electron-vite-samples
  - https://github.com/1111mp/electron_client
  - https://github.com/fanchenio/DawnLauncher
  - https://summarize.ing/
  - https://github.com/nashsu/FreeAskInternet
  - https://www.videotoblog.ai/