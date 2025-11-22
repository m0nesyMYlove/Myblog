---
title: 博客的评论系统和图库
date: 2024-06-21
updated: 2025-11-22
categories: 学习
tags:
- Valaxy

top: 4

---

## 前言

记录一下这个博客的评论系统和图床是怎么弄的。

## Waline评论系统

Valaxy框架集成了Waline，所以用了这个。

### 数据库设置和服务端部署

请参考官方文档完成[快速上手 | Waline](https://waline.js.org/guide/get-started/)完成 LeanCloud数据库设置和Vercel服务端部署，此处不再赘述。当然你也可以用netlify部署，步骤基本相同。

### 绑定域名
1.  点击顶部的 `Settings` - `Domains` 进入域名配置页
2.  输入需要绑定的域名并点击 `Add`
![绑定域名1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMFaSHFvlCFGPCE7hBry1UEk0EDqJEAAhwNaxsY6RFVJHIVn7ParUcBAAMCAAN3AAM2BA.png)
3. 在cloudflare 处添加新的 `CNAME` 解析记录
![绑定域名2](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMGaSHF0Y1yYSokL4vSq4qGhxKmc_UAAh0NaxsY6RFVryEFBlyhK5oBAAMCAAN3AAM2BA.png)
4. 等待生效，就可以通过自己的域名来访问了
-   评论系统：`example.yourdomain.com`
-   评论管理：`example.yourdomain.com/ui`
5. 生效后请访问`example.yourdomain.com/ui/register`,进行注册。首个注册的人会被设定成管理员。

### 安装到Valaxy框架
在Valaxy框架博客上使用请参考文档[valaxy-addon-waline|valaxy](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-addon-waline/README.md)
在博客本地文件所在位置终端运行
```
npm i valaxy-addon-waline
```
![安装到Valaxy框架1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMHaSHF6MPIN10VQJP1_2JkbWk7zvkAAh4NaxsY6RFVmn_wAAEouq7AAQADAgADdwADNgQ.png)
然后再在valaxy.config.ts文件里写入代码启用
```ts[valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'// [!code ++]

export default defineValaxyConfig({
  // 启用评论，这个comment设置在site.config.ts里也有，在那边启用也行
  siteConfig: {
    comment: {
      enable: true// [!code ++]
    },
  },

  addons: [// [!code ++]
    // 设置 valaxy-addon-waline 配置项// [!code ++]
    addonWaline({// [!code ++]
      serverURL: 'https://your-waline-url',// [!code ++]
    }),// [!code ++]
  ],// [!code ++]
})
```
addonWaline的其他配置项请参考[组件属性|Waline](https://waline.js.org/reference/client/props.html)

### 使用评论管理系统（可选）
Waline的后台在日常使用可能不太简洁直观，Valaxy作者提供了一个静态评论管理后台[kotodama 言灵](https://github.com/YunYouJun/kotodama)

你可以通过以下站点使用它
-   Demo 预览: [https://kotodama.yunyoujun.cn](https://kotodama.yunyoujun.cn/)
-   备用1：[https://kotodama.elpsy.cn](https://kotodama.elpsy.cn/)
-   备用2：[https://kotodama.vercel.app](https://kotodama.vercel.app/)（国内已被污染）

1. 注册
![使用评论管理系统1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMIaSHGHlinbjwd15zPCpOw9j_Tpr8AAh8NaxsY6RFVU-0uJ1tr2hUBAAMCAAN4AAM2BA.png)
2. 登录![使用评论管理系统2](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMJaSHGM05i91vbz8RSoZLro_rACzAAAiANaxsY6RFVcFD9vlrbnWoBAAMCAAN5AAM2BA.png)
3. 使用界面![使用评论管理系统3](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMKaSHGRWOJxk2TIBD95m9-Lp1M0owAAiENaxsY6RFVVvdq7ySxn0UBAAMCAAN3AAM2BA.png)
>此界面只用于评论的增删，用户管理仍然需要去原来的后台，另外如果使用cloudflare重定向的域名可能会出现挂梯子无法访问的情况。

### 评论通知（可选）
可以通过以下教程实现评论区有新评论则自动邮件通知的功能。
1. 在Vercel部署页面的`Settings` - `Environment Variables`进入环境变量配置页，配置以下环境变量

| **配置变量** | **说明** | **是否必填** |
| :--- | :--- | :--- |
| `SMTP_SERVICE` | 你使用的SMTP邮件服务商名称（如QQ、163）。 | 是，与`SMTP_HOST`二选一 |
| `SMTP_HOST` | 如果你的服务商不在预设列表，需填写服务器地址 。 | 是，与`SMTP_SERVICE`二选一 |
| `SMTP_PORT` | SMTP服务器的端口号 。 | 是 |
| `SMTP_USER` | 用于发送邮件的邮箱地址。 | 是 |
| `SMTP_PASS` | 发件邮箱的SMTP授权码/独立密码，未必是邮箱的登录密码。 | 是 |
| `SITE_NAME` | 你的网站名称，会显示在邮件中 。 | 是 |
| `SITE_URL` | 你的网站地址 。 | 是 |
| `AUTHOR_EMAIL` | **博主（你）的邮箱**，用于接收新评论通知 。 | 是 |
>注：`SMTP_USER`（发件邮箱）和`AUTHOR_EMAIL`（收件邮箱）**不要使用同一个邮箱地址**

以163网易邮箱作为发件邮箱为例：
![评论通知1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMLaSHGXLrO_OLhLfFRu_aX38EQkGEAAiINaxsY6RFVdq25nDysawkBAAMCAAN3AAM2BA.png)
![评论通知2](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMMaSHGayLtbaDO_fEPhUijIz6xDmUAAiMNaxsY6RFVE3ZVBvc9EFoBAAMCAAN5AAM2BA.png)
根据页面提示生成一个专用的授权码。请保存这个授权码，因为**它只显示一次**
则案例的环境变量如下配置：
```
SMTP_SERVICE=163
//指定邮件服务商为163邮箱

SMTP_USER=example@163.com
//您的163发件邮箱地址

SMTP_PASS=您的163邮箱授权码

SITE_NAME=您的网站名称
//例如"我的技术博客"，会显示在邮件中

SITE_URL=您的网站地址
//例如"https://example.yourdomain.com"

AUTHOR_EMAIL=example@email.com
//您作为博主接收新评论通知的邮箱，比如谷歌、QQ、163邮箱等

SENDER_NAME=（可选）发件人名称
//可自定义，如不设置会使用默认值

SENDER_EMAIL=（可选）发件地址
//可自定义，如不设置会默认使用`SMTP_USER`
```
修改完环境变量后请记得去vercel重新部署
![评论通知3](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMNaSHGhJZEAQABVsLqyWpYo4C5iasZAAIkDWsbGOkRVQSNiW6nm4kNAQADAgADdwADNgQ.png)
这样你就能在别人评论时收到邮件提示了。

## Talagram-Image图床+Cloudflare Pages 部署
### 为什么需要使用图床
如果把博客的图片都直接放到博客网站上，会占用带宽导致加载变慢；另外，本地图片在博客迁移时可能需要重新上传和引用，非常麻烦，而使用图床则没有这个烦恼；同时，图床也更方便对图片进行统一管理。

我使用的是github上的Talagram-Image项目，部署平台用Cloudflare Pages自动部署。

###  为什么用Talagram-Image
<div>
<Spoiler>
<p>年少不懂事，如果早知道就不会用这个了。</p>
<ul>
<li>1. Talagram把匿名上传api一关我还得重新搞，麻烦死了。</li>
<li>2. 没有上传预压缩</li>
<li>3. 不能批量上传（但是应该可以配合 PicGo 使用）</li>
</ul>
<p>正在计划更换别的图床，这个可能以后拿来当评论区的图床吧...</p>
</Spoiler>
</div>

### 实际操作
进到[Telegraph-Image|Github](https://github.com/cf-pages/Telegraph-Image)项目网页，按照最下面的文档操作
具体操作可以看[【保姆级教程】Cloudflare+telegraph-Image 搭永久免费图床！专属空间无限存，免服务器免域名，一次搞定永久白嫖，上手超简单！| 哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1gc8Ez8Eva/)

1. 先去Telegram上申请机器人获取`Bot_Token`和`Chat_ID`
2. folk 项目仓库
3. 设置相关的环境变量

| **配置变量** | **说明** | **是否必填** |
| :--- | :--- | :--- |
| `TG_Bot_Token` | 从[@BotFather](https://t.me/BotFather)获取的Telegram Bot Token。 | 是 |
| `TG_Chat_ID` | 频道的ID，确保TG Bot是该频道或群组的管理员 | 是 |
| `BASIC_USER` | 后台管理页面登录用户名称 | 否，但如果你不打算用Cloudflare Access保护的话建议设置 |
| `BASIC_PASS` | 后台管理页面登录用户密码 | 否，但如果你不打算用Cloudflare Access保护的话建议设置 |


5. 绑定一下KV命名空间，这样才能在后台删除图片（我看视频里貌似没说，提一嘴）
![实际操作1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMOaSHGoYZk6obULPMp4KmyE4fONOUAAiUNaxsY6RFVtiQ9Tr0i3E4BAAMCAAN3AAM2BA.png)
7. 绑定自定义域名，可以直接用博客的二级域名（类似`example.yourdomain.com`这种）,这样在国内用这个域名可以CDN加速加载更快
![实际操作2](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMPaSHGtLZ4Y5Gy33kC3mq4vGuB56wAAiYNaxsY6RFV37kVRM4uPZIBAAMCAAN3AAM2BA.png)
如果你用的博客域名在cloudflare上DNS记录会自动更改，不然需要你到博客域名的DNS记录上设置一下CNAME
![实际操作3](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMQaSHGxa1DXKoavpy4KA2jMkv0HF4AAigNaxsY6RFVQH9TP02bpg0BAAMCAAN3AAM2BA.png)
8. 设置完变量后记得重新部署这个项目
9. 之后访问你的图床，将图片上传到网页它就会返回一个网址，打开就能看见你上传的图片了，在博客里你只需要按照
```
![自定义图片名](你的图片网址)
```
就能在云端显示这张图片啦！
图床后台管理为`example.yourdomain.com/admin`
>tips:上传图片前建议使用Squoosh 或 TinyPNG 压缩与转换为 WebP格式，避免文件过大加载缓慢

### Cloudflare Access保护（可选）
参考文章：[利用Cloudflare Zero Trust中的Access来对自己的站点或某个页面加上身份认证|Cyorage](https://cyorage.com/20240529/cloudflare_access/)

如果你希望用第三方账号密码来登录你的图床后台可以使用Cloudflare Access保护。
>tips:它会在你访问后台前触发，所以你可以同时使用环境变量和Cloudflare Access保护后台

1. 进入Cloudflare 账户下的Zero Trust页面，选择免费套餐，这里会需要绑定银联卡，如果你没有符合16位卡号的银联卡可以注册PayPal，在PayPal绑定。
![Cloudflare Access保护1](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMRaSHG6g6JuaKIr9ziD6zsS0B-SvUAAioNaxsY6RFVyEY52UDJNbYBAAMCAAN4AAM2BA.png)
2. 完成后它会提供一个团队域，格式大概为：`yourteamname.cloudflareaccess.com`,如果你忘记了可以在`Zero Trust`-`设置`里找到

4.  在`Zero Trust`-`集成`-`标识提供程序`里添加你所需要的第三方软件
![Cloudflare Access保护2](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMSaSHG-dRhpjayC1pSNCeyPoNORN0AAisNaxsY6RFVYRz9YfboPmEBAAMCAAN3AAM2BA.png)
这里以Github为例，应用ID填写`Client ID`，客户端密码填写`Client secrets`
![Cloudflare Access保护3](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMTaSHHCm0FrN-3J-oy-SyCj2PN21wAAiwNaxsY6RFVwefdxNEdaxEBAAMCAAN4AAM2BA.png)
>关于如何获取Github的`Client ID`和`Client secrets`
>
>打开你的Github，点右上角头像-Settings-Developer Settings-OAuth Apps-new OAuth app
>
>Application name 随意；
Homepage URL 填团队域，格式一般为`yourteamname.cloudflareaccess.com`；
Authorization callback URL 填团队域加后缀，格式一般为`yourteamname.cloudflareaccess.com/cdn-cgi/access/callback`
Enable Device Flow 不勾选
>
>之后进入编辑你的OAuth app，记录你的 **Client ID**，点击`Generate a new client secret`,立刻记录你的 **Client secrets**，因为**它只显示一次**


5. 需要在`Zero Trust`-`访问控制`-`应用程序`新建 **两个**应用程序，一个用来保护Cloudflare Pages提供的域名`xx.pages.dev`，另一个用来保护我们的自定义域名。
应用程序名称随意，域分别选择`xx.pages.dev`和`二级域名.博客域名`，路径填写项目文档要求的`admin`和`api/manage/*`![Cloudflare Access保护5](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMUaSHHIXt_SVZTPugPmalOHnWy2nEAAi4NaxsY6RFVoT8xICNqlv0BAAMCAAN3AAM2BA.png)
![Cloudflare Access保护6](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMVaSHHpH_d52TD2pPkNvglTKXsfXQAAjMNaxsY6RFVMVSJgxyQ2UgBAAMCAAN3AAM2BA.png)
>Cloudflare Pages提供的域名我们没设置子域，别手贱填写

策略选择新建策略，策略名称随意，操作选Allow,规则选择选择器Emails，值为你的第三方账号（此处为Github账号）
![Cloudflare Access保护7](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMWaSHHtT3e6yrzTjVC69HfIRspyCgAAjQNaxsY6RFVZDlp_AWlmqgBAAMCAAN3AAM2BA.png)
登录方式勾选Github
![Cloudflare Access保护8](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMXaSHHwr3jC_cr-Aunw7sEWIW0K8oAAjUNaxsY6RFVD2h1M9Ivh3IBAAMCAAN3AAM2BA.png)
最后拉到最下面保存应用程序，这样在访问后台的时候就会要求我们使用Github登录啦！（需要清空浏览器缓存或者无痕模式访问以避免之前验证过）
如果你还在环境变量那里设置了账号密码会在Github登录后再触发一次对应的验证。
![Cloudflare Access保护9](https://image.politian.cn/file/AgACAgUAAyEGAATMIXEFAAMYaSHHzqvJOAMjx_btAbSqv9rcUgQAAjcNaxsY6RFVzpqLlQABQpn6AQADAgADdwADNgQ.png)
