<template>
  <n-spin :show="showPin" :description="state.loadingText">
    <n-layout content-style="position:relative;">
      <n-layout-header class="header">
        
          <div><span style="color: red;">标题：</span><span style="text-decoration: underline;margin-right: 10px;">{{ outputTitle }}</span><n-button type="info" size="small" @click="changTitleClick">改写标题</n-button></div>
          <div><n-button
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
            <n-button
                @click="setClick"
                size="small"
                type="info"
                style="margin-left: 10px; margin-right: 10px;"
            >设置</n-button
            >
          </div>
      </n-layout-header>
      <n-layout has-sider content-style="padding: 24px;">
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
      </n-layout>
      <n-layout-footer :inverted="inverted" bordered class="footer">
        Powered by aehyok v{{ version }} Copyright © 2024 - All right reserved.
      </n-layout-footer>
<!--      <div-->
<!--        style="left: 260px; top: 200px; position: absolute; z-index: 1"-->
<!--        v-if="isDownloadVideo"-->
<!--      >-->
<!--        <n-button circle color="#8a2be2" @click="downloadVideoClick">-->
<!--          <template #icon>-->
<!--            <n-icon><Download /></n-icon>-->
<!--          </template>-->
<!--        </n-button>-->
<!--      </div>-->
    </n-layout>
  </n-spin>

  <!-- <n-drawer v-model:show="active" :width="502" :placement="'right'">
    <n-drawer-content title="系统设置">
      <p style="color: #bbee53; font-size: 16px;">One-Api平台对接：https://github.com/songquanpeng/one-api</p>
      <n-table :bordered="false" :single-line="false">
        <thead>
        <tr>
          <th>model</th>
          <th>baseURL</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in state.openApiList ">
          <td>{{ item.Model }}</td>
          <td>{{ item.BaseUrl }}</td>
          <td>
            <NButton size="tiny" :type="item.IsDefault ==1 ? 'primary': 'warning'">
              {{ item.IsDefault ==1 ? "启用": "禁用" }}
            </NButton>
          </td>
          <td>
            <NButton type="tertiary" size="tiny" @click="editOpenApiClick(item)">编辑</NButton>
            <NButton size="tiny" type="tertiary" @click="changeStatus(item)" >{{item.IsDefault == 1 ? "禁用" : "启用"}}</NButton>
          </td>
        </tr>
        </tbody>
      </n-table>
      <div style="display: flex; justify-content: flex-end; margin: 20px;">
        <NButton style="margin-right: 20px" type="primary" size="tiny" color="#bbee53" @click="addOpenApiClick">新增</NButton>
      </div>
      <n-form v-if="showForm" ref="formRef" label-placement="top" :model="dynamicForm" :style="{ maxWidth: '440px' }">
        <n-form-item
            label="model"
            path="model"
            :rule="{
                required: true,
                message: '请输入model',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.model" placeholder="请输入model" clearable />
        </n-form-item>
        <n-form-item
            label="baseUrl"
            path="baseUrl"
            :rule="{
                required: true,
                message: '请输入baseUrl',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.baseUrl" placeholder="请输入baseUrl" clearable />
        </n-form-item>
        <n-form-item
            label="apiKey"
            path="apiKey"
            :rule="{
                required: true,
                message: '请输入apiKey',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.apiKey" placeholder="请输入apiKey"  clearable />
        </n-form-item>
        <n-form-item
            label="remark"
            path="remark"
            :rule="{
                required: false,
                message: '请输入remark',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.remark" placeholder="请输入remark" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button attr-type="button" @click="saveOpenApiClick">
              保存
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-drawer-content>
  </n-drawer> -->

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

  <SystemSettingDrawer v-model:showActive="state.showActive" />

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
import { ref, reactive, onMounted, toRaw  } from "vue";
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
// import {
//   DownloadOutline as Download,
// } from "@vicons/ionicons5";
import PromptModal from "./components/prompt-modal.vue";
import AIModal from "./components/ai-modal.vue";
import ImageListModal from "./components/imagelist-modal.vue";
import QrcodeModal from "./components/qrcode-modal.vue";
import SystemSettingDrawer from "./components/systemset-drawer.vue"
import { get, all, run } from "@/sqlite3.ts";
import { useStorage } from "@vueuse/core";
import { getUserSelf } from "@/utils/request.ts";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import packageInfo from "../../../package.json";
import { createQrCode, checkLogin } from "@/utils/request";
import { secondsToTime } from "@/utils";
import { Camera } from "lucide-vue-next"
import { useRoute, useRouter } from "vue-router";

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

