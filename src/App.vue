<template>
  <n-config-provider :theme="darkThem">
    <n-message-provider>
      <router-view></router-view>
  </n-message-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { ref } from "vue"

const darkThem = ref<any>(null)
darkThem.value = darkTheme
</script>