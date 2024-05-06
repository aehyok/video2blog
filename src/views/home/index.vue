<template>
  <n-spin :show="showPin" :description="state.loadingText">
    <n-layout>
      <n-layout-header class="header">
        <div>
          <n-input type="text" v-model:value="input" class="input" placeholder="请输入视频地址"></n-input>
          <n-switch v-model:value="checkedValue"/>
          <span class="right">同时下载视频</span>
          <n-button @click="SubtitleClick" size="small" type="primary">获取视频字幕文件</n-button>
          <!-- <n-button @click="modalClick" size="small" type="primary" style="margin-left:10px;">下载模型</n-button>
          <n-button @click="testApi" size="small" type="primary" style="margin-left: 10px;">gemini</n-button> -->
        </div>
        <div style="margin-right:25px;">
          <n-button @click="saveClick" size="small" type="primary" style="margin-left:10px;">保存</n-button>
          <!-- <n-button @click="getHtml" size="small" type="info" style="margin-left:10px;">html</n-button> -->
        </div>
      </n-layout-header>
      <n-layout has-sider content-style="padding: 24px;">
        <n-layout-sider
          show-trigger
          collapse-mode="width"
          :collapsed-width="60"
          :width="240"
          :native-scrollbar="false"
          :inverted="inverted"
          class="menu-sider"
        >
        <n-menu
          :inverted="inverted"
          :collapsed-width="60"
          :collapsed-icon-size="20"
          :options="menuOptions"
          v-model:value="selectedKey"
          @update:value = "onMenuChange"
          class="menu-border"
        />
        </n-layout-sider>
        <n-layout-content content-style="margin-left:20px">
          <n-grid :cols="24" x-gap="12">
            <n-gi :span="6">
              <n-input
                v-model:value="outputSource"
                type="textarea"
                ref="source"
                class="textarea"
                placeholder="这里是原始字幕"
                @contextmenu="onContextMenu($event,'textarea')"
              >
              </n-input>
            </n-gi>
            <n-gi :span="18">
              <MdEditor v-model="outputTarget"  theme='dark' ref="target" class="textarea" placeholder="这里将是AI生成的文章（右侧区域为预览区）..."  @contextmenu="onContextMenu($event,'editor')"/>
            </n-gi>
          </n-grid>
        </n-layout-content>
      </n-layout>
      <n-layout-footer :inverted="inverted" bordered class="footer">
          Powered by aehyok v{{ version }} Copyright © 2024 -  All right reserved.
      </n-layout-footer>
    </n-layout>
  </n-spin>

  <!-----whisper模型下载模态框------>
  <n-modal :show="showModal" >
    <n-card
      style="width: 700px"
      title="模态框"
      size="huge"
      :bordered="true"
      role="dialog"
      aria-modal="true"
    >
      <n-grid :cols="2" x-gap="24" style="margin-left:10px;">
        <n-gi>多语言通用模型:</n-gi>
        <n-gi>多语言通用模型:</n-gi>
      </n-grid>

      <n-grid :cols="2" x-gap="24">
        <n-gi v-for="item in modelList" border>
          <div style="border: 1px solid grey; border-radius: 6px; padding:10px;margin: 10px;">
            <div style="font-size: 16px; font-weight: 800;">{{ item.Title }}</div>
            <div class="download-modal">
              <div style="display: flex; align-items: center; justify-content: center;">
                <div style="color:gray;">{{ item.Name }}</div>
                <div style="color: red;font-size:10px;">({{ item.Size }})</div>
              </div>
              <div :class="item.IsDownLoad? 'font-downloaded': 'font-download'">{{ item.IsDownLoad ? '已下载': '下载模型' }}</div>
            </div>
          </div>
        </n-gi>
      </n-grid>
    </n-card>
  </n-modal>

  <n-modal
    style="width: 300px;height: 300px"
    v-model:show = "state.showQrCodeModal" 
    preset="dialog"
    :show-icon="false"
    :title="'墨滴第三方平台扫码登录'"
  >
    <div class="modal-center">
      <img :src="state.qrCodeUrl" style="width: 200px; height: 200px;" />
      <div style="margin-top: 10px;">本二维码由墨滴平台生成</div>
    </div>
  </n-modal>

  <!---区间图片选择------>
  <n-modal 
    style="width:680px;"
    v-model:show = "state.showImageModal" 
    preset="dialog" 
    :showIcon="false"
    :title="'区间图片选择(' + state.everyStartTime + '-' +  state.everyEndTime + ')'" 
    @after-leave="closeImageModalClick"
    positive-text="确定"
    negative-text="关闭"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
    >
    <n-spin :show="state.showImagePin" :description="state.imageLoadingText">
      <div style="display: flex; justify-content: flex-end; gap: 20px; align-items: center;">
        <n-button @click="reImage(10)">默认去重</n-button>
        <n-button @click="reImage(20)">加倍去重x1</n-button>
        <n-button @click="reImage(25)">加倍去重x2</n-button>
        <n-button @click="reImage(30)">加倍去重x3</n-button>
      </div>
      <n-scrollbar style="max-height: 500px; margin-top: 20px;margin-left:10px;">
        <n-checkbox-group v-model:value="state.checkImageList">
          <n-grid x-gap="12" y-gap="12" :cols="3">
            <n-gi v-for="item in state.imageList" :key="item.file" style="height: 100px; position: relative;" >
              <n-image :src="item.base64" :alt="item.file" style="height: 100%; border-radius: 5px;"  />
              <n-checkbox :value="item.file" style="position: absolute; top: 4px; right: 28px; z-index: 1;"  />
            </n-gi>
          </n-grid>
      </n-checkbox-group>
      </n-scrollbar>
    </n-spin>
  </n-modal>
  <n-drawer v-model:show="active" :width="502" :placement="'right'">
    <n-drawer-content title="系统设置">
      <n-collapse>
    <n-collapse-item title="文件下载地址" name="1">
      <div>文件下载地址</div>
    </n-collapse-item>
    <n-collapse-item title="Google Gemini" name="2">
      <div>Gemini Api</div>
    </n-collapse-item>
    <n-collapse-item title="OpenAI ChatGPT" name="3">
      <div>ChatGPT Api</div>
    </n-collapse-item>
  </n-collapse>
    </n-drawer-content>
  </n-drawer>

  <!-----prompt设置----->
  <PromptModal ref="promptModal"  v-model:showPromptModal = "state.showPromptModal" :videoKey = "selectedKey"  />

  <context-menu
    v-model:show="state.showMenu"
    :options="state.menuOptions"
    v-if="state.rightMenuList.length > 0" 
  >
    <context-menu-item  v-for="item in state.rightMenuList" :key="item?.label" :label="item.label" @click="rightContextMenuClick(item)"></context-menu-item>
  </context-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

