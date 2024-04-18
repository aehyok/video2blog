<template>
  <n-spin :show="show" description="正在下载请稍后......">
    <n-layout>
      <n-layout-header class="header">
        <div>
          <n-input type="text" v-model:value="input" class="input" placeholder="请输入视频地址"></n-input>
          <n-switch v-model:value="checkedValue"/>
          <span class="right">同时下载视频</span>
          <n-button @click="SubtitleClick" size="small" type="primary">获取视频字幕文件</n-button>
          <n-button @click="modalClick" size="small" type="primary" style="margin-left:10px;">下载模型</n-button>
          <n-button @click="testApi" size="small" type="primary" style="margin-left: 10px;">gemini</n-button>
        </div>
        <div style="margin-right:25px;">
          <n-button @click="setClick" size="small" type="info" style="margin-left:10px;">设置</n-button>
          <n-button @click="getHtml" size="small" type="info" style="margin-left:10px;">html</n-button>
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
          @update:value = "onMenuChange"
          class="menu-border"
        />
        </n-layout-sider>
        <n-layout-content content-style="margin-left:20px">
          <n-grid :cols="24" x-gap="12">
            <n-gi :span="8">
              <n-input
                v-model:value="outputSource"
                type="textarea"
                ref="source"
                class="textarea"
                placeholder="这里是原始字幕..."
                @contextmenu="onContextMenu($event,'textarea')"
              >
              </n-input>
            </n-gi>
            <n-gi :span="16">
              <!-- <div id="editor" class="editor" @contextmenu="onContextMenu($event,'editor')"></div> -->
              <div>
                <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  :editor="editorRef"
                  :defaultConfig="toolbarConfig"
                  :mode="'simple'"
                />
                <Editor
                  style="height: 500px; overflow-y: hidden;"
                  v-model="valueHtml"
                  :defaultConfig="editorConfig"
                  :mode="'simple'"
                  @contextmenu="onContextMenu($event,'editor')"
                  @onCreated="handleCreated"
                />
              </div>
            </n-gi>
          </n-grid>
        </n-layout-content>
      </n-layout>
      <n-layout-footer :inverted="inverted" bordered class="footer">
          Powered by aehyok v0.0.1 Copyright © 2024 -  All right reserved.
      </n-layout-footer>
    </n-layout>
  </n-spin>
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

  <context-menu
    v-model:show="state.showMenu"
    :options="state.menuOptions"
  >
    <context-menu-item v-for="item in state.rightMenuList" :key="item?.label" :label="item.label"></context-menu-item>
  </context-menu>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

