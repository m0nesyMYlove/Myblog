// 本地自托管思源宋体 900(思源宋体为 SIL OFL 1.1 开源协议,自托管合法),
// 替代主题运行时注入的 Google Fonts 外链(渲染阻塞,大陆访问慢时首屏白等)
import '@fontsource/noto-serif-sc/900.css'
import { defineAppSetup } from 'valaxy'

// 主题(valaxy-theme-yun/App.vue)通过 useHead 注入 fonts.googleapis.com 样式表:
// SSG 产物已在 valaxy.config.ts 移除,dev 与客户端水合阶段 unhead 会重新注入,
// 这里用 MutationObserver 持续移除(浏览器偶尔会抢在删除前发起请求,约 31KB,可接受)
function removeGoogleFontLinks() {
  if (typeof document === 'undefined')
    return

  const remove = () => {
    document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(el => el.remove())
  }
  remove()
  new MutationObserver(remove).observe(document.head, { childList: true })
}

export default defineAppSetup(() => {
  removeGoogleFontLinks()
})