//导入组件
import { ContextMenu, ContextMenuGroup, ContextMenuSeparator, ContextMenuItem } from '@imengyu/vue3-context-menu';
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
  import { ref , h, reactive } from 'vue'
  import { ipcRenderer } from 'electron'
  import { NButton, NInput, NSwitch, NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon, useMessage, useModal, NModal, NCard, NCheckboxGroup, NCheckbox } from 'naive-ui';
  import {  
    VideocamOutline as BookIcon
} from '@vicons/ionicons5'
  import PromptModal from "./components/prompt-modal.vue"
  import { get, all, run } from '../../sqlite3';
  import { GoogleGenerativeAI } from "@google/generative-ai"
  import { createQrCode, checkLogin, upload } from '@/utils/request';
  import { useStorage } from "@vueuse/core";
  import { getUserSelf } from '../../utils/request';
  import { MdEditor } from 'md-editor-v3';
  import 'md-editor-v3/lib/style.css';
  import packageInfo from '../../../package.json';

  const version = ref("")
  version.value = packageInfo.version
  
  const cacheState: any = useStorage("token", {});

  const submitCallback = async() => {
    console.log(state.checkImageList, "checkImageList");
    state.checkImageList.forEach(async(item: any) => {
      const data = state.imageList.find(a => a.file === item);
      const response =  await upload(data.base64);
      console.log(response, "response-----res")
      if(response.status == 200 && response?.data.code == 0) {
        target.value.insert((selectedContent: any) => {
          const imagenode =  `![](${response.data.data})`;
          return {
            // 要插入的文本
            targetValue: `${selectedContent}\n ${imagenode}`,
            select: true,
            deviationStart: 0,
            deviationEnd: 0
          };
        })

        state.checkImageList = []
      }
      else {
        message.error(`文件${item}文件过大，暂未实现压缩，请选择其他图片`)
        state.showImageModal = true
      }
    })
  }

  const cancelCallback = () => {
    console.log("cancelCallback")
    state.showImageModal = false
  }

  const closeImageModalClick = () => {
    console.log('closeImageModalClick')
    state.showImageModal = false
  }

  const message = useMessage();
  const modal = useModal();

  const showModal =ref(false)
  const active = ref(false)
  const source = ref(null)
  const target = ref<any>(null)
  const intervalId = ref<any>();
  const selectedKey = ref("")

  const formPrompt = ref("")

  const state = reactive({
    rightMenuList: [],
    showMenu: false,
    showImageModal: false,
    showImagePin: false,
    showPromptModal: false,
    imageLoadingText: "正在下载图片，并去除重复图片，请稍后...",
    qrCodeUrl: "",
    sceneStr: "",
    showQrCodeModal: false,
    currentVideoRow: {},
    imageList: [],
    checkImageList: [],
    everyStartTime : "",
    everyEndTime: "",
    loadingText: "",
    menuOptions: {
      zIndex: 3,
      minWidth: 230,
      x: 500,
      y: 200,
      theme: 'mac dark'
    }
  })

  const testApi = async() => {
    const code = "gemini"
    const geminiInfo: any = await get(`select apiKey from OpenAPI where code = ?`, code)
    console.log(geminiInfo, 'geminiInfo')
    const genAI = new GoogleGenerativeAI(geminiInfo.apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = "请使用中文回答我，中国所有的省份，并列举每个省份至少一个好玩的地方"

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text,"response");
  }

  const rightContextMenuClick = async (item: any) => {
    console.log(item, "右键点击菜单时触发的事件")
    if(item.code === "srt2blog") {
      state.showPromptModal = true
    }

    if(item.code === "srt2blogApi") {
      message.error("待实现")
    }

    if(item.code === "getImage") {
      console.log(cacheState, "cacheState")
      if(!cacheState.value?.token) {
        const result = await createQrCode();
        console.log(result, "result")
        if(result.status === 200) {
          state.showQrCodeModal = true
          state.qrCodeUrl = result.data.data.qrCode
          state.sceneStr = result.data.data.sceneStr
          console.log(state.qrCodeUrl, state.sceneStr,"state/qrCodeUrl")
          intervalId.value = setInterval( async() => {
            await checkLoginApi()
          }, 2000);
        }
      } else {
        state.showImageModal = true
      }

      state.imageList = []
      state.showImagePin = true;
      state.imageLoadingText = "正在获取图片，并去除重复图片...";
      ipcRenderer.send('call-image-ffmpeg', state.currentVideoRow.FolderDate, state.everyStartTime, state.everyEndTime, 0);
    }
  }

  const reImage = (muptiple: number) => {
    state.showImagePin = true;
    state.imageLoadingText = "正在加倍去除重复图片...";
    state.imageList = []
    ipcRenderer.send('call-image-ffmpeg', state.currentVideoRow.FolderDate, state.everyStartTime, state.everyEndTime, muptiple);
  }

  const checkLoginApi = async() => {
    if(state.sceneStr) {
      const response = await checkLogin(state.sceneStr)
      if(response.data.data) {
        console.log(response.data.data, 'response.data.data')
        clearInterval(intervalId.value)
        state.showQrCodeModal = false
        state.showImageModal = true
        // useStorage("token", response.data.data);
        cacheState.value = response.data.data;
        const userInfo = await getUserSelf()
        console.log(userInfo, "userSelf")
      }
    }
  }

  /**
   * 
   * @param e 
   * @param type 类型： textarea（左侧文本域）, editor（右侧富文本） 
   */
  const onContextMenu = (e: any, type: string) => {
    if(type === 'textarea') {
      if(outputSource.value) {
          state.rightMenuList = [
            { "label": "字幕内容转换为博文的初始化prompt", code: "srt2blog"},
            { "label": "将字幕内容转换为博客文章", code: "srt2blogApi"},
          ]
      }
    }

    if(type === 'editor') {
      const selectionText = target.value.getSelectedText()

      // /\[(\d{2}:\d{2}:\d{2}\.\d{3}) .* (\d{2}:\d{2}:\d{2}\.\d{3})\]/
      const regExp =   /(\d{2}:\d{2}:\d{2}\.\d{3}) .* (\d{2}:\d{2}:\d{2}\.\d{3})/;
      const match = regExp.exec(selectionText);

      console.log(match, "match");
      if (match) {
          state.everyStartTime = match[1];
          state.everyEndTime = match[2];
          console.log(state.everyStartTime, state.everyEndTime)
      } else {
          return;
      }

      console.log(selectionText, "selectionText")

      state.rightMenuList = [
        { "label": "获取图片", code: "getImage"},
      ]
    }
    e.preventDefault();
    state.menuOptions.x = e.x
    state.menuOptions.y = e.y
    state.showMenu = true
  }

  const saveClick = async() => {
    console.log("保存按钮")

    if(state.currentVideoRow.Id) {
      const updateSql = `
        UPDATE ParsingVideo
        SET SourceSubtitles = $1, TargetSubtitles = $2
        WHERE Id = $3
      `;
     const result = await run(updateSql, [outputSource.value, outputTarget.value, state.currentVideoRow.Id]);
     if(!result) {
      console.log(result, "result")
      message.success("保存成功")
     }
    } else {
      message.warning("请先选择要编辑的视频")    
    }
  }
    
  const setClick = () => {
    active.value = true
    state.showMenu = true
  }  

  const modalClick = async() => {
    await getWhisperModelList()
    showModal.value = true
    modal.create({
      title: '模态框',
      content: '内容',
      preset: 'dialog'
    });
  }


  message.success("欢迎使用aehyok字幕下载器")
  const input = ref("https://twitter.com/i/status/1784184434796949774");

  function renderIcon (icon: any) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const menuOptions = ref<any[]>([]);
  const modelList = ref<any[]>([]);

  const inverted = ref(false)
  const showPin = ref(false)
  const outputSource = ref("")
  const outputTarget = ref("")
  const checkedValue = ref(true)

  const getAll = async(input: string) => {
    menuOptions.value = []

    let env = import.meta.env.MODE

    const rows: any[] = await all("select Id, Title, Path, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath From ParsingVideo where Env = ? order by CreateTime desc", [env]);

    console.log(rows, 'home页面获取数据')
    
    rows.forEach((item: any) => {
      if(input === item.Id) {
        selectedKey.value = item.Id
      }
      const data = {
        key: item.Id,
        label: item.Title,
        icon: renderIcon(BookIcon)
      }
      console.log(data, 'data')
      menuOptions.value.push(data)
      console.log(menuOptions.value, "menuOptions.value")
    })
  }

  const getWhisperModelList = async() => {
    const rows = await all("select Id, Title, Name, Type, Size, IsDownLoad from WhisperModel", []);
    console.log(rows, 'whisperList')
    modelList.value = rows;
  }

  getAll("")
  const onMenuChange = async(key: string, item: any) => {
    console.log("onMenuChange", key, item)
    const row: any = await get(`select * from ParsingVideo where Id = ? and Env = ?`, [key, import.meta.env.MODE]);
    console.log(row, 'row', row.FolderDate)
    outputSource.value = row.SourceSubtitles
    outputTarget.value = row.TargetSubtitles

    state.currentVideoRow = row
  }

  // 点击获取字幕
  const SubtitleClick = async() => {
    //先检查一下url是否为空
    console.log(input.value, 'inputValue')
    if (input.value === "" || input.value === null) {
      message.warning("请输入视频链接")
      return;
    }
    
    const row: any = await get(`select * from ParsingVideo where Path = ? `, input.value);

    console.log(row, "row===row==input")
    if(row && row.Id) {
      console.log(row, 'row-input', row.FolderDate)
      outputSource.value = row.SourceSubtitles
      outputTarget.value = row.TargetSubtitles

      state.currentVideoRow = row
      selectedKey.value = row.Id
    }
    else {
      showPin.value = true
      state.loadingText = "正在下载请稍后..."

      console.log("准备下载");
      ipcRenderer.send('call-yt-dlp', input.value, checkedValue.value)
    }
  }

  // 子进程定义方法
  ipcRenderer.on("call-output", (event: any, isSupport: boolean ,text) => {
    console.log(event, "event-ipcRenderer")
    if(!isSupport) {
      message.warning("不支持的视频链接")
      showPin.value = false
      return;
    }

    if(text === "") {
      message.warning("下载成功，不存在字幕文件")
    }
    outputSource.value = text;
    showPin.value = false;
    getAll(input.value);
  });

  ipcRenderer.on("call-image-ffmpeg-render", (event: any, { file, data }) => {
    // let node = document.getElementById("imageList"); 
    // const img = document.createElement('img');
    // img.src = 'data:image/png;base64,' + data.toString('base64');
    // img.alt = file;
    // img.width = 100;
    // img.height = 100;
    // node.appendChild(img);

    var image = {
      file: file,
      base64: 'data:image/png;base64,' + data.toString('base64'),
      data: data.toString('base64')
    }

    state.imageList.push(image);
    state.showImagePin = false;
  })

  ipcRenderer.on("reply-json", (event: any, text: string) => {
    console.log(text, 'text-text', event)
    outputSource.value = text
  })

</script>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.header {
  padding-left: 20px;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right {
  margin-right: 10px;
  font-size: 12px;
}

.input {
  margin-right: 10px;
  margin-left:5px;
  width: 400px;
  text-align: left;
}

.textarea {
  height:calc(100vh - 120px);
  margin-right: 40px;
  position: relative;
  background-color: #18181c;
}

.render-html{
  height:calc(100vh - 120px);
  position: relative;
  overflow: auto;
}

:deep(.ql-toolbar.ql-snow){
  border: 1px solid #28282c;
}
:deep(.ql-container) {
  border:1px solid grey;
  height:calc(100vh - 165px);
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
  height:calc(100vh - 120px);
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

.download-modal {
  display: flex;
  justify-content: space-between;
}

.font-downloaded {
  color: grey;
}

.font-download {
  color: green;
  cursor: pointer;
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
.modal-center {
  display: flex;
  margin: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
:deep(.n-checkbox .n-checkbox-box .n-checkbox-box__border){
  border: 2px solid #63e2b7;
}

:deep(.ͼ1 .cm-scroller) {
  background-color: #18181c;
}
</style>
