<template>
  <n-spin :show="show" description="正在下载请稍后......">
    <n-layout>
      <n-layout-header class="header">
        <n-input type="text" v-model:value="input" class="input" placeholder="请输入视频地址"></n-input>
        <n-switch v-model:value="checkedValue"/>
          <span class="right">同时下载视频</span>
        <n-button @click="SubtitleClick" type="primary">获取视频字幕文件</n-button>
      </n-layout-header>
      <n-layout has-sider>
        <n-layout-sider
          show-trigger
          collapse-mode="width"
          :collapsed-width="80"
          :width="240"
          :native-scrollbar="false"
          :inverted="inverted"
          class="menu-sider"
        >
        <n-menu
          :inverted="inverted"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          class="menu-border"
        />
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;">
          <n-input
          v-model:value="outputSource"
          type="textarea"
          class="textarea"
          placeholder="基本的 Textarea"
        />
        <n-input
          v-model:value="outputTarget"
          type="textarea"
          class="textarea"
          placeholder="基本的 Textarea"
        />
        </n-layout-content>
      </n-layout>
      <n-layout-footer :inverted="inverted" bordered class="footer">
          Powered by aehyok v0.0.1 Copyright © 2024 -  All right reserved.
      </n-layout-footer>
    </n-layout>
  </n-spin>
</template>
<script setup lang="ts">
  import { ref , h } from 'vue'
  import { ipcRenderer } from 'electron'
  import { NButton, NInput, NSwitch, NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon } from 'naive-ui'
  import {
    VideocamOutline as BookIcon
} from '@vicons/ionicons5'

  const input = ref("https://youtu.be/dIyQl99oxlg?si=fwfuC2lLkxG_Fgpd");

  function renderIcon (icon: any) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const menuOptions = ref<any[]>([]);

  const inverted = ref(false)
  const show = ref(false)
  const outputSource= ref("")
  const outputTarget = ref("")
  const checkedValue = ref(false)

  // get获取单条记录
  // window.database.get 

  // 获取的是一个数组
  // window.database.all

  window.database.all("select Id, Title, Path, Type, SourceSubtitles, TargetSubtitles, CreateTime, LocationVideoPath From ParsingVideo ", (err: any, rows: any) => {
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
  })

  const callCmd = () => {
    console.log("渲染进程中的按钮事件message");
    // window.ipcRenderer.send('call-main-cmd', 'message')
    
    ipcRenderer.send('call-yt-dlp', 'message')
  }

  /**
   * 检查url是否有效
   * @param url 
   */
  const isValidURL = (url: string) => {
    // 匹配协议（http或https）://域名.域名后缀/可选路径
    var pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    return pattern.test(url);
  }

  // 点击获取字幕
  const SubtitleClick = () => {
    //先检查一下url是否为空
    console.log(input.value, 'inputValue')
    if (input.value === "" || input.value === null) {
      window.alert("请输入视频链接")
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
  ipcRenderer.on("call-output", (event:any, args) => {
    console.log(event,  "回调");
    console.log("子进程接收到主进程的数据",args);
    outputSource.value = args;
    show.value = false;
    console.log("子进程接收到主进程的数据",outputSource.value);
  });
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
}

.right {
  margin-right: 20px;
  font-size: 12px;
}

.input {
  margin-right: 20px;
  width: 400px;
  text-align: left;
}

.container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

.textarea {
  height:calc(100vh - 120px);
  width: 45%;
  margin-right: 40px;
}

.list-height {
  margin-top: 30px;
}

:deep(.n-menu .n-menu-item) {
  margin-top: 3px;
}

.menu-border {
  border: 1px solid #f0f0f0;
  height: calc(100vh - 120px);
}

.menu-sider {
  height:calc(100vh - 70px);
  padding-top: 25px; 
  padding-left: 20px;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 2px;
}
</style>
