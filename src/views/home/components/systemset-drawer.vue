<template>
    <n-drawer :show="showActive" :width="502" :placement="'right'">
    <n-drawer-content title="系统设置">
      <p style="color: #bbee53; font-size: 16px;">One-Api平台对接：https://github.com/songquanpeng/one-api</p>
      <n-table :bordered="false" :single-line="false">
        <thead>
        <tr>
          <th>model</th>
          <th>baseURL</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in state.openApiList ">
          <td>{{ item.Model }}</td>
          <td>{{ item.BaseUrl }}</td>
          <td>
            <NButton size="tiny" :type="item.IsDefault ==1 ? 'primary': 'warning'">
              {{ item.IsDefault ==1 ? "启用": "禁用" }}
            </NButton>
          </td>
          <td>
            <NButton type="tertiary" size="tiny" @click="editOpenApiClick(item)">编辑</NButton>
            <NButton size="tiny" type="tertiary" @click="changeStatus(item)" >{{item.IsDefault == 1 ? "禁用" : "启用"}}</NButton>
          </td>
        </tr>
        </tbody>
      </n-table>
      <div style="display: flex; justify-content: flex-end; margin: 20px;">
        <NButton style="margin-right: 20px" type="primary" size="tiny" color="#bbee53" @click="addOpenApiClick">新增</NButton>
      </div>
      <n-form v-if="showForm" ref="formRef" label-placement="top" :model="dynamicForm" :style="{ maxWidth: '440px' }">
        <n-form-item
            label="model"
            path="model"
            :rule="{
                required: true,
                message: '请输入model',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.model" placeholder="请输入model" clearable />
        </n-form-item>
        <n-form-item
            label="baseUrl"
            path="baseUrl"
            :rule="{
                required: true,
                message: '请输入baseUrl',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.baseUrl" placeholder="请输入baseUrl" clearable />
        </n-form-item>
        <n-form-item
            label="apiKey"
            path="apiKey"
            :rule="{
                required: true,
                message: '请输入apiKey',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.apiKey" placeholder="请输入apiKey"  clearable />
        </n-form-item>
        <n-form-item
            label="remark"
            path="remark"
            :rule="{
                required: false,
                message: '请输入remark',
                trigger: ['input', 'blur'],
              }"
        >
          <n-input v-model:value="dynamicForm.remark" placeholder="请输入remark" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button attr-type="button" @click="saveOpenApiClick">
              保存
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-drawer-content>
  </n-drawer>
</template>
<script lang="ts" setup>
import { reactive, ref, toRaw, watchEffect } from 'vue';
import { get, all, run } from "@/sqlite3.ts";
import { 
  useMessage,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NSpace,
  NInput,
  NButton,
  NTable
} from "naive-ui";

const props = defineProps({
  showActive: Boolean,
})

const message = useMessage();
const showForm = ref(false)
const formRef = ref();

const state = reactive<any>({
  openApiList: []
});

const dynamicForm = reactive({
  id: "",
  model: "",
  baseUrl: "",
  apiKey: "",
  remark: "",
  isDefault: 0,
});

const getOpenApiList = async() =>  {
  const rows = await all(
      "select * from OpenAPI",
      []
  );
  console.log(rows, "openapi----")
  state.openApiList = rows;
}

/**
 * 修改状态
 */
const changeStatus = async(item: any) => {
  console.log("item", item);//0变1，启用
    if( item.IsDefault === 0 ) {
      if (state.openApiList.some((openItem: any) => openItem.IsDefault === 1)) {
        message.warning("请先将当前的启用记录[禁用]");
        return;
      }
    }

    const updateSql = `
          UPDATE OpenAPI
          SET IsDefault = $1
          WHERE Id = $2
        `;
    const result = await run(updateSql, [item.IsDefault === 0 ? 1 : 0,item.Id]);
    if(!result) {
      console.log(result, "状态变更成功")
      message.success("状态变更成功")
      await getOpenApiList();
    }
}

/**
 * 编辑
 * @param item
 */
const editOpenApiClick = (item: any) => {
  showForm.value = true;
  dynamicForm.id = item.Id;
  dynamicForm.model = item.Model;
  dynamicForm.remark = item.Remark;
  dynamicForm.apiKey = item.ApiKey;
  dynamicForm.baseUrl = item.BaseUrl;
}

const saveOpenApiClick = async(e: any) => {
  e.preventDefault();

  formRef.value?.validate(async(errors: any) => {
    if (!errors) {

      // 修改
      if(dynamicForm.id) {
        const updateSql = `
          UPDATE OpenAPI
          SET Model = $1, BaseUrl = $2, ApiKey = $3, Remark = $4
          WHERE Id = $5
        `;
        const result = await run(updateSql, [dynamicForm.model, dynamicForm.baseUrl, dynamicForm.apiKey, dynamicForm.remark, dynamicForm.id]);
        if(!result) {
          console.log(result, "修改成功")
          message.success("修改成功")
          setTimeout(() => {
            showForm.value = false;
          }, 500)
        }
      }
      // 新增
      else {
        const insertSql = `insert into OpenAPI (Id, Model, BaseUrl, ApiKey, Remark, IsDefault)
                     values ($Id, $Model, $BaseUrl, $ApiKey, $Remark, $IsDefault)`;
        let data = toRaw(dynamicForm);
        console.log(data, "data---bew")
        const result =  await run(insertSql, {
          $Id: 10,
          $Model: data.model,
          $BaseUrl: data.baseUrl,
          $ApiKey: data.apiKey,
          $Remark: data.remark,
          $IsDefault: 0
        } );
        if(!result) {
          console.log(result, "新增成功")
          message.success("新增成功")
          setTimeout(() => {
            showForm.value = false;
          }, 500)
        }
      }
    }
    else {
      console.log('errors', errors)
    }
  })
}

const addOpenApiClick = () => {
  showForm.value = true;
  dynamicForm.id = "";
  dynamicForm.model = "";
  dynamicForm.remark = "";
  dynamicForm.apiKey = "";
  dynamicForm.baseUrl = "";
}

watchEffect(async() => {
  if(props.showActive) {
    showForm.value = false;
    await getOpenApiList();
    state.showMenu = true;
  }
});
</script>