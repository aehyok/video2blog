<template>
  <n-config-provider :theme="darkThem">
    <n-message-provider>
      <n-dialog-provider>
        <n-modal-provider>
          <router-view></router-view>
        </n-modal-provider>
    </n-dialog-provider>
  </n-message-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { darkTheme, NConfigProvider, NMessageProvider, NDialogProvider, NModalProvider } from 'naive-ui'
import { ref } from "vue"

const darkThem = ref<any>(null)
darkThem.value = darkTheme
</script>