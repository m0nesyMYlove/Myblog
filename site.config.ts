import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://politian.cn/',
  lang: 'zh-CN',
  title: '抹月批风的小站',
  author: {
    name: 'Politian',
    link: "https://politian.cn/",
    avatar: "/image/myavatar.webp",
    status: {
      emoji: '😮',
      message: 'Oh~ My god~',
    },
  },

  description: '正在尝试博客。',
  subtitle: "Try to do something.",

  social: [
    {
      name: 'GitHub',
      link: 'https://github.com/m0nesyMYlove',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '网易云音乐',
      link: 'https://music.163.com/user/home?id=427248802',
      icon: 'i-ri-netease-cloud-music-line',
      color: '#C20C0C',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/27159189',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
  ],

  sponsor: {
    enable: false,
  },

  cdn: {
    prefix: 'https://fastly.jsdelivr.net/npm/',
  },

  search: {
    enable: true,
  },

  encrypt: {
    enable: true,
  },

  comment: {
    enable: true,
  },

})
