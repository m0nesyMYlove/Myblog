<script lang="ts" setup>
import YunFooter from "valaxy-theme-yun/components/YunFooter.vue";
</script>

<template>
  <YunFooter>
    useScriptTag("https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js")
    <div>
      <a href="https://icp.gov.moe/?keyword=20230105" target="_blank"
        >萌 ICP 备 20240305 号</a
      >
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