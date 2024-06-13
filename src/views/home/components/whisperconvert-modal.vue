<template>
  <n-modal
  style="width: 600px;"
  :show = "showWhisperConvertModal" 
  preset="dialog"
  :show-icon="false"
  @close="cancelClick"
  :title="'音视频转字幕文件设置'"
  :mask-closable="false"
  positive-text="确定"
  negative-text="关闭"
  @positive-click="submitClick"
  @negative-click="cancelClick"
>
  <n-form ref="convertFormRef" :model="stateForm" :style="{maxWidth: '600px'}"  label-placement="left">
    <n-form-item
      label="使用Nvidia GPU"
      path="isEnableGPU"
    >
    <n-switch v-model:value="stateForm.isEnableGPU" />
    </n-form-item>
    <n-form-item
      label="选择模型"
      path="name"
      :rule="{
        required: true,
        message: '请选择模型',
        trigger: ['input', 'blur']
      }"
    >
      <n-select
        v-model:value="stateForm.selectModel"
        placeholder="请选择模型"
        :options="generalOptions"
      />
    </n-form-item>
</n-form>
</n-modal>
</template>
<script setup lang="ts">
import { run, get } from '../../../sqlite3';
import { useMessage, NModal, NForm, NFormItem, NSelect, NSwitch } from 'naive-ui';
import { ref, watchEffect, reactive } from 'vue';

defineProps({
  showWhisperConvertModal: Boolean,
  videoKey: String
})

const emit = defineEmits(["update:showWhisperConvertModal"]);

const stateForm = reactive({
      isEnableGPU: false,
      selectModel: ""
    })

const generalOptions = ['groode', 'veli good', 'emazing', 'lidiculous'].map(
        (v) => ({
          label: v,
          value: v
        })
      );
const formPrompt = ref<string>("")
const message = useMessage()
const submitClick = async() => {
  message.warning("待实现")
  emit("update:showWhisperConvertModal", false)
}

const cancelClick = () => {
  console.log("cancelPromptCallback")
  emit("update:showWhisperConvertModal", false)
}

watchEffect( async() => {
})

</script>