// const dynamicForm = reactive({
//   id: "",
//   model: "",
//   baseUrl: "",
//   apiKey: "",
//   remark: "",
//   isDefault: 0,
// });

const changTitleClick = () => {
  message.warning("AI改写标题暂未实现")
}

// const isDownloadVideo = computed(() => {
//   console.log("isDownloadVideo", state.currentVideoData);
//   return Object.keys(state.currentVideoData).length === 0
//     ? false
//     : (state.currentVideoData as any).HasVideo !== 1;
// });

// const downloadVideoClick = () => {
//   dialog.warning({
//     title: "视频下载",
//     content: "请确认是否下载该视频？",
//     positiveText: "确定",
//     negativeText: "取消",
//     onPositiveClick: async () => {
//       showPin.value = true;
//       state.loadingText = "正在下载视频请稍后...";
//       ipcRenderer.send("call-yt-dlp-video", state.currentVideoData.Path);
//     },
//     onNegativeClick: () => {
//       // message.error('不确定')
//     },
//   });
// };

// const testApi = async () => {
//   const code = "gemini";
//   const geminiInfo: any = await get(
//     `select apiKey from OpenAPI where code = ?`,
//     code
//   );
//   console.log(geminiInfo, "geminiInfo");
//   const genAI = new GoogleGenerativeAI(geminiInfo.apiKey);
//
//   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//
//   const prompt =
//     "请使用中文回答我，中国所有的省份，并列举每个省份至少一个好玩的地方";
//
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   const text = response.text();
//   console.log(text, "response");
// };

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

const setClick = async() => {
  // active.value = true;
  state.showActive = true;
  // showForm.value = false;
  // await getOpenApiList();
  // state.showMenu = true;
};

// const getOpenApiList = async() =>  {
//   const rows = await all(
//       "select * from OpenAPI",
//       []
//   );
//   console.log(rows, "openapi----")
//   state.openApiList = rows;
// }
/**
 * 修改状态
 */
// const changeStatus = async(item: any) => {
//   console.log("item", item);//0变1，启用
//     if( item.IsDefault === 0 ) {
//       if (state.openApiList.some((openItem: any) => openItem.IsDefault === 1)) {
//         message.warning("请先将当前的启用记录[禁用]");
//         return;
//       }
//     }

//     const updateSql = `
//           UPDATE OpenAPI
//           SET IsDefault = $1
//           WHERE Id = $2
//         `;
//     const result = await run(updateSql, [item.IsDefault === 0 ? 1 : 0,item.Id]);
//     if(!result) {
//       console.log(result, "状态变更成功")
//       message.success("状态变更成功")
//       await getOpenApiList();
//     }
// }

/**
 * 编辑
 * @param item
 */
// const editOpenApiClick = (item: any) => {
//   showForm.value = true;
//   dynamicForm.id = item.Id;
//   dynamicForm.model = item.Model;
//   dynamicForm.remark = item.Remark;
//   dynamicForm.apiKey = item.ApiKey;
//   dynamicForm.baseUrl = item.BaseUrl;
// }

// const saveOpenApiClick = async(e: any) => {
//   e.preventDefault();

//   formRef.value?.validate(async(errors: any) => {
//     if (!errors) {

