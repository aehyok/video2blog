import { ipcRenderer } from "electron";
import { connect, get, run } from "./sqlite3";
import { createApp } from "vue";
import naive from "naive-ui";
import "./style.css";
import App from "./App.vue";
import router from "./router";

let database: any = undefined;

/**
 * 获取主进程中sqlite3数据库的本地路径
 */
ipcRenderer.invoke("local-sqlite3-db").then(async (dbPath) => {
  database = await connect(dbPath);
  console.log(dbPath, "渲染进程获取到数据库路径");
  // getSqlite3(dbPath).then((db) => {
  //   console.log(db, "渲染进程获取到数据库");
  //   window.database = db;
  //   // db.serialize(() => {
  //   //   db.each("SELECT id, name, age FROM user", (err, row: any) => {
  //   //       console.log(row.id + ": " + row.name + " - " + row.age);
  //   //   });
  //   // });
  // });
});

// Remove Preload scripts loading
const app = createApp(App);
app.use(naive);
app.use(router);
app.mount("#app").$nextTick(() => {
  // Remove Preload scripts loading
  postMessage({ payload: "removeLoading" }, "*");

  // Use contextBridge
  ipcRenderer.on("main-process-message", (_event, message) => {
    console.log(message);
  });
});
