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
        </div>
        <div style="margin-right:25px;"><n-button @click="setClick" size="small" type="info" style="margin-left:10px;">设置</n-button></div>
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
          <n-grid :cols="2" x-gap="12">
            <n-gi>
              <n-input
                v-model:value="outputSource"
                type="textarea"
                class="textarea"
                placeholder="这里是原始字幕..."
              />
            </n-gi>
            <n-gi>
              <n-input
                v-model:value="outputTarget"
                type="textarea"
                class="textarea"
                placeholder="这里是翻译后的字幕..."
              />
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
      《斯通纳》是美国作家约翰·威廉姆斯在 1965 年出版的小说。
    </n-drawer-content>
  </n-drawer>
</template>
<script setup lang="ts">
  import { ref , h } from 'vue'
  import { ipcRenderer } from 'electron'
  import { NButton, NInput, NSwitch, NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon, useMessage, useModal, NModal, NCard } from 'naive-ui'
  import {  
    VideocamOutline as BookIcon
} from '@vicons/ionicons5'
import { get, all } from "../../sqlite3"
  const message = useMessage();
  const modal = useModal();

  const showModal =ref(false)
  const timeout = ref(60000)
  const active = ref(false)

  const countdown = () => {
      if (timeout.value <= 0) {
        showModal.value = false
      } else {
        timeout.value -= 1000
        setTimeout(countdown, 1000)
      }
    }

  const setClick = () => {
    window.alert("alert");
    active.value = true
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
    const rows = await all("select Id, Title, Path, Type, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath From ParsingVideo ", []);

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

  /**
   * 检查url是否有效
   * @param url 
   */
  const isValidURL = (url: string) => {
    // 匹配协议（http或https）://域名.域名后缀/可选路径
    var pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    return pattern.test(url);
  }

  const onMenuChange = async(key: string, item: any) => {
    console.log("onMenuChange", key, item)
    const row: any = await get(`select * from ParsingVideo where Id = ?`, key);
    console.log(row, 'row', row.FolderDate)

    ipcRenderer.send('call-file-json', row.FolderDate)
  }

  // 点击获取字幕
  const SubtitleClick = () => {
    //先检查一下url是否为空
    console.log(input.value, 'inputValue')
    if (input.value === "" || input.value === null) {
      // window.alert("请输入视频链接")
      message.warning("请输入视频链接")
      return;
    } 
    // else  {
    //   const isValid = isValidURL(input.value)
    //   if(!isValid) {
    //     window.alert("请输入正确的视频链接")
    //     return;
    //   }
      show.value = true
      ipcRenderer.send('call-yt-dlp', input.value, checkedValue.value)
  }

  // 子进程定义方法
  ipcRenderer.on("call-output", (event: any, isSupport: boolean ,text) => {
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
}

.list-height {
  margin-top: 30px;
}

:deep(.n-menu .n-menu-item) {
  margin-top: 3px;
}

.menu-border {
  height: calc(100vh - 120px);
  border: 1 solid;
  padding-top: 10px;
  overflow-x: auto; 
}

.menu-sider {
  height:calc(100vh - 120px);
}

.menu-sider:hover {
  background-color: #243737;
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
</style>
