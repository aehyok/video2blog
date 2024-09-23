<template>
  <n-spin :show="showPin" :description="state.loadingText">
    <n-layout content-style="position:relative;height: 100vh">
      <n-layout-header class="header">
        
          <div><span style="color: red;">标题：</span><span style="text-decoration: underline;margin-right: 10px;">{{ outputTitle }}</span><n-button type="info" size="small" @click="changTitleClick">改写标题</n-button></div>
          <div style="width: 140px;"><n-button
            @click="backClick"
            size="small"
            style="margin-left: 10px"
            >返回</n-button
          >
          <n-button
            @click="saveClick"
            size="small"
            type="primary"
            style="margin-left: 10px; margin-right: 10px;"
            >保存</n-button
          >
          </div>
      </n-layout-header>
      <n-layout-content content-style="margin-left:20px;">
        <n-grid :cols="24" x-gap="12">
          <n-gi :span="6">
            <n-input
              v-model:value="outputSource"
              type="textarea"
              ref="source"
              class="textarea"
              placeholder="这里是原始字幕"
              @contextmenu="onContextMenu($event, 'textarea')"
            >
            </n-input>
          </n-gi>
          <n-gi :span="18">
            <MdEditor
              v-model="outputTarget"
              theme="dark"
              ref="target"
              class="textarea"
              placeholder="这里将是AI生成的文章（右侧区域为预览区）..."
              @contextmenu="onContextMenu($event, 'editor')"
            />
          </n-gi>
        </n-grid>
      </n-layout-content>
      <n-layout-footer :inverted="inverted" bordered class="footer">
        <p>Powered by aehyok v{{ version }} Copyright © 2024 - All right reserved.</p>
      </n-layout-footer>
    </n-layout>
  </n-spin>
  <FlashingButton />

  <!-----prompt设置----->
  <PromptModal
    ref="promptModal"
    v-model:showPromptModal="state.showPromptModal"
    :videoKey="selectedKey"
  />

  <AIModal
    ref="AIpromptModal"
    v-model:showAIModal="state.showAIModal"
    :select-code="state.selectCode"
    :select-input="state.selectInput"
    :videoKey="selectedKey"
    :target="target"
  />

  <!-----时间区间图片弹窗选择----->
  <ImageListModal
    ref="imageListModal"
    :target="target"
    v-model:showImageModal="state.showImageModal"
    :videoData="state.currentVideoData"
    :everyStartTime="state.everyStartTime"
    :everyEndTime="state.everyEndTime"
    @resetToken="resetToken"
  />

  <!-----墨滴平台扫码确认身份------>
  <QrcodeModal
    v-model:showQrCodeModal="state.showQrCodeModal"
    :qrCodeUrl="state.qrCodeUrl"
  />

  <!-- <SystemSettingDrawer v-model:showActive="state.showActive" /> -->

  <context-menu
    v-model:show="state.showMenu"
    :options="state.menuOptions"
    v-if="state.rightMenuList.length > 0"
  >
    <context-menu-group
      v-if="state.rightGroupLevel"
      v-for="item in state.rightMenuList"
      :key="item?.label"
      :label="item.label"
    >
      <context-menu-item
        v-if = "item?.children && item?.children.length > 0"
        v-for="child in item?.children"
        :key="child?.label"
        :label="child.label"
        @click="rightContextMenuClick(child)"
      >
        <template #icon>
          <n-icon><Camera /></n-icon>
        </template>
      </context-menu-item>
    </context-menu-group>

    <context-menu-item
        v-if = "!state.rightGroupLevel"
        v-for="child in state.rightMenuList"
        :key="child?.label"
        :label="child.label"
        icon="camera"
        @click="rightContextMenuClick(child)"
      >
      <template #icon>
        <n-icon><Camera /></n-icon>
      </template>
      </context-menu-item>
  </context-menu>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
//导入组件
import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuSeparator,
  ContextMenuItem,
} from "@imengyu/vue3-context-menu";
export default defineComponent({
  //注册组件
  components: {
    ContextMenu,
    ContextMenuGroup,
    ContextMenuSeparator,
    ContextMenuItem,
  },
  //省略其他代码
});
</script>
<script setup lang="ts">
import { ref, reactive, onMounted, toRaw, defineAsyncComponent  } from "vue";
import { ipcRenderer } from "electron";
import {
  NButton,
  NInput,
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NSpin,
  NLayoutContent,
  NIcon,
  useMessage,
  NGi,
  NGrid,
  useDialog,
} from "naive-ui";

import { get, run } from "@/sqlite3.ts";
import { useStorage } from "@vueuse/core";
import { getUserSelf } from "@/utils/request.ts";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import packageInfo from "../../../package.json";
import { createQrCode, checkLogin } from "@/utils/request";
import { secondsToTime } from "@/utils";
import { Camera } from "lucide-vue-next"
import { useRoute, useRouter } from "vue-router";

