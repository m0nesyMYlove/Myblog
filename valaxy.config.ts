import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

import { webfontDownload } from 'vite-plugin-webfont-dl'

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
        name: '我的小伙伴们',
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
      url: 'https://politian.cn/image/bgimage.webp',	// 白日模式背景
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
    plugins: [webfontDownload()],
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
        api: 'https://api.injahow.cn/meting/api?server=:server&type=:type&id=:id&r=:r',
      }
    }),

  ],

  // 新增 markdown 配置，禁用异步高亮
  markdown: {
    markdownItOptions: {
      highlight: (str: string, lang: string) => {
        return `<pre><code>${str}</code></pre>`
      }
    }
  }

})
