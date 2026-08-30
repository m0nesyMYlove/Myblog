# 提交规范（Commit Convention）

本仓库采用 **emoji + Conventional Commits + 中文主题** 的提交风格。骨架已内置为
git 提交模板（`.github/commit-template.txt`，已通过 `git config commit.template`
启用），在仓库根目录执行 `git commit` 时会自动显示，照着填即可。

## 一、格式总览

```text
<emoji> <type>(<scope>): <主题>

<正文：问题 / 方案 / 验证>

<脚注：BREAKING CHANGE / Closes / Refs>
```

- emoji + type：放在最前面，扫一眼 `git log --oneline` 就能分类；GitHub 的
  提交列表会把 emoji 渲染成彩色图标。
- 主题行：一行以内，写「做了什么」。
- 正文：与主题空一行，写「为什么改、改了什么、怎么验证的」。
- 脚注：破坏性变更、关联 issue 时才写。

## 二、type 与 emoji（必选其一，emoji 必须加在行首）

| emoji | type     | 用途                             |
| ----- | -------- | -------------------------------- |
| ✨    | feat     | 新功能：页面、交互、组件、i18n   |
| 🐛    | fix      | 修复缺陷                         |
| ⚡    | perf     | 性能优化：加载、渲染、体积       |
| 🎨    | style    | 样式调整：CSS / 视觉，不改逻辑   |
| ♻️    | refactor | 重构：行为不变，既非新增也非修复 |
| 📝    | docs     | 文档与文章：README、发布或修改文章 |
| 🔧    | chore    | 杂务：构建、配置、依赖、部署     |
| ⏪    | revert   | 回滚某次提交                     |

> 🤖 为机器人自动提交专用（友链同步、保活心跳），人工提交请勿使用，详见「八」。

## 三、scope（可选，标明改动范围）

| scope   | 覆盖范围                                        |
| ------- | ----------------------------------------------- |
| theme   | 主题覆盖：`components/`、`layouts/`             |
| styles  | `styles/` 全站样式                              |
| pages   | `pages/` 页面（links、about、archives 等）      |
| posts   | `pages/posts/` 文章内容                         |
| locales | `locales/` 中英文案                             |
| setup   | `setup/` 注入脚本                               |
| config  | `site.config.ts`、`valaxy.config.ts`            |
| assets  | `public/` 图片、字体                            |
| deps    | `package.json` 依赖增删升级                     |
| ci      | `.github/`、`netlify.toml`、`vercel.json`、Dockerfile |

一个提交改了多个范围时，填最主要的那个；其余写进正文。

## 四、硬性规则

1. 主题行动词开头（新增/修复/支持/删除/升级…），不超过 25 个汉字，结尾不加句号。
2. 主题行只写「做了什么」；「为什么」和「怎么验证」写进正文。
3. **一次提交只做一件事**。发现多个不相关改动混在一起，拆成多次提交。
4. 正文与主题之间空一行，每行不超过 40 个汉字（避免 diff 里折行）。
5. 对站点外观或行为有可见变化时（如黑夜模式新效果），在正文第一行说明。
6. 不改变站点外观与行为的杂项一律用 `chore`。

## 五、正文怎么写：问题 → 方案 → 验证

```text
问题：现象与根因
方案：关键改动
验证：如何确认生效、无回归
```

三段都按需取舍：纯新功能可以只写「方案」；疑难修复建议三段齐全。

## 六、正反例（取自本仓库真实提交）

### 例 1：一行塞满细节 → 结构化

❌ `803f140` 原文（标题与正文不分，读起来是一堵墙）：

```text
修复手机端下滑背景图漂移:.yun-bg高度100%改100lvh固定大视口(地址栏收起会持续改动态视口高度,竖屏cover以视口高度为缩放基准导致连续重裁切),并translateZ(0)提升独立合成层规避导航.play激活backdrop-filter毛玻璃时手机端背景层重光栅化偏移;桌面dev逐像素对比play激活瞬间背景0差异,390x844手机视口渲染无回归
```

