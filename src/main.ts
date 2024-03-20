import { createApp } from 'vue'
import naive from 'naive-ui'
import './style.css'
import App from './App.vue'

const app = createApp(App);
app.use(naive);
app.mount('#app').$nextTick(() => {
  // Remove Preload scripts loading
  postMessage({ payload: 'removeLoading' }, '*')

  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
