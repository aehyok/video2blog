<template>
  <n-modal
    style="width: 300px;height: 300px"
    :show = "showQrCodeModal" 
    preset="dialog"
    :show-icon="false"
    :title="'墨滴第三方平台扫码登录'"
  >
    <div class="modal-center">
      <img :src="qrCodeUrl" style="width: 200px; height: 200px;" />
      <div style="margin-top: 10px;">本二维码由墨滴平台生成</div>
    </div>
  </n-modal>
</template>
<script setup lang="ts">
  
  defineProps({
    showQrCodeModal: Boolean,
    qrCodeUrl: String
  })
</script>
<style scoped>
  .modal-center {
    display: flex;
    margin: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>