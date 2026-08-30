# 抹月批风的小站

基于 [Valaxy](https://valaxy.site) 搭建的个人博客：<https://politian.cn/>

[![友链同步](https://github.com/m0nesyMYlove/Myblog/actions/workflows/sync-links.yml/badge.svg)](https://github.com/m0nesyMYlove/Myblog/actions/workflows/sync-links.yml)

## 常用命令

```bash
pnpm install        # 安装依赖
pnpm dev            # 本地开发，访问 http://localhost:4859/
pnpm build          # 构建静态站点（SSG，并生成 llms.txt）
pnpm sync:friend-links   # 手动同步友链申请（支持 --dry-run）
```

## 目录结构

日常写博客只需要关心 `pages`：

- `pages/posts`：文章目录，写的 md 会被当作博文
- `pages/links`：友链页（评论区友链申请会被自动同步进来）
- `styles`：覆盖主题样式，`index.scss` / `css-vars.scss` 自动加载
- `components`：自定义 Vue 组件，自动注册
- `layouts`：自定义布局（md 里用 `layout: xxx` 启用）
- `locales`：自定义 i18n
- `scripts`：`sync-friend-links.mjs` 友链同步、`generate-llms.mjs` 生成 llms.txt
- `.github/workflows`：commitlint 校验、PR/push 构建检查、友链定时同步
- 部署配置：`Dockerfile`、`netlify.toml`、`vercel.json`

## 友链自动同步

`sync-links.yml` 每周二凌晨 02:30（北京时间）读取 links 页评论区里的友链申请，自动追加进 `pages/links/index.md` 并提交推送；也可在 Actions 页手动触发，或本地运行 `pnpm sync:friend-links`（支持 `--dry-run`）。

- 申请格式：在 links 页评论区按置顶模板提交 JSON（``` 代码块或裸 JSON 均可）
- 去重：按 URL 判断，已在页面里的不会重复添加
- 防抖：请求自动重试（最多 3 次，指数退避 + 抖动），偶发网络抖动不会误报失败；重试全部失败才会红叉报警
- 保活：仓库超 45 天无 commit 时自动推一个 `[skip ci]` 空提交，防止 GitHub 因 60 天不活跃停用定时工作流（不会触发部署）
- 想永久排除某站点：`scripts/sync-friend-links.mjs` 的 `EXCLUDE_URLS`，或到 Waline 后台删除该申请评论

## 提交规范

提交信息遵循 [CONTRIBUTING.md](./.github/CONTRIBUTING.md)：`<emoji> <type>(<scope>): <主题>`。
提交模板在 `.github/commit-template.txt`：每台机器执行一次
`git config commit.template .github/commit-template.txt`，之后 `git commit` 时自动展示（本机已配置）。
提交信息会被 commitlint 自动校验（本地 husky 钩子 + GitHub Actions，PR 与 push 均检查），PR 另有 `pnpm build` 构建验证。
