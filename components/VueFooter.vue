<template>
  <YunFooter>
  <div>
    <script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
  </div>
  </YunFooter>
</template>

<script lang="ts" setup>
import YunFooter from "valaxy-theme-yun/components/YunFooter.vue";
import {useScriptTag} from '@vueuse/core'
useScriptTag("https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js")

export default {
  mounted() {
    // 初始化看板娘
    this.initLive2D();
  },
  methods: {
    initLive2D() {
      // 调用外部脚本中的初始化方法
      if (typeof loadlive2d === 'function') {
        loadlive2d('live2d-container', 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js');
      }
    }
  }
};

</script>

<style>
@media (max-width: 1000px) {
  .va-footer {
    margin-bottom: 125px;
  }
}
</style>