✅ 改写后：

```text
🐛 fix(styles): 修复手机端下滑背景图漂移

问题：手机地址栏收起会持续改变动态视口高度，.yun-bg 的 100% 高度随之
     连续重算，竖屏 cover 以视口高度为缩放基准，导致背景连续重裁切。
方案：.yun-bg 高度 100% 改为 100lvh 固定大视口；并 translateZ(0) 提升
     独立合成层，规避导航 .play 激活 backdrop-filter 毛玻璃时的背景层
     重光栅化偏移。
验证：桌面 dev 下 play 激活瞬间背景逐像素对比 0 差异；390×844 手机
     视口渲染无回归。
```

`git log --oneline` 里只需 `🐛 fix(styles): 修复手机端下滑背景图漂移`，细节
展开 `git show` 随时可查。

### 例 2：多件事打包 → 拆成原子提交

❌ `c2cdfef` 一次提交混入了 8 件互不相关的事。应拆为：

```text
⚡ perf(assets): 本地自托管思源宋体 900，替代 Google Fonts 外链
🐛 fix(setup): main.js 重命名为 main.ts，使 valaxy 正常加载并让 preconnect 生效
🔧 chore(assets): 背景图与头像改为本地路径
✨ feat(pages): 友链页播放器歌单更新为 611346528
🔧 chore(config): CDN 前缀 unpkg 换为 fastly.jsdelivr
🔧 chore(deps): 移除无效的 webfont-dl 插件
🎨 style(styles): 新增 .yun-bg 样式，预防背景图滚动重绘
🔧 chore(ci): gitignore 忽略 valaxy 生成的 RSS 文件
```

只有发布版本等场景才允许一次提交列多件事，且必须在正文里用列表逐条说明。

### 例 3：小提交

```text
✨ feat(locales): 友链导航支持中英切换

方案：主题 $t 只翻译 $locale: 前缀的 key，themeConfig.pages.name 改为
     $locale:nav.friends，并在 locales 新增 nav.friends 双语条目。
```

```text
🔧 chore(config): 关停看板娘
```

同一件事（如反复调整同一配置）只保留一次提交，已发生的可用
`git rebase -i` squash 合并。

## 七、校验：commitlint 自动拦截

本仓库已启用 commitlint 自动校验，不合规的提交会被直接拦截，无需人肉记忆规范：

- **提交模板**：`git commit` 时自动显示骨架（`.github/commit-template.txt`）。
- **本地钩子**：`package.json` 的 `prepare` 脚本会在任何人执行
  `pnpm install` 时自动安装 git 钩子（`.husky/commit-msg`），提交时实时校验。
- **服务端校验**：`.github/workflows/commitlint.yml` 检查 PR 的全部提交，
  也检查直接 push 到 main 的提交；`.github/workflows/build.yml` 会在 PR 上
  验证 `pnpm build` 能否构建成功，构建挂了的 PR 检查不通过。

配置在根目录 `commitlint.config.mjs`。两点注意：

1. `git revert` 自动生成的信息不带 emoji，会被拦截，提交前手动补上即可。
2. 应急出口：确有理由时可用 `git commit --no-verify` 跳过本地校验（服务端 CI 仍会检查）。

## 八、自动化提交与 [skip ci]

`sync-links.yml`（友链同步）会以 `github-actions[bot]` 身份生成两类提交：

- `📝 docs(pages): 自动同步友链申请`：links 页有新友链申请时更新 `pages/links/index.md`。
- `🤖 chore(ci): 定时同步保活心跳 [skip ci]`：仓库超 45 天无提交时推一个**空提交**
  （无任何文件改动），防止 GitHub 因 60 天不活跃停用定时工作流。

心跳带 `[skip ci]` 标记：Actions、Netlify、Vercel 都会跳过这次触发，不会产生多余
构建部署。**人工提交请勿模仿 🤖，也不要随手加 `[skip ci]`**——它会让本次推送静默
跳过 CI 校验与部署，仅限自动化提交使用。