//导入组件
import { ContextMenu, ContextMenuGroup, ContextMenuSeparator, ContextMenuItem } from '@imengyu/vue3-context-menu';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
export default defineComponent({
  //注册组件
  components: {
    ContextMenu,
    ContextMenuGroup,
    ContextMenuSeparator,
    ContextMenuItem,
    Editor, 
    Toolbar
  },
  //省略其他代码
});
</script>
<script setup lang="ts">
  import { ref , h, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue'
  import { ipcRenderer } from 'electron'
  import { NButton, NInput, NSwitch, NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon, useMessage, useModal, NModal, NCard } from 'naive-ui';
  import {  
    VideocamOutline as BookIcon
} from '@vicons/ionicons5'

  import { get, all } from "../../sqlite3"
  import { GoogleGenerativeAI } from "@google/generative-ai"
  import Quill, { QuillOptions } from 'quill';
  import "quill/dist/quill.core.css";
  import "quill/dist/quill.snow.css";

  const options: QuillOptions = {
    debug: 'info',
    modules: {
      toolbar: true,
    },
    placeholder: 'Compose an epic...',
    theme: 'snow'
  };

  const quill = ref<Quill>()

  // 内容 HTML
  const valueHtml = ref('<p>hello</p>')

  onMounted(() => {

    setTimeout(() => {
          valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
    }, 1500)
    // quill.value = new Quill('#editor',options)
  })

  const toolbarConfig = {}
  const editorConfig = { placeholder: '请输入内容...' }

  // 组件销毁时，也及时销毁编辑器
  onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
  })

  const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！
  }

  const message = useMessage();
  const modal = useModal();

  const showModal =ref(false)
  const timeout = ref(60000)
  const active = ref(false)
  const source = ref(null)

  // 编辑器实例，必须用 shallowRef
  const editorRef = shallowRef()
  
  const getHtml = () => {
    // const html = editor.value.getHTML();
    // console.log(html, 'html')
  } 
  const state = reactive({
    rightMenuList: [],
    showMenu: false,
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


  // quill.value?.on("selection-change",(range: any, oldRange: any) => {
  //   if (range && range.length === 0) {
  //     const end = quill.value?.selection.getNativeRange().end;
  //     const node = end.node;
  //     if (node && node.data?.match(/^\uFEFF$/) && !node.nextSibling && end.offset === 0) {
  //       quill.value.setSelection(range.index + 1, 0);
  //     }
  //   }
  // })

  const onClick = () => {

  }

  /**
   * 
   * @param e 
   * @param type 类型： textarea（左侧文本域）, editor（右侧富文本） 
   */
  const onContextMenu = (e: any, type: string) => {
    if(type === 'textarea') {
      state.rightMenuList = [
        { "label": "翻译的prompt设置"},
        { "label": "将当前字幕翻译为英文"},
        { "label": "将当前字幕翻译为中文"}
      ]
    }

    if(type === 'editor') {
      // const selectionText = quill.value?.getSelection()
      // console.log(selectionText, 'selectionText')
      const selectionText = editorRef.value.getSelectionText();

      const regExp =   /\((\d{2}:\d{2}:\d{2}\.\d{3}) .* (\d{2}:\d{2}:\d{2}\.\d{3})\)/;
      const match = regExp.exec(selectionText);
      console.log(match, "match");
      if (match) {
          let firstTime = match[1];
          let endTime = match[2];
          console.log(firstTime, endTime)
      } else {
          return;
      }

      console.log(selectionText, "selectionText")

      state.rightMenuList = [
        { "label": "获取图片"},
      ]
    }
    e.preventDefault();
    state.menuOptions.x = e.x
    state.menuOptions.y = e.y
    state.showMenu = true
  }

  const countdown = () => {
      if (timeout.value <= 0) {
        showModal.value = false
      } else {
        timeout.value -= 1000
        setTimeout(countdown, 1000)
      }
    }

  const setClick = () => {
    active.value = true
    state.showMenu = true
  }  

  const modalClick = async() => {
    await getWhisperModelList()
    showModal.value = true
    countdown()
    modal.create({
      title: '模态框',
      content: '内容',
      preset: 'dialog'
    });
  }


  message.success("欢迎使用aehyok字幕下载器")
  const input = ref("https://youtu.be/dIyQl99oxlg?si=fwfuC2lLkxG_Fgpd");

  function renderIcon (icon: any) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const menuOptions = ref<any[]>([]);
  const modelList = ref<any[]>([]);

  const inverted = ref(false)
  const show = ref(false)
  const outputSource= ref("")
  const outputTarget = ref("")
  const checkedValue = ref(false)

  const getAll = async() => {
    menuOptions.value = []
    const rows: any[] = await all("select Id, Title, Path, Type, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath From ParsingVideo ", []);

    console.log(rows, 'home页面获取数据')
    
    rows.forEach((item: any) => {
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

  getAll()
  const onMenuChange = async(key: string, item: any) => {
    console.log("onMenuChange", key, item)
    const row: any = await get(`select * from ParsingVideo where Id = ?`, key);
    console.log(row, 'row', row.FolderDate)
    outputSource.value = row.SourceSubtitles
    
    if(quill?.value) {
      // quill.value.setText((row.TargetSubtitles))
      // quill.value.setText("hello world \n");
    }

    valueHtml.value = row.TargetSubtitles

    console.log(outputTarget.value, 'outputTarget')
  }

  // 点击获取字幕
  const SubtitleClick = () => {
    //先检查一下url是否为空
    console.log(input.value, 'inputValue')
    if (input.value === "" || input.value === null) {
      message.warning("请输入视频链接")
      return;
    } 
      show.value = true
      ipcRenderer.send('call-yt-dlp', input.value, checkedValue.value)
  }

  // 子进程定义方法
  ipcRenderer.on("call-output", (event: any, isSupport: boolean ,text) => {
    console.log(event, "event-ipcRenderer")
    if(!isSupport) {
      message.warning("不支持的视频链接")
      show.value = false
      return;
    }
    outputSource.value = text;
    show.value = false;
    console.log("子进程接收到主进程的数据",outputSource.value);
    getAll();
  });

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

/* .editor {
  width: 100%;
  height:80%;
} */

.list-height {
  margin-top: 30px;
}

:deep(.n-menu .n-menu-item) {
  margin-top: 3px;
}

.menu-border {
  height: calc(100vh - 320px);
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
</style>
