<script lang="ts" setup>
import YunHeader from 'valaxy-theme-yun/components/YunHeader.vue'

// 创建一个新的 <script> 元素，用于加载指定的脚本
const scriptElement = document.createElement('script');
scriptElement.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';

// 将新的 <script> 元素插入到原网页头文件中
document.head.appendChild(scriptElement);
</script>
<YunHeader>
    <!-- 保留原有的 YunHeader 内容 -->
</YunHeader>