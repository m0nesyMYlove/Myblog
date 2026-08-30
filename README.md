# create-valaxy

[![友链同步](https://github.com/m0nesyMYlove/Myblog/actions/workflows/sync-links.yml/badge.svg)](https://github.com/m0nesyMYlove/Myblog/actions/workflows/sync-links.yml)

Example: [valaxy.site](https://valaxy.site)

## Usage

```bash
# install
pnpm install

# start
pnpm dev
```

See `http://localhost:4859/`, have fun!

### Config

Modify `valaxy.config.ts` to custom your blog.

English & Chinese Docs is coming!

> Wait a minute.

### Docker

```bash
docker build . -t your-valaxy-blog-name:latest
```

## Structure

In most cases, you only need to work in the `pages` folder.

### Main folders

- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.scss`/`vars.csss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n

### Other

- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
- `.github`: GitHub Actions for commitlint & PR build check
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)

### 友链自动同步

`sync-links.yml` 每周二凌晨 02:30（北京时间）读取 links 页评论区里的友链申请，自动追加进 `pages/links/index.md` 并提交推送；也可在 Actions 页手动触发，或本地运行 `pnpm sync:friend-links`（支持 `--dry-run`）。

- 申请格式：在 links 页评论区按置顶模板提交 JSON（``` 代码块或裸 JSON 均可）
- 去重：按 URL 判断，已在页面里的不会重复添加
- 防抖：请求自动重试（最多 3 次，指数退避 + 抖动），偶发网络抖动不会误报失败；重试全部失败才会红叉报警
- 保活：仓库超 45 天无 commit 时自动推一个 `[skip ci]` 空提交，防止 GitHub 因 60 天不活跃停用定时工作流（不会触发部署）
- 想永久排除某站点：`scripts/sync-friend-links.mjs` 的 `EXCLUDE_URLS`，或到 Waline 后台删除该申请评论

## Commit Convention

提交信息遵循 [CONTRIBUTING.md](./.github/CONTRIBUTING.md)：`<emoji> <type>(<scope>): <主题>`。
提交模板在 `.github/commit-template.txt`：每台机器执行一次
`git config commit.template .github/commit-template.txt`，之后 `git commit` 时自动展示（本机已配置）。
提交信息会被 commitlint 自动校验（本地 husky 钩子 + GitHub Actions，PR 与 push 均检查），PR 另有 `pnpm build` 构建验证。
