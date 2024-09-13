<template>
  <n-spin :show="showReWrite" :description="loadingText">
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
  </n-spin>
</template>
<script setup lang="ts">
  import { run, get } from '../../../sqlite3';
  import { useMessage, NInput, NModal, NButton, NSpin } from 'naive-ui';
  import { reactive, ref, watchEffect } from 'vue';
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
  const showReWrite = ref<boolean>(false)
  const loadingText = ref<string>("正在重写请稍后......")
  const message = useMessage()
  const state = reactive({
    model: "",
    baseUrl: "",
    apiKey: ""
  })

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
      }
  }

  const getApiModel = async() => {
    const aiApi: any = await get(`select * from OpenAPI where IsDefault = 1`, [])
    console.log(aiApi, "AiApi------------")
    state.model = aiApi?.Model
    state.baseUrl = aiApi?.BaseUrl
    state.apiKey = aiApi?.ApiKey
  }

  const rewriteClick = async() => {
    showReWrite.value = true
    await getApiModel();
    const client = new OpenAI({
      apiKey: state.apiKey,
      dangerouslyAllowBrowser: true,
      baseURL: state.baseUrl,
    });


    const content = `${formPrompt.value} \n
                      内容如下：\n
                      ---------------------\n
                      ${props.selectInput}  \n
    ------------------------------` 
    console.log("rewriteClick")
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: content }],
      model: state.model,
    });
    console.log(chatCompletion, "chatCompletion")
    reWriteContent.value = chatCompletion.choices[0].message.content as string;
    showReWrite.value = false
  }

  const submitPromptCallback = () => {
    console.log("submitPromptCallback")
  }

  const replacePromptCallback = () => {
    emit("update:showAIModal", false);

    (props.target as any).insert((selectedContent: any) => {
        console.log(selectedContent, "selectedContent")
        const content =  `${reWriteContent.value}`;

        console.log(content, "content")
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
