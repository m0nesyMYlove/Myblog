import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

import { addonMeting } from 'valaxy-addon-meting'
import { addonWaline } from 'valaxy-addon-waline'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '抹月批风的小站',
      cloud: {
        enable: true,
      },
    },

    pages: [
      {
        // $locale: 前缀 = 走 i18n 翻译,文案在 locales/{en,zh-CN}.yml 的 nav.friends
        name: '$locale:nav.friends',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
      /*{
        name: '喜欢的女孩子',
        url: '/girls/',
        icon: 'i-ri-women-line',
        color: 'hotpink',
      },*/
    ],

    bg_image: {
      enable: true,
      url: '/image/bgimage.webp',	// 白日模式背景(文件在 public/image/,同源加载比跨域快)
      dark: '/image/bgimage.webp',	// 黑夜模式背景(不配置则黑夜显示主题默认渐变)
      opacity: 0.4
    },

    footer: {
      since: 2024,
      beian: {
        enable: false,
        icp: '苏ICP备17038157号',
      },
    },
  },

  vite: {
    ssgOptions: {
      // 预渲染产物清理：
      // 1) 移除主题注入的 Google Fonts 外链(字体已在 setup/main.ts 本地自托管)
      // 2) 移除 valaxy renderPreloadLinks 对产物内全部字体文件的 preload——
      //    否则每次首访会无视 unicode-range 一次性下载 ~200 个字体分片(约 10MB),
      //    去掉后浏览器按 CSS 中实际用到的字形分片按需加载
      // 3) 仅首页注入两条加载提示：
      //    - preload 头像(LCP 元素)：主题将 banner 包在 <ClientOnly> 中,头像还要等
      //      bannerAnimationDone 才挂载,SSG HTML 里没有 <img>,浏览器要等 JS 水合
      //      后才开始下载,低速网络下产生 ~1.8s 的 LCP 资源加载延迟
      //    - preconnect 一言 API(原先由 setup/preconnect.js 运行时注入,时机太晚
      //      已无意义;crossorigin 使 CORS fetch 可复用预建连接)
      onPageRendered: (route, html) =>
        html
          .replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/gi, '')
          .replace(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/gi, '')
          .replace(
            /<head>/i,
            route === '/' || route === '/index.html'
              ? '<head><link rel="preload" href="/image/myavatar.webp" as="image" fetchpriority="high"><link rel="preconnect" href="https://v1.hitokoto.cn" crossorigin>'
              : '<head>',
          ),
    },
  },

  unocss: { safelist },

  components: {
      // 排除不需要自动注册的目录或组件
      exclude:[
        /[\\/]\.git[\\/]/,
        /[\\/]\.exclude[\\/]/, // 排除 .exclude 文件夹
        // 您可以添加其他需要排除的正则表达式规则
      ],
    },

  addons: [

    // 设置 valaxy-addon-waline 配置项
    addonWaline({
      // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
      serverURL: 'comment.politian.cn',
      comment:true,
      wordLimit:1000,
      login:'force',
      imageUploader:false,
      texRenderer:false,
    }),

    // 设置 valaxy-addon-meting 播放器配置项
    addonMeting({
      // 设为 `global: true` 可在每个页面显示固定播放器
      global: false,
      props: {
        id: '611346528',
        server: 'netease',
        type: 'playlist',
        api: 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r',
      }
    }),

  ],

})
