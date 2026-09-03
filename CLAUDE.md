# CLAUDE.md

基于 [Valaxy](https://valaxy.site) 的个人博客，线上地址 <https://politian.cn>。

本文件只写 AI 协作时的额外约定。项目结构、常用命令、友链同步机制见
[README.md](./README.md)，提交信息规范见
[.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)，那两处已有的内容此处不重复。

## 1. 技术栈

- Valaxy `1.0.0-rc.9` + 主题 `valaxy-theme-yun`，底层 Vue 3（`<script setup>`）+ Vite
- 语言：TypeScript 优先
- 样式：`styles/` 下的 SCSS 覆盖 + 主题自带的 UnoCSS
- 包管理：**强制 pnpm**（`packageManager: pnpm@10.34.5`），禁止 npm / yarn
- 配置分两处：`valaxy.config.ts`（框架与插件）、`site.config.ts`（站点与主题）

常用命令：`pnpm dev`（<http://localhost:4859/>）、`pnpm build`（SSG + 生成 llms.txt）、
`pnpm sync:friend-links`（友链同步，支持 `--dry-run`）。

## 2. 目录与命名

- 文章 `pages/posts/*.md` → kebab-case
- 页面 `pages/**/*.{md,vue}` → 文件名即路由，禁用中文与特殊字符
- 组件 `components/*.vue` → PascalCase，自动注册
- 布局 `layouts/*.vue` → camelCase，md 里用 `layout: xxx` 启用
- 样式 `styles/` → 小写连字符；`index.scss`、`css-vars.scss` 自动加载
- 友链数据源是 `public/link.json`；`pages/links/index.md` 的列表由脚本生成，
  **不要手改那份列表**，改数据源后跑 `pnpm sync:friend-links`

## 3. 高危操作（动手前必须确认）

命中以下任一项时，输出 `[危险操作]` 说明影响，等用户明确回复「确认」后再改：

- `valaxy.config.ts` / `site.config.ts`：站点标题、SEO、主题行为
- `package.json`：依赖增删升级、脚本改动
- `.env` / `.env.local` 等含 token / secret / apiKey 的文件（读与写都要问）
- 删除 `pages/` 下的路由文件（新增不算）
- `rm -rf`、`sudo` 开头的命令
- `node_modules/`：禁止任何改动

同一份清单已写进 [.claude/settings.json](./.claude/settings.json) 的 `permissions`，
由工具层强制拦截，不依赖模型自觉。

## 4. 临时文件

- 禁止在根目录或正式目录（`pages/`、`components/`、`layouts/`、`styles/`…）
  创建临时或测试文件
- 临时文件统一放项目根的 `.tmp/`（首次使用时创建，已被 `.gitignore` 忽略）
- 创建时必须声明用途与生命周期（何时可删）；未声明用途视为违规
- 任务结束时主动询问是否清理

## 5. 提交前验证

按顺序做完才算完成：

1. 清理临时产物：清空 `.tmp/`（用户明确要求保留的除外）；检查正式目录里有没有
   遗留的调试 / 草稿 / 未被引用的文件，删掉并告知删了什么
2. `pnpm build` 0 报错 0 警告；`pnpm dev` 无红屏
3. `git status` 核对待提交清单，确认没有意外文件

改动完全不进构建图时（例如只改 `.gitignore`、README）可以跳过第 2 步，
但必须主动说明跳过原因，由用户决定是否补跑。

## 6. 提交信息

格式与 type / scope / emoji 对照表见
[.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)，硬性要求摘录：

- `<emoji> <type>(<scope>): <主题>`；emoji 必须是该 type 配对的那一个
  （feat ✨ / fix 🐛 / perf ⚡ / style 🎨 / refactor ♻️ / docs 📝 / chore 🔧 /
  revert ⏪），**不要自选表外 emoji**
- 主题行动词开头、不超过 25 个汉字、结尾不加句号，只写「做了什么」
- 正文与主题空一行，每行不超过 40 个汉字，按「问题 / 方案 / 验证」三段取舍
- 一次提交只做一件事；改了多个 scope 时填最主要的那个，其余写进正文
- commitlint 会在本地 `commit-msg` 钩子和 GitHub Actions 两道拦截，
  不要用 `--no-verify` 绕过
- 🤖 与 `[skip ci]` 是友链同步机器人专用，人工提交禁止使用

## 7. 注释规范

只写必要注释：业务约束、不显而易见的坑、临时兼容方案（注明何时可删）。

禁止：复述代码做了什么、记录谁写的 / 何时写的、解释为什么改。后两者分别由
git blame 和 commit message 承担。改动理由一律写进 commit 正文，不进代码文件。

## 8. 部署与提交后验证

`main` 推送后 Netlify 自动构建（`netlify.toml`：`pnpm run build` → `dist`，
Node 22）；仓库另有 `vercel.json` 的缓存与 rewrite 配置。

推送后：告知「部署已触发」，等 2~3 分钟，请用户访问 <https://politian.cn> 确认
首页无白屏 / 404、改动内容正确、样式布局无异常。用户确认才算完成；失败则查
Netlify 部署日志定位，必要时回滚。

站点外观与行为无变化的改动（纯配置、纯文档）不必要求用户目视验证，说明原因即可。

## 9. 核心原则

- 需求模糊时主动提问，不猜测
- 不确定是否高危 → 默认按高危处理，先申请确认
- 本机网络受限，git 走网络的子命令要带 Clash 代理：
  `git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 <cmd>`
