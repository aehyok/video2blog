<template>
  <n-spin :show="model.showPin" :description="model.loadingText">
    <div class="container">
      <div class="flex-left">
        <div class="flex-header">
          <n-card title="下载视频" :bordered="false" size="small">
            <n-form
              ref="formRef"
              :model="model"
              label-placement="left"
              label-width="auto"
              require-mark-placement="right-hanging"
              size="medium"
            >
                    
              <n-divider />
              <n-form-item label="视频地址" path="input">
                <n-input
                  v-model:value="model.input"
                  type="text"
                  class="input"
                  placeholder="请输入视频地址"
                />
              </n-form-item>

              <n-form-item label="同时下载视频" path="checkedValue">
                <n-switch v-model:value="model.checkedValue" />
              </n-form-item>
            </n-form>
            <div style="display: flex; justify-content: flex-end">
              <n-button round type="info" @click="addLocalClick" style="margin-right: 10px;">
                 添加本地视频
              </n-button>
              <n-button round type="primary" @click="subtitleClick" style="margin-right: 10px;">
                获取视频字幕文件
              </n-button>
            </div>
            <n-divider />
        </n-card>
        </div>
        <div class="flex-video"><n-card title="视频播放" :bordered="false" size="small">
          <div id="videoPlayer" class="flex-video"></div>
        </n-card></div>
      </div>
      <div class="flex-right">
        <template v-for="item in model.list">
          <div class="flex-item" @click="selectItemClick(item)" :class="{ 'flex-select': item.isSelected }">
            <div style="width:90px;height: 100%;object-fit: contain;display: flex; align-items: center; justify-content: flex-start; ">
              <n-image
                width="80px"
                height="120px"
                style="object-fit: contain;border: 1px solid blue"
                src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
              />
            </div>
            <div style="width:100%;color:aliceblue; justify-content: space-between; display: flex; flex-direction: column; margin: 20px 0 20px 5px; ">
              <div style="text-align: left; padding-right: 10px;display: flex; flex-direction: row; justify-content: flex-start;">
                  <n-ellipsis :line-clamp="2" style="text-align: left;">
                    {{ item.Title }}
                  </n-ellipsis>
              </div><div style="text-align: left; font-size: 11px;">下载时间：{{ item.CreateTime }}</div>
              <div style="text-align: left; display: flex; justify-content: space-between; align-items: center; ">
                <div style="font-size: 11px;">所属平台：{{ getPlatform(item.Path) }}</div> 
                <div style="font-size: 11px;color: greenyellow;text-align: right; margin-right: 10px;" @click="jumpDetail(item)">详情</div></div>
            </div>
          </div>
        </template>
        <div style="width: 100px;height:160px;">

        </div>
      </div>
    </div>
</n-spin>
<FlashingButton />
</template>
<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NSwitch, NButton, NDivider, NImage, useMessage, NSpin,NEllipsis } from "naive-ui";
import type { FormInst } from "naive-ui";
import { reactive, ref, onMounted, defineAsyncComponent } from "vue";
import Player from "xgplayer";
import 'xgplayer/dist/index.min.css';
import { all, get } from "@/sqlite3.ts";
import { ipcRenderer } from "electron";
import { useRouter } from "vue-router";

let FlashingButton = defineAsyncComponent({
  loader: () => import('./components/flashing-button.vue')
})

const message = useMessage();
const router = useRouter();
message.success("欢迎使用aehyok视频转图文AI小工具");
let videoPlayer = ref<Player>();

const formRef = ref<FormInst | null>(null);

const model = reactive<any>({
  input: "",
  checkedValue: true,
  showPin: false,
  loadingText: "",
  list: [],
  isSelected: false,
  currentSelected: {},
});

const state = reactive({
  checkedValue: false,
  rule: {},
  executePath: "",
  middlePath: "",
  showActive: false,
});

onMounted(async() => {
  console.log("main.vue onMouted加载成功","error")
  let env = import.meta.env.MODE;
  state.middlePath = env == "development" ? "": "/resources";

  ipcRenderer.send("call-execute-path");
  await getAll();

  console.log(videoPlayer, "videoPlayer");
});

