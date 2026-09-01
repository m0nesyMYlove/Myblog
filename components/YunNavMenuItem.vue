<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// 覆盖主题同名组件(valaxy-theme-yun/components/menu/YunNavMenuItem.vue):
// 菜单项是纯图标链接,缺 aria-label 导致屏幕阅读器/Lighthouse 报
// "链接缺少可识别的名称"。父组件(NimboNavMenu)会传 title,但 valaxy 的
// useValaxyI18n().$t 不翻译普通 key(主题默认导航的 "menu.posts" 因此一直是
// 字面量),这里对传入 title 再走一次 vue-i18n 原生 t;解析失败时 t 原样返回
// 入参,说明 title 已是可读文案(如 $locale: 前缀经主题 $t 翻译的结果),不能再
// 退化为 to 链接路径,只有完全没传 title(如首页图标)才按 to/nav.home 推导
const props = defineProps<{
  icon: string
  to?: string
  title?: string
}>()

const { t } = useI18n()

const label = computed(() => {
  if (props.title)
    return t(props.title)
  return props.to === '/' ? t('nav.home') : props.to || t('nav.home')
})
</script>

<template>
  <AppLink
    class="size-12 inline-flex-center cursor-pointer z-$yun-z-nav-menu text-$va-c-text"
    hover="bg-white/80 dark:bg-black/80 op-100"
    op-80
    :to="to"
    :title="label"
    :aria-label="label"
  >
    <div class="size-6" :class="icon" />
  </AppLink>
</template>
