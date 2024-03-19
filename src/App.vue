<template>
  <div>
    <input v-model="input" ></input>
    <button @click="callCmd">调用cmd</button>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue'

  const input = ref("");

  const callCmd = () => {
    console.log("渲染进程中的按钮事件message");
    // window.ipcRenderer.send('call-main-cmd', 'message')
    
    window.ipcRenderer.send('exec-python-file', 'message')
  }

  // 子进程定义方法
  window.ipcRenderer.on("exec-child-btn", (event, args) => {
    console.log("子进程接收到主进程的数据",args);
    input.value = args;
    console.log("子进程接收到主进程的数据",input.value);
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
</style>
