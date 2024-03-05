<script lang="ts" setup>
import YunFooter from "valaxy-theme-yun/components/YunFooter.vue";
</script>

<template>
  <YunFooter>
    <VCLiveTime start-time="2021-09-20">
      <template #live-time-before>
        <span>已建站</span>
      </template>
      <template #live-time-after>
      </template>
    </VCLiveTime>
    <script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
  </YunFooter>
</template>

<style>
@media (max-width: 1000px) {
  .va-footer {
    margin-bottom: 125px;
  }
}
</style>