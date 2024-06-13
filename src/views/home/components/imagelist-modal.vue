<template>
  <!---区间图片选择------>
  <n-modal 
    style="width:680px;"
    :show = "showImageModal" 
    preset="dialog" 
    :showIcon="false"
    :title="'区间图片选择(' + everyStartTime + '-' +  everyEndTime + ')'" 
    @after-leave="closeImageModalClick"
    positive-text="确定"
    negative-text="关闭"
    @positive-click="submitClick"
    @negative-click="cancelClick"
    @close = "cancelClick"
    >
    <n-spin :show="state.showImagePin" :description="state.imageLoadingText">
      <div style="display: flex; justify-content: flex-end; gap: 20px; align-items: center;">
        <n-button @click="reImage(10)">默认去重</n-button>
        <n-button @click="reImage(20)">加倍去重x1</n-button>
        <n-button @click="reImage(25)">加倍去重x2</n-button>
        <n-button @click="reImage(30)">加倍去重x3</n-button>
        <n-button @click="compressClick()">压缩图片</n-button>
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
</template>
<script setup lang="ts">
  import { useMessage, NButton, NImage, NCheckbox, NGi, NGrid, NCheckboxGroup, NSpin, NModal, NScrollbar } from "naive-ui"
  import { reactive, watchEffect } from 'vue';
  import { upload } from '@/utils/request';
  import { ipcRenderer } from 'electron'

  const props = defineProps({
    showImageModal: Boolean,
    target: Object,
    videoData: Object,
    everyStartTime: String,
    everyEndTime: String,
  })

  const emit = defineEmits(["update:showImageModal"]);
  const message = useMessage();

  const state = reactive<any>({
    imageList: [],
    checkImageList: [],
    showImagePin: false,
    imageLoadingText: "",
  })
  const submitClick = async() => {
    console.log(state.checkImageList, "checkImageList");
    state.checkImageList.forEach(async(item: any) => {
      const data = state.imageList.find((a: any) => a.file === item);
      const response: any =  await upload(data.base64);
      console.log(response, "response-----res")
      if(response.status == 200 && response?.data.code == 0) {
        (props.target as any).insert((selectedContent: any) => {
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
        emit("update:showImageModal", false)
      }
      else {
        message.error(`文件${item}文件过大，暂未实现压缩，请选择其他图片`)
        // state.showImageModal = true
        emit("update:showImageModal", true)
      }
    })
  }

  const cancelClick = () => {
    console.log("cancelCallback")
    // state.showImageModal = false
    emit("update:showImageModal", false)
  }

  const closeImageModalClick = () => {
    console.log('closeImageModalClick')
    // state.showImageModal = false
    emit("update:showImageModal", false)
  }

  const compressClick = () => {
    ipcRenderer.send('call-image-compress');
  }

  watchEffect(() => {
    if(!props.showImageModal) {
      return
    }
    state.imageList = []
    state.checkImageList = []
    state.showImagePin = true;
    state.imageLoadingText = "正在获取图片，并去除重复图片...";
    const current: any = props.videoData;
    console.log(current, "点击图片列表弹窗时的视频数据传递")
    console.log(props.everyStartTime, props.everyEndTime, "点击图片列表弹窗时的时间段")
    ipcRenderer.send('call-image-ffmpeg', current.FolderDate, props.everyStartTime, props.everyEndTime, 0);
  })

  ipcRenderer.on("call-image-ffmpeg-render", (event: any, { file, data }) => {
    var image = {
      file: file,
      base64: 'data:image/png;base64,' + data.toString('base64'),
      data: data.toString('base64')
    }

    state.imageList.push(image);
    state.showImagePin = false;
  })


  const reImage = (muptiple: number) => {
    state.imageList = []
    state.showImagePin = true;
    state.imageLoadingText = "正在加倍去除重复图片...";
    const current: any = props.videoData;
    ipcRenderer.send('call-image-ffmpeg', current.FolderDate, props.everyStartTime, props.everyEndTime, muptiple);
  }

</script>
<style scoped>
:deep(.n-checkbox .n-checkbox-box .n-checkbox-box__border){
  border: 2px solid #63e2b7;
}

:deep(.ͼ1 .cm-scroller) {
  background-color: #18181c;
}
</style>