<script lang="ts" setup>
import YunFooter from "valaxy-theme-yun/components/YunFooter.vue";
import {useScriptTag} from '@vueuse/core'
useScriptTag("https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js")
</script>

<template>
  <YunFooter>
  <div>
    <script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
  </div>
  </YunFooter>
</template>

<style>
@media (max-width: 1000px) {
  .va-footer {
    margin-bottom: 125px;
  }
}
</style>