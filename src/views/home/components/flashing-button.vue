<template>
  <div class="button-container">
    <n-button class="flashing-button" size="small" @click="handleClick">
      {{ buttonText }}
    </n-button>
  </div>
  <SystemSettingDrawer v-model:showActive="showActive" />
</template>

<script setup>
import { ref, defineAsyncComponent, onMounted } from 'vue';
import { NButton } from "naive-ui";
// import  SystemSettingDrawer from "./systemset-drawer.vue"

let SystemSettingDrawer = defineAsyncComponent({
  loader: () => import('./systemset-drawer.vue')
})
onMounted(() => {
  console.log("flashing0button onMouted error")
})
const showActive = ref(false);
const emit = defineEmits("setClick")
const buttonText = ref('设置');

const handleClick = () => {
  console.log('Button clicked!');
  showActive.value = true;
};

</script>

<style scoped>
.button-container {
  position: fixed;
  left: 20px;
  bottom: 4px;
  z-index: 100;
}

.flashing-button {
  font-size: 12px;
  background-color: #4098fc;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  animation: flash 2s infinite alternate;
}

@keyframes flash {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
}
</style>