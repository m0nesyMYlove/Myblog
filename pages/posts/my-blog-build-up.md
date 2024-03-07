---
title: 如何创建自己的博客
date: 2024-03-05
updated: 2024-03-05
categories: Valaxy 笔记
tags:
- Valaxy
- Netlify
- Git
- GitHub
- Cloudflare

top: 2

---

## 前言

记录一下自己如何创建这个博客的。因为我是个小白，所以希望后面的小白能够通过这篇少走一点弯路吧。  

使用的个人博客框架是Valaxy，博客文件拖管于github，博客网站用netlify生成，国内访问采用cloudflare进行CDN加速。我个人的系统环境是windows，因此后面的教程**默认系统环境为windows**。

<!-- more -->

##  一切开始前

需要花钱购买域名。

开始后面工作前，建议先在域名服务商注册好账号并且实名认证好信息模板，后面域名解析部分会要求验证实名，这个认证审核需要一段时间（大概半天）。

部分网站需要科学上网。

##  Node.js

跑JavaScript的环境，不下玩不了。

进入官网[Node.js](https://nodejs.cn/)下载**长期支持版**，一路默认进行安装。

安装完后按住win键+R打开cmd，运行以下代码：
```
#检查版本号是否与下载一致
node -v
```
如果一致，那么第一步完成。

## Valaxy框架

>参考[Valaxy手册|开始](https://valaxy.site/guide/getting-started)的内容，右上角可以转中文。以下说明大致流程，如果有什么问题可以看看参考：

### 本地初始化

如果你已经安装了git，就可以在新建文件夹内右键点击打开`Open git bash here`。如果没有安装，windows系统的可以在所创建文件夹的地址栏上,输入`cmd` 并按下回车键打开终端以确保创建本地仓库路径正确。

本地创建，只需要执行以下命令：

```
# 安装pnpm
npm i -g pnpm 

# 创建仓库
pnpm create valaxy
```

然后一路回车下去就能创建成功了。

创建成功后重新在仓库路径打开终端或者git bash,运行代码：
```
# 安装依赖 
pnpm i

# 启动预览
pnpm dev
```

然后用你的服务器打开网址 `http://localhost:4859/`，就可以看到你本地网站的模样啦！如果想也可以后续更换主题（但我感觉能找到的现成主题好像不多）。

###  修改网页信息

在[valaxy|基础配置](https://valaxy.site/guide/config/)可以找到你需要修改的配置信息，对照上面的站点配置修改就行。

博客则存放在*/pages/post处就行。

仔细查询Valaxy的手册应该能解决你大部分问题

## git和github

### git

>此处参考的文章是[搭建个人博客网站|伝](https://mubu.com/doc/5OeZGO2XKgh)，在原文基础上补充部分

git的安装可以去官网[Git - Downloads](https://git-scm.com/download)下载，在Download里找到和自己电脑系统匹配的版本进行下载。

具体的安装事项可以参考这篇文章[Git安装教程(超详细) |[已注销]](https://blog.csdn.net/m0_69680577/article/details/129654393)，未提及到的选项保持默认便好。

安装完之后，按住win键+R打开运行输入cmd，输入代码：
```
git --version
```
出现对应版本号即代表安装成功，后面的命令可以并且建议在Git Bash执行（在上文创建的仓库文件夹目录右击空白处选择 Open Git Bash Here，没有的话就选择 更多选项（win11） ），或者win+R打开运行输入`cmd`，在命令行运行。如果遇到执行不成功的情况，可以尝试用管理员身份运行Git Bash/终端cmd

### github

在你安装完git之后，我们还需要一个github账号。在github网站[https://github.com/](https://github.com/)注册并登录github账号，并创建一个仓库 Create a new repository或者点击网页右上角的 ‘+’ 号进行创建。

>因为我们接下来会通过Netlify进行部署，所以仓库名格式不做要求。如果你之后想通过GitHub Pages部署，就需要把你的仓库按照以下格式命名：/你的GitHub用户名.github.io
创建的时候最好**不要勾选** 创建README文件/Add a README file，否则后续上传仓库时需要先拉取远程仓库，多一事不如少一事。

初始化Git的用户名和邮箱（加--global是为所有git项目设置，不加则是在当前目录的git项目设置）
```
# 初始化用户名（注意user.name/email和英文双引号"之间要有一个空格）
git config --global [user.name] "你的GitHub用户名"

# 初始化邮箱
git config --global user.email "你GitHub的邮箱"

# 确认设置用户名和邮箱成功
git config --global user.name

git config --global user.email
```

下一步是通过ssh密钥与远程仓库连接

1.在**本地cmd**运行以下代码：
```
# 生成密钥,可能要一路回车
ssh-keygen -t rsa -C "你GitHub的邮箱"
```
2.在**Git Bash**运行以下代码：

```
# 获取密钥，然后复制这行命令运行的结果
cat ~/.ssh/id_rsa.pub
```

3.复制完结果后，打开你的[github](http://github.com/)，在右上角的头像下面点击 settings，再点击 SSH and GPG keys，新建一个SSH，名字随便取一个都可以，把你的id_rsa.pub里面的信息复制进去，点击 create/创建 即可完成创建。

4.最后在本地cmd终端运行代码验证连接：
```
# 验证ssh连接是否成功，出现用户名，即代表访问成功
ssh -T git@github.com
```

连接成功之后就可以将你的本地仓库内容推送到远程仓库了，在你所创建网站的文件夹内右键点击`Open git bash here`打开git bash，运行以下代码：
```
# 在本地创建一个 Git 仓库
git init 

# 将当前目录下所有的修改添加到 Git 仓库中,注意add和符号.中间有个空格
git add .  

# 修改提交到 Git 仓库中，并且添加提交信息
git commit -m "随便写点提交信息"

# 将远程仓库的地址添加到本地仓库中，命名为 origin 
git remote add origin "远端github仓库地址"  

# 将本地修改推送到远程仓库分支
git push -u origin main
```
运行成功之后打开你的github仓库就能看见文件内容了，如果提交信息后面有红叉是正常的，之后网站能打开就行。

>建议后续的推送另开一个分支，然后再合并到主分支上去，不然你的commit记录会很难看（强迫症的话）

## Netlify

为了今后实现github仓库改动和博客网站实时自动同步，我们需要一个第三方部署。

Valaxy自带了Netlify的建站脚本，所以用这个挺友善的，而且我也不想花时间重新研究GitHub Pages部署了，如果你想可以参考Valaxy手册的**部署**部分自己部署。

> 前面推送本地仓库的代码以及后面的内容参考的是[个人博客搭建教程|爱扑bug的熊](https://blog.cuijiacai.com/blog-building/)，只说明大致步骤和细节，有问题或者嫌我啰嗦的可以看参考文章（里面有截图）。

### 新建站点
在Team overview主页的网站 Sites标签页下点击添加新网址 add new site，并选择 连接到一个存在的项目/Import an existing project

然后选择你之前创建的github仓库，一切默认，不同的是我们的构建命令是Valaxy自带的`npm run build`

构建完成后我们就能够看到一个URL，打开网址就是我们的个人博客了可以根据提示进行进一步的设置，比如说设置一下二级域名（即`netlify.app`之前的域名）。

## 配置域名

为了使用后面的Cloudflare，我们需要购买一个域名。

### 购买域名

从任意域名服务商处购买一个域名。我是从阿里云买的，所以这里以阿里云为例。输入你想要的域名查询并购买，一般是买.com或者.cn后缀，具体区别可以自行百度。

### 域名解析

购买完进入域名控制台的域名列表，点击对你的域名进行解析，这一步需要通过信息模板实名认证。

然后设置域名解析，类型为`CNAME`，主机记录为`www`,记录值为`xxxxx.netlify.app`，其中`xxxxx`为你自己设置的个性二级域名。

### Netlify的CDN支持

然后，我们还需要回到netlify中配置一下自己的用户域名，这样的话可以在国外获得netlify本身的CDN支持。

在Domain management的Production domains下选择Add custom domain，输入你购买的域名然后一路默认，如果没有显示记录是因为DNS服务器还在同步，等会就好了。

设置一下netlify本身的对于国外CDN的支持。在Production domains下选择每个域名的右边option，然后选择Set up Netlify DNS,后面一路默认。

之后，我们在科学上网的前提下就可以通过自己配置的域名访问自己的个人博客，比如说我的博客地址是[抹月批风的小站 (politian.cn)](https://politian.cn/)。

## Cloudflare加速

用Cloudflare加速后网站可以直接访问。

1.注册[Clouldflare](https://www.cloudflare.com/zh-cn/)并登陆

2.添加站点，输入你所购买的域名并添加

3.选择最下面的免费套餐

4.添加两条DNS 记录，名称分别为`@`和`www`，内容为netlify的域名，类型为CHAME，其他默认

5.接下来Cloudflare会提供一个在线的教程，主要步骤是在你的域名服务商那里修改 dns 解析服务器为 cloudflare 提供的地址，后面还会教你配置https访问，弄完之后你就可以用`https://`在国内访问你的网站了。

当然在clouldflare配置完成之后，也可以回到netlify去配置https访问。找到Domain management处的HTTPS，先确认DNS解析，如果你修改或添加了上文所述的DNS 记录，会导致DNS解析不通过并且上面的域名显示 Awaiting External DNS，**等待DNS同步一段时间再重试**即可。

## 结尾

最后，用自己的浏览器去访问自己配置的域名地址，如果在不科学上网的情况下能够正常看到网页则说明个人博客搭建成功了。后续我们只需要修改博客的配置文件和博客本身的markdown源文件，然后push到github上就可以实现网页更新了。

编写网站代码的软件建议使用VSCode，可参照文章[VSCode安装与汉化|  萝卜大作战](https://zhuanlan.zhihu.com/p/415875104?utm_id=0)。博客撰写的markdown软件我用的是[StackEdit](https://stackedit.cn/)。markdown语法可以参考[Markdown 基础|PKMer](https://pkmer.cn/Pkmer-Docs/02-%E7%9F%A5%E8%AF%86%E7%AE%A1%E7%90%86%E5%9F%BA%E7%A1%80/markdown/markdown/)，非常简单，并且StackEdit上面有按钮直接用就完事了。
