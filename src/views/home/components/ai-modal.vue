<template>
    <n-modal
      style="width: 1000px;"
      :show = "showPromptModal" 
      preset="dialog"
      :show-icon="false"
      @close="cancelPromptCallback"
      :title="'prompt设置'"
      :mask-closable="false"
      positive-text="确定"
      negative-text="关闭"
      @positive-click="submitPromptCallback"
      @negative-click="cancelPromptCallback"
    >
      <div style="display: flex; flex-direction: row;">
        <div style="width: 49%;padding: 10px;">提示词<n-input v-model:value="formPrompt" type="textarea"  rows="10"/>
          </div>
        <div style="width: 49%;padding: 10px;">选中要重写的内容<n-input v-model:value="props.selectInput" type="textarea"  rows="10"/></div>
      </div>
      <div>重写后的内容<n-input v-model:value="formPrompt" type="textarea"  rows="10"/></div>

      <template #action>
      <div style="display: flex; justify-content: space-between;width: 100%; ">
        <div style="display: flex; gap: 10px;">
          <n-button @click="compressClick()" type="warning">重写</n-button>
        </div>
        <div></div>
        <div style="display: flex; gap: 10px;">
          <n-button @click="cancelPromptCallback()" type="info">取消</n-button>
          <n-button @click="savePromptCallback()" type="primary">保存prompt</n-button>
          <n-button @click="submitPromptCallback()" type="primary">替换选中的内容</n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
  import { run, get } from '../../../sqlite3';
  import { useMessage, NInput, NModal, NButton } from 'naive-ui';
  import { ref, watchEffect } from 'vue';

  const props = defineProps({
    showPromptModal: Boolean,
    videoKey: String,
    selectCode: String,
    selectInput: String
  })

  const emit = defineEmits(["update:showPromptModal"]);

  const formPrompt = ref<string>("")
  const message = useMessage()
  const savePromptCallback = async() => {
    const updateSql = `
        UPDATE PromptList
        SET Prompt = $1
        WHERE Code = $2
      `;
     const result = await run(updateSql, [formPrompt.value, props.selectCode]);
     if(!result) {
      console.log(result, "prompt保存成功")
      message.success("保存成功")
      // emit("update:showPromptModal", false)
     }
  }

  const submitPromptCallback = () => {
    console.log("submitPromptCallback")
  }

  const cancelPromptCallback = () => {
    console.log("cancelPromptCallback")
    emit("update:showPromptModal", false)
  }

  watchEffect( async() => {
    const promptInfo: any = await get(`select prompt from PromptList where code = ?`, props.selectCode)
    console.log(promptInfo, "promptInfo")
    formPrompt.value = promptInfo?.Prompt
  })

</script>