let QrcodeModal =  defineAsyncComponent({
  loader: () => import('./components/qrcode-modal.vue')
})

let ImageListModal =  defineAsyncComponent({
  loader: () => import('./components/imagelist-modal.vue')
})

let AIModal =  defineAsyncComponent({
  loader: () => import('./components/ai-modal.vue')
})

let PromptModal =  defineAsyncComponent({
  loader: () => import('./components/prompt-modal.vue')
})

let FlashingButton = defineAsyncComponent({
  loader: () => import('./components/flashing-button.vue')
})

const route = useRoute();
const router = useRouter();

const version = ref("");
const dialog = useDialog();
version.value = packageInfo.version;

const cacheState: any = useStorage("token", {});

const message = useMessage();
const source = ref(null);
const target = ref<any>(null);
const intervalId = ref<any>();
const selectedKey = ref("");
const state = reactive<any>({
  rightMenuList: [],
  rightGroupLevel: false, //右键菜单是否显示
  showMenu: false,
  showImageModal: false,
  showPromptModal: false,
  showAIModal: false,
  showActive: false,
  selectCode: "",
  selectInput: "",
  qrCodeUrl: "",
  sceneStr: "",
  showQrCodeModal: false,
  currentVideoData: {},
  imageList: [],
  checkImageList: [],
  everyStartTime: "",
  everyEndTime: "",
  loadingText: "",
  menuOptions: {
    zIndex: 3,
    minWidth: 230,
    x: 500,
    y: 200,
    theme: "mac dark",
  },
  openApiList: []
});

const changTitleClick = () => {
  message.warning("AI改写标题暂未实现")
}


const rightContextMenuClick = async (item: any) => {
  console.log(item, "右键点击菜单时触发的事件");
  switch (item.code) {
    case "srt2blog-one":  // 单人对话视频（字幕转博客）
      state.showPromptModal = true;
      state.selectCode = "srt2blog";
      break;
    // case "whisperset":
    //   state.showWhisperModal = true;
    //   break;
    // case "convertset":
    //   state.showWhisperConvertModal = true;
    //   break;
    case "tochinese": 
    case "toenglish":
    case "srt2blog-more":  // 多人对话视频（字幕转博客）
      message.error("待实现");
      break;
    case "getImage":
      console.log(cacheState, "cacheState");
      await createQrCodeApi();
      break;
    case "rewrite-ai":
      state.showAIModal = true;
      state.selectCode = "rewrite-ai";
      state.selectInput = target.value.getSelectedText();
      break;  
    case "getImageAll":
      dialog.warning({
        title: "获取视频中的所有图片",
        content: "因为整个视频进行去重循环，用时会很长的哟？",
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
          console.log(cacheState, "cacheState");
          await createQrCodeApi();
        },
        onNegativeClick: () => {
          // message.error('不确定')
        },
      });
      break;
    default:
      // Handle any other cases if necessary
      break;
  }
};

const resetToken = async () => {
  cacheState.value = {};
  console.log("子组件调用到父级的方法");
  await createQrCodeApi();
};

const createQrCodeApi = async () => {
  if (!cacheState.value?.token) {
    const result: any = await createQrCode();
    console.log(result, "result");
    if (result.status === 200) {
      state.showQrCodeModal = true;
      state.qrCodeUrl = result.data.data.qrCode;
      state.sceneStr = result.data.data.sceneStr;
      console.log(state.qrCodeUrl, state.sceneStr, "state/qrCodeUrl");
      intervalId.value = setInterval(async () => {
        await checkLoginApi();
      }, 2000);
    }
  } else {
    state.showImageModal = true;
  }
};

/**
 * 检查mdnice登录状态
 */
const checkLoginApi = async () => {
  if (state.sceneStr) {
    const response = await checkLogin(state.sceneStr);
    if (response.data.data) {
      console.log(response.data.data, "response.data.data");
      clearInterval(intervalId.value);
      state.showQrCodeModal = false;
      state.showImageModal = true;
      cacheState.value = response.data.data;
      const userInfo = await getUserSelf();
      console.log(userInfo, "userSelf");
    }
  }
};

/**
 *
 * @param e
 * @param type 类型： textarea（左侧文本域）, editor（右侧富文本）
 */