//       // 修改
//       if(dynamicForm.id) {
//         const updateSql = `
//           UPDATE OpenAPI
//           SET Model = $1, BaseUrl = $2, ApiKey = $3, Remark = $4
//           WHERE Id = $5
//         `;
//         const result = await run(updateSql, [dynamicForm.model, dynamicForm.baseUrl, dynamicForm.apiKey, dynamicForm.remark, dynamicForm.id]);
//         if(!result) {
//           console.log(result, "修改成功")
//           message.success("修改成功")
//           setTimeout(() => {
//             showForm.value = false;
//           }, 500)
//         }
//       }
//       // 新增
//       else {
//         const insertSql = `insert into OpenAPI (Id, Model, BaseUrl, ApiKey, Remark, IsDefault)
//                      values ($Id, $Model, $BaseUrl, $ApiKey, $Remark, $IsDefault)`;
//         let data = toRaw(dynamicForm);
//         console.log(data, "data---bew")
//         const result =  await run(insertSql, {
//           $Id: 10,
//           $Model: data.model,
//           $BaseUrl: data.baseUrl,
//           $ApiKey: data.apiKey,
//           $Remark: data.remark,
//           $IsDefault: 0
//         } );
//         if(!result) {
//           console.log(result, "新增成功")
//           message.success("新增成功")
//           setTimeout(() => {
//             showForm.value = false;
//           }, 500)
//         }
//       }
//     }
//     else {
//       console.log('errors', errors)
//     }
//   })
// }

// const addOpenApiClick = () => {
//   showForm.value = true;
//   dynamicForm.id = "";
//   dynamicForm.model = "";
//   dynamicForm.remark = "";
//   dynamicForm.apiKey = "";
//   dynamicForm.baseUrl = "";
// }

// const modalClick = async () => {
//   await getWhisperModelList();
//   showModal.value = true;
//   modal.create({
//     title: "模态框",
//     content: "内容",
//     preset: "dialog",
//   });
// };


// function renderIcon(icon: any) {
//   return () => h(NIcon, null, { default: () => h(icon) });
// }
//
// const menuOptions = ref<any[]>([]);
// const modelList = ref<any[]>([]);

const inverted = ref(false);
const showPin = ref(false);
const outputSource = ref("");
const outputTarget = ref("");
const outputTitle = ref("");


// const getWhisperModelList = async () => {
//   const rows = await all(
//     "select Id, Title, Name, Type, Size, IsDownLoad from WhisperModel",
//     []
//   );
//   console.log(rows, "whisperList");
//   modelList.value = rows;
// };

// getAll("");
// const onMenuChange = async (key: string, item: any) => {
//   console.log("onMenuChange", key, item);
//   const row: any = await get(
//     `select * from ParsingVideo where Id = ? and Env = ?`,
//     [key, import.meta.env.MODE]
//   );
//   console.log(row, "row", row.FolderDate);
//   outputSource.value = row.SourceSubtitles;
//   outputTarget.value = row.TargetSubtitles;
//   outputTitle.value = row.Title;
//   state.currentVideoData = row;
// };

onMounted( async() => {
  // getAll("");
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
  // getAll(input.value);
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

// ipcRenderer.on("reply-download-video", async (event: any, text: string) => {
//   showPin.value = false;
//   const updateSql = `
//                 UPDATE ParsingVideo
//                 SET HasVideo = $1
//                 WHERE Id = $3
//               `;
//   const result = await run(updateSql, [1, state.currentVideoData.Id]);
//   if (!result) {
//     getAll(state.currentVideoData.Id);
//     console.log(result, "result");
//     message.success("视频下载完毕");
//   }
// });
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
  line-height: 1.5;
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
  height: calc(100vh - 120px);
  margin-right: 40px;
  position: relative;
  background-color: #18181c;
}

.render-html {
  height: calc(100vh - 120px);
  position: relative;
  overflow: auto;
}

:deep(.ql-toolbar.ql-snow) {
  border: 1px solid #28282c;
}
:deep(.ql-container) {
  border: 1px solid grey;
  height: calc(100vh - 165px);
}

:deep(.ql-editor) {
  min-width: 400px;
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
  height: calc(100vh - 120px);
}

.menu-sider:hover {
  background-color: #182525;
  border: 1px solid #7fe7c4;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4px;
}

/* .download-modal {
  display: flex;
  justify-content: space-between;
}

.font-downloaded {
  color: grey;
}

.font-download {
  color: green;
  cursor: pointer;
} */

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
