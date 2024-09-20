import { ipcRenderer } from "electron";
import { connect } from "./sqlite3";
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
// import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
// import ContextMenu from '@imengyu/vue3-context-menu'

/**
 * 获取主进程中sqlite3数据库的本地路径
 */
ipcRenderer.invoke("local-sqlite3-db").then(async (dbPath) => {
  await connect(dbPath);
  console.log(dbPath, "渲染进程获取到数据库路径");
});

ipcRenderer.on('main-process-log', (event, args) => {
  console.log("electron主进程事件：", event);
  console.log('electron主进程日志:', ...args);
});

// Remove Preload scripts loading
const app = createApp(App);
app.use(router);
// app.use(ContextMenu);
app.mount("#app")
    // .$nextTick(() => {
  // Remove Preload scripts loading
  // postMessage({ payload: "removeLoading" }, "*");

  // Use contextBridge
  // ipcRenderer.on("main-process-message", (_event, message) => {
  //   console.log(message);
  // });
// });