const onContextMenu = (e: any, type: string) => {
  if (type === "textarea") {
    if (outputSource.value) {
      state.rightGroupLevel = true
      state.rightMenuList = [
        {
          label: "将字幕内容转换为博客文章",
          children: [
            {
              label: "将字幕内容转换为博客文章(单人视频字幕)",
              code: "srt2blog-one",
            },
            {
              label: "将字幕内容转换为博客文章(多人视频字幕)",
              code: "srt2blog-more",
            },
          ],
        },
        {
          label: "翻译字幕",
          children:[
            { label: "英文翻译为中文", code: "tochinese" },
            { label: "中文翻译为英文", code: "toenglish" },
          ]
        }
      ];
    }
  }

  if (type === "editor") {
    const selectionText = target.value.getSelectedText();

    // /(\d{2}:\d{2}:\d{2}\.\d{3}) .* (\d{2}:\d{2}:\d{2}\.\d{3})/;
    const regExp =
      /(\d{2}:\d{2}:\d{2}[.,-]\d{3}) .* (\d{2}:\d{2}:\d{2}[.,-]\d{3})/;
    const match = regExp.exec(selectionText);

    console.log(match, "match");
    if (match) {
      state.everyStartTime = match[1];
      state.everyEndTime = match[2];
      console.log(state.everyStartTime, state.everyEndTime);
      state.rightGroupLevel = false
      state.rightMenuList = [{ label: "获取图片", code: "getImage" }];
    } else {
      state.everyStartTime = "00:00:00.000";
      state.rightGroupLevel = true
      state.rightMenuList = [{ label: "获取全文图片", code: "getImageAll" }, { label: "" }];
      ipcRenderer.send("call-get-duration", state.currentVideoData.FolderDate);
    }

    console.log(selectionText, "selectionText");
  }
  e.preventDefault();
  state.menuOptions.x = e.x;
  state.menuOptions.y = e.y;
  state.showMenu = true;
};

const backClick = () => {
  console.log("返回按钮");
  router.go(-1);
};

const saveClick = async () => {
  if ((state.currentVideoData as any).Id) {
    const updateSql = `
        UPDATE ParsingVideo
        SET SourceSubtitles = $1, TargetSubtitles = $2
        WHERE Id = $3
      `;
    const result = await run(updateSql, [
      outputSource.value,
      outputTarget.value,
      state.currentVideoData.Id,
    ]);
    if (!result) {
      console.log(result, "result");
      message.success("保存成功");
    }
  } else {
    message.warning("请先选择要编辑的视频");
  }
};

const inverted = ref(false);
const showPin = ref(false);
const outputSource = ref("");
const outputTarget = ref("");
const outputTitle = ref("");

onMounted( async() => {
  console.log("index.vue onMouted加载成功","error")
  const id = route.query.id as string;
  console.log(id, "id");

  const row: any = await get(
    `select * from ParsingVideo where Id = ? and Env = ?`,
    [id, import.meta.env.MODE]
  );
  console.log(row, "row", row.FolderDate);
  outputSource.value = row.SourceSubtitles;
  outputTarget.value = row.TargetSubtitles;
  outputTitle.value = row.Title;

  state.currentVideoData = row;
});

// 子进程定义方法
ipcRenderer.on("reply-output", (event: any, isSupport: boolean, text) => {
  console.log(event, "event-ipcRenderer");
  if (!isSupport) {
    message.warning("不支持的视频链接");
    showPin.value = false;
    return;
  }

  if (text === "") {
    message.warning("下载成功，不存在字幕文件");
  }
  outputSource.value = text;
  showPin.value = false;
});

ipcRenderer.on("reply-json", (event: any, text: string) => {
  console.log(text, "text-text", event);
  outputSource.value = text;
});

ipcRenderer.on("reply-duration", (event: any, duration: number) => {
  console.log(duration, "duration", event);
  state.everyStartTime = "00:00:00";
  state.everyEndTime = secondsToTime(duration);
  console.log(state.everyEndTime, "state/everyStartTime");
  state.rightGroupLevel = false
  state.rightMenuList = [
    // { label: "获取全文图片", code: "getImage" }, 
    { label: "AI改写", code: "rewrite-ai" }
  ];
});
</script>
<style scoped>
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.header {
  padding-left: 20px;
  width: 100vw;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

.right {
  margin-right: 10px;
  font-size: 12px;
}

.input {
  margin-right: 10px;
  margin-left: 5px;
  width: 400px;
  text-align: left;
}

.textarea {
  height: calc(100vh - 100px);
  margin-right: 40px;
  position: relative;
  background-color: #18181c;
}

.editor:hover {
  background-color: #182525;
}

.list-height {
  margin-top: 30px;
}

:deep(.n-menu .n-menu-item) {
  margin-top: 3px;
}

.menu-border {
  padding-top: 10px;
  overflow-x: auto;
}

.menu-sider {
  height: calc(100vh - 100px);
}

.menu-sider:hover {
  background-color: #182525;
  border: 1px solid #7fe7c4;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
}

:deep(.w-e-bar) {
  background-color: #28282c;
  color: white;
}

:deep(.w-e-text-container) {
  background-color: #28282c;
  color: white;
}

:deep(.md-editor-toolbar-wrapper) {
  display: none;
}

:deep(.n-checkbox .n-checkbox-box .n-checkbox-box__border) {
  border: 2px solid #63e2b7;
}

:deep(.ͼ1 .cm-scroller) {
  background-color: #18181c;
}
</style>
