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
      </div>
      <n-scrollbar style="max-height: 500px; margin-top: 20px;margin-left:10px;">
        <n-checkbox-group v-model:value="state.checkImageList">
          <n-grid x-gap="12" y-gap="12" :cols="3">
            <n-gi v-for="item in state.imageList" :key="item.file" style="height: 100px; position: relative;" >
              <n-image :src="item.base64" :alt="item.file" style="height: 100%; border-radius: 5px;"  />
              <n-checkbox :value="item.file" style="position: absolute; top: 4px; right: 28px; z-index: 1;"  />
              <div style="position: absolute; bottom: 4px; left: 8px; z-index: 1; font-size: 10px;">{{item.file}}</div>
              <div style="position: absolute; bottom: 4px; right: 28px; z-index: 1;font-size: 10px;" >{{item.size}}</div>
            </n-gi>
          </n-grid>
      </n-checkbox-group>
      </n-scrollbar>
    </n-spin>
    <template #action>
      <div style="display: flex; justify-content: space-between;width: 100%; ">
        <div style="display: flex; gap: 10px;">
          <n-button @click="compressClick()" type="warning">压缩图片</n-button>
        </div>
        <div></div>
        <div style="display: flex; gap: 10px;">
          <n-button @click="cancelClick()" type="info">取消</n-button>
          <n-button @click="submitClick()" type="primary">确定</n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
  import { useMessage, NButton, NImage, NCheckbox, NGi, NGrid, NCheckboxGroup, NSpin, NModal, NScrollbar } from "naive-ui"
  import { reactive, toRaw, watchEffect } from 'vue';
  import { upload } from '@/utils/request';
  import { ipcRenderer } from 'electron'

  const props = defineProps({
    showImageModal: Boolean,
    target: Object,
    videoData: Object,
    everyStartTime: String,
    everyEndTime: String
  })

  const emit = defineEmits(["update:showImageModal", "resetToken"]);
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
        if(response.status == 200 && response.data.code == 70004) {
          message.error("mdnice.com:"+response.data.message+",即将重新扫码登录")
          emit("resetToken");
        }
        else {
          message.error("上传失败")
        }
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
    if(state.checkImageList.length === 0) {
      message.warning("请选择要压缩的图片")
      return
    }
    let current = props.videoData as any;
    state.showImagePin = true;
    state.imageLoadingText = "正在压缩图片，并去除压缩前的图片...";
    ipcRenderer.send('call-image-compress', current.FolderDate, props.everyStartTime, toRaw(state.checkImageList));
  }

  watchEffect(() => {
    if(!props.showImageModal) {
      return
    }
    refreshImageList();
  })

  const refreshImageList = () => {
    state.imageList = []
    state.checkImageList = []
    state.showImagePin = true;
    state.imageLoadingText = "正在获取图片，并去除重复图片...";
    const current: any = props.videoData;
    console.log(current, "点击图片列表弹窗时的视频数据传递")
    console.log(props.everyStartTime, props.everyEndTime, "点击图片列表弹窗时的时间段")
    ipcRenderer.send('call-image-ffmpeg', current.FolderDate, props.everyStartTime, props.everyEndTime, 0);
  }

  ipcRenderer.on("reply-image-compress", (event: any) => {
    setTimeout(() => {
      message.success("图片压缩成功")
      refreshImageList();
    }, 2000);
  }) 

  ipcRenderer.on("call-image-ffmpeg-render", (event: any, { size , file, data }) => {
    let newSize = (size/1024/1024).toFixed(2);
    var image = {
      size: `${newSize}MB`,
      file: file,
      base64: 'data:image/png;base64,' + data.toString('base64'),
      data: data.toString('base64')
    }

    console.log(image, "fileSIze")
    state.imageList.push(image);
    state.imageList.sort((a: any, b: any) => {
        let numA = parseInt(a.file.split('.')[0], 10);
        let numB = parseInt(b.file.split('.')[0], 10);
        return numA - numB;
    });
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