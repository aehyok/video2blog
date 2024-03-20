<template>
    <div class="container">
      <n-input type="text" v-model:value="input" class="input" placeholder="请输入视频地址"></n-input>
      <n-button @click="SubtitleClick" color="#8a2be2" >获取视频字幕文件</n-button>
    </div>
    <div class="subtitle">
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
    </div>

</template>
<script setup lang="ts">
  import { ref } from 'vue'
  import { NButton, NInput } from 'naive-ui';
  const input = ref("https://youtu.be/dIyQl99oxlg?si=fwfuC2lLkxG_Fgpd");

  const outputSource= ref("")
  const outputTarget = ref("")

  const callCmd = () => {
    console.log("渲染进程中的按钮事件message");
    // window.ipcRenderer.send('call-main-cmd', 'message')
    
    window.ipcRenderer.send('call-yt-dlp', 'message')
  }

  // 点击获取字幕
  const SubtitleClick = () => {
    //先检查一下url是否为空
    console.log(input.value, 'inputValue')
    if (input.value === "" || input.value === null) {
      window.alert("请输入视频链接")
      return;
    }
    window.ipcRenderer.send('call-yt-dlp', input.value)
  }

  // 子进程定义方法
  window.ipcRenderer.on("call-output", (event, args) => {
    console.log("子进程接收到主进程的数据",args);
    outputSource.value = args;
    console.log("子进程接收到主进程的数据",outputSource.value);
    window.alert(args);
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
.input {
  margin-right: 20px;
  width: 400px;
}

.container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}
.textarea{
  height:calc(100vh - 180px);
  width: 50vw;
  text-align: left;
  margin-right: 10px;
}

.subtitle {
  display: flex;
  justify-content: space-between;
}
</style>
