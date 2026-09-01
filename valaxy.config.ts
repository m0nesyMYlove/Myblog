import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

import { addonMeting } from 'valaxy-addon-meting'
import { addonWaline } from 'valaxy-addon-waline'

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

    // 顶栏图标按钮(Nimbo 布局):来自 themeConfig.nav,pages 只渲染进侧边栏不进顶栏
    nav: [
      {
        // 主题内置 key,locales 自动给出「博客文章/Posts」
        text: 'menu.posts',
        link: '/posts/',
        icon: 'i-ri-article-line',
      },
      {
        text: '$locale:nav.friends',
        link: '/links/',
        icon: 'i-ri-links-line',
      },
      {
        text: '$locale:nav.about',
        link: '/about/',
        icon: 'i-ri-user-line',
      },
    ],

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
      // 3) 全部页面注入背景图 preload：其 URL 由主题水合后才写入 CSS 变量,
      //    SSG HTML/CSS 中无引用,不 preload 则要等 JS 执行完才开始下载
      // 4) 仅首页额外注入：头像 preload(SSG HTML 无 <img>,它是 LCP 元素)
      //    与一言 API preconnect
      onPageRendered: (route, html) =>
        html
          .replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/gi, '')
          .replace(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/gi, '')
          .replace(
            /<head>/i,
            '<head>'
            + '<link rel="preload" href="/image/bgimage.webp" as="image">'
            + (route === '/' || route === '/index.html'
              ? '<link rel="preload" href="/image/myavatar.webp" as="image" fetchpriority="high"><link rel="preconnect" href="https://v1.hitokoto.cn" crossorigin>'
              : ''),
          ),
    },
  },

  components: {
      exclude:[
        /[\\/]\.git[\\/]/,
        /[\\/]\.exclude[\\/]/,
      ],
    },

  addons: [

    addonWaline({
      // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
      serverURL: 'comment.politian.cn',
      comment:true,
      wordLimit:1000,
      login:'force',
      imageUploader:false,
      texRenderer:false,
    }),

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
