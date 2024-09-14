<template>
    <n-modal
    style="width: 600px;"
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
    <n-input v-model:value="formPrompt" type="textarea"  rows="26"/>
  </n-modal>
</template>
<script setup lang="ts">
  import { get, run } from "@/sqlite3.ts";
  import { useMessage, NInput, NModal } from 'naive-ui';
  import { ref, watchEffect } from 'vue';

  const message = useMessage()

  defineProps({
    showPromptModal: Boolean,
    videoKey: String
  })

  const emit = defineEmits(["update:showPromptModal"]);

  const formPrompt = ref<string>("")
  const submitPromptCallback = async() => {
    const updateSql = `
        UPDATE PromptList
        SET Prompt = $1
        WHERE Code = $2
      `;
     const result = await run(updateSql, [formPrompt.value, "srt2blog"]);
     if(!result) {
      message.success("保存成功")
      emit("update:showPromptModal", false)
     }
  }

  const cancelPromptCallback = () => {
    console.log("cancelPromptCallback")
    emit("update:showPromptModal", false)
  }

  watchEffect( async() => {
    const promptInfo: any = await get(`select prompt from PromptList where code = ?`, "srt2blog")
    console.log(promptInfo, "promptInfo")
    formPrompt.value = promptInfo.Prompt
  })

</script>
