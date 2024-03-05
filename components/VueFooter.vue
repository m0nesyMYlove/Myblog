<script lang="ts" setup>
import YunFooter from "valaxy-theme-yun/components/YunFooter.vue";
import { useScriptTag } from "valaxy";
</script>

<template>
  <YunFooter>
    useScriptTag("https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js")
  </YunFooter>
</template>

<style>
@media (max-width: 1000px) {
  .va-footer {
    margin-bottom: 125px;
  }
}
</style>