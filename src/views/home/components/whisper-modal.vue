<template>
    <n-modal 
      :show="showWhisperModal"    
      style="width: 700px;"  
      title="whisper模型设置"
      preset="dialog"
      :show-icon="false"
      :mask-closable="false"
      positive-text="确定"
      negative-text="关闭"
      @close="cancelClick"
      @positive-click="submitClick"
      @negative-click="cancelClick"
      >
      <n-grid :cols="2" x-gap="24" style="margin-left:10px;">
        <n-gi>多语言通用模型:</n-gi>
        <n-gi>英语专用模型:</n-gi>
      </n-grid>

      <n-grid :cols="2" x-gap="24">
        <n-gi v-for="item in modelList" border>
          <div style="border: 1px solid grey; border-radius: 6px; padding:10px;margin: 10px;">
            <div style="font-size: 18px; ">{{ item.Title }}</div>
            <div class="download-modal">
              <div style="display: flex; align-items: center; justify-content: center;">
                <div style="color:gray;">{{ item.Name }}</div>
                <div style="color: red;" ><span style="font-size: 10px;">&nbsp;&nbsp;({{ item.Size }})</span></div>
              </div>
              <div :class="item.IsDownLoad? 'font-downloaded': 'font-download'" @click="downloadModelClick(item)">{{ item.IsDownLoad ? '已下载': '下载模型' }}</div>
            </div>
          </div>
        </n-gi>
      </n-grid>
  </n-modal>
</template>
<script setup lang="ts">
  import { useMessage, NModal, NGrid, NGi } from "naive-ui";
import { all } from "../../../sqlite3"
  import { ref } from "vue"
  const props = defineProps({
    showWhisperModal: Boolean,
  })

  const message = useMessage()
  const emit = defineEmits(["update:showWhisperModal"])

  const modelList = ref<any>([])

  const getWhisperModelList = async() => {
    const rows = await all("select Id, Title, Name, Type, Size, IsDownLoad from WhisperModel order by `Order` ", []);
    console.log(rows, 'whisperList')
    modelList.value = rows;
  }

  const submitClick = () => {
    console.log("submitCallback")
    emit("update:showWhisperModal", false)
  }

  const cancelClick = () => {
    console.log("cancelCallback")
    emit("update:showWhisperModal", false)
  }

  
  const downloadModelClick = (item: any) => {
    console.log(item, "downloadModelClick")
    if(!item.IsDownLoad) {
      message.warning("待实现")
    }
  }

  getWhisperModelList()
</script>
<style scoped>
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
.small-text {
  font-size: 10px;
}
</style>