// 子进程定义方法
ipcRenderer.on("reply-execute-path", (event: any, executePath: string) => {
  console.log(event, "event-ipcRenderer");
  state.executePath = executePath;
});

const jumpDetail = (item: any) => {
  console.log("jumpDetail", item);
  router.push({
    path: "/home",
    query: {
      id: item.Id,
    },
  })
};

const addLocalClick = () => {
  message.warning("添加本地视频待实现")
}

const selectItemClick = (item: any) => {
  console.log("selectItemClick", item);
  model.list.forEach((element: any) => {
    element.isSelected = false;
  });

  item.isSelected = true;
  model.currentSelected = item;
  ipcRenderer.send("call-videoPath", item.FolderDate);
};

const getPlatform = (path: string) => {
  if (path.includes("bilibili")) {
    return "哔哩哔哩";
  } else if (path.includes("youtube") || path.includes("youtu.be")) {
    return "YouTube";
  } else if (path.includes("twitter")) {
    return "推特";
  } else if (path.includes("douyin")) {
    return "抖音";
  } else if (path.includes("xiaohongshu")) {
    return "小红书";
  }
}

const getAll = async () => {
  let env = import.meta.env.MODE;
  const rows: unknown = await all(
    "select * From ParsingVideo where Env = ? order by CreateTime desc",
    [env]
  );

  console.log(rows, "home页面获取数据");

  model.list = rows;
};

// 点击获取字幕
const subtitleClick = async () => {
  //先检查一下url是否为空
  console.log(model.input, "inputValue");
  if (model.input === "" || model.input === null) {
    message.warning("请输入视频链接");
    return;
  }

  const row: any = await get(
    `select * from ParsingVideo where Path = ? and Env = ? `,
    [model.input, import.meta.env.MODE]
  );

  if (row && row.Id) {
    console.log(row, "row-input", row.FolderDate);
    message.success("此链接视频已被下载，已跳转到该视频");
  } else {
    model.showPin = true;
    model.loadingText = "正在下载请稍后...";

    console.log("准备下载");
    ipcRenderer.send("call-yt-dlp", model.input, model.checkedValue);
  }
};

ipcRenderer.on("reply-videoPath", async(event: any, type: string) => {
  console.log(event, "event-ipcRenderer");
  console.log(model.currentSelected, "model.currentSelected");

  if(type) {
    videoPlayer.value = new Player({
      id: "videoPlayer",
      url: state.executePath + state.middlePath  +`/command/${model.currentSelected.FolderDate}/${model.currentSelected.Id}${type}`,
      height: "300px",
      width: "100%",
    });
  }
});

// 子进程定义方法

ipcRenderer.on("reply-output", async(event: any, isSupport: boolean, text) => {
  console.log(event, "event-ipcRenderer");
  if (!isSupport) {
    message.warning("不支持的视频链接");
    model.showPin = false;
    return;
  }

  if (text === "") {
    message.warning("下载成功，不存在字幕文件");
  }
  model.showPin = false;
  await getAll();
});
</script>
<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-left {
  width: 40vw;
  height: 100vh;
  background-color: #18181c;
  border-sizing: border-box;
}

.flex-header {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.input {
  margin-right: 10px;
  margin-left: 5px;
  text-align: left;
}

.flex-right {
  width: 60vw;
  height: calc(100vh - 10px);
  overflow: auto;
  padding-top: 10px;
  background-color: #18181c;
  border-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.flex-item {
  width:49%;
  height: 160px;
  box-sizing: border-box;
  display: flex; 
  flex-direction: row; 
  background-color: #303033; 
  padding-left: 10px; 
  border: 1px solid black;
  outline: none; /* 去除默认的聚焦边框 */
}

.flex-select {
  background-color: #8c87cd;
  border: 1px solid #8c87cd;
  border-radius: 10px;
  cursor: pointer;
}

.flex-item:focus, .flex-item:hover {
    background-color: #233633;
    border: 1px solid #7fe7c4;
    border-radius: 10px;
    cursor: pointer;
  }
</style>
