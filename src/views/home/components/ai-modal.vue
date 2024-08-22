<template>
    <n-modal
      style="width: 1000px;"
      :show = "showAIModal" 
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
      <div>重写后的内容<n-input v-model:value="reWriteContent" type="textarea"  rows="10" placeholder="请点击重写，进行内容重写"/></div>

      <template #action>
      <div style="display: flex; justify-content: space-between;width: 100%; ">
        <div style="display: flex; gap: 10px;">
          <n-button @click="savePromptCallback()" type="primary">保存prompt</n-button>
          <n-button @click="rewriteClick()" type="warning">重写</n-button>
        </div>
        <div></div>
        <div style="display: flex; gap: 10px;">
          <n-button @click="cancelPromptCallback()" type="info">取消</n-button>
          <n-button @click="replacePromptCallback()" type="primary">替换选中的内容</n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
  import { run, get } from '../../../sqlite3';
  import { useMessage, NInput, NModal, NButton } from 'naive-ui';
  import { ref, watchEffect } from 'vue';
  import OpenAI from 'openai';

  // 使用了one-api 统一接口设置
  const props = defineProps({
    showAIModal: Boolean,
    videoKey: String,
    selectCode: String,
    selectInput: String,
    target: Object,
  })

  const emit = defineEmits(["update:showAIModal"]);

  const formPrompt = ref<string>("")
  const reWriteContent = ref<string>("")
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

  const rewriteClick = async() => {
    const client = new OpenAI({
      apiKey: "sk-7Ix1PX44G1cMly5oD02f2a3eD7044f279a78BdB9Ec05B776",
      dangerouslyAllowBrowser: true,
      baseURL: "http://localhost:3000/v1",
    });


    const content = `${formPrompt.value} \n
                      内容如下：\n
                      ---------------------\n
                      ${props.selectInput}  \n
    ------------------------------` 
    console.log("rewriteClick")
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: content }],
      model: 'gemini-1.5-flash',
    });
    console.log(chatCompletion, "chatCompletion")
    reWriteContent.value = chatCompletion.choices[0].message.content;
  }

  const submitPromptCallback = () => {
    console.log("submitPromptCallback")
  }

  const replacePromptCallback = () => {
    emit("update:showAIModal", false)
    
    (props.target as any).insert((selectedContent: any) => {
          const content =  `${reWriteContent.value}`;
          return {
            // 要插入的文本
            targetValue: ` ${content}`,
            select: true,
            deviationStart: 0,
            deviationEnd: 0
          };
        })
  }

  const cancelPromptCallback = () => {
    console.log("cancelPromptCallback")
    emit("update:showAIModal", false)
  }

  watchEffect( async() => {
     if(props.selectInput) {
      const promptInfo: any = await get(`select prompt from PromptList where code = ?`, props.selectCode)
      console.log(promptInfo, "promptInfo-AI")
      formPrompt.value = promptInfo?.Prompt
      reWriteContent.value = ""
     }
  })

</script>
