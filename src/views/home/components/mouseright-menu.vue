<template>
  <context-menu
    :show="state.showMenu"
    :options="state.menuOptions"
    v-if="state.rightMenuList.length > 0" 
  >
    <context-menu-item  v-for="item in state.rightMenuList" :key="item?.label" :label="item.label" @click="rightContextMenuClick(item)"></context-menu-item>
  </context-menu>
</template>
<script setup lang="ts">
  import { useStorage } from "@vueuse/core";
  
  const cacheState: any = useStorage("token", {});
  
  const props = defineProps({
    showMenu: Boolean,
    rightMenuList: Array,
  })

  const rightContextMenuClick = async (item: any) => {
    console.log(item, "右键点击菜单时触发的事件")
    if(item.code === "srt2blog") {
      state.showPromptModal = true
    }

    if(item.code === "srt2blogApi") {
      message.error("待实现")
    }

    if(item.code === "getImage") {
      console.log(cacheState, "cacheState")
      if(!cacheState.value?.token) {
        const result = await createQrCode();
        console.log(result, "result")
        if(result.status === 200) {
          state.showQrCodeModal = true
          state.qrCodeUrl = result.data.data.qrCode
          state.sceneStr = result.data.data.sceneStr
          console.log(state.qrCodeUrl, state.sceneStr,"state/qrCodeUrl")
          intervalId.value = setInterval( async() => {
            await checkLoginApi()
          }, 2000);
        }
      } else {
        state.showImageModal = true
      }
    }
  }
</script>