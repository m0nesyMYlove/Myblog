# create-valaxy

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

## Commit Convention

提交信息遵循 [CONTRIBUTING.md](./.github/CONTRIBUTING.md)：`<emoji> <type>(<scope>): <主题>`。
提交模板在 `.github/commit-template.txt`：每台机器执行一次
`git config commit.template .github/commit-template.txt`，之后 `git commit` 时自动展示（本机已配置）。
提交信息会被 commitlint 自动校验（本地 husky 钩子 + GitHub Actions，PR 与 push 均检查），PR 另有 `pnpm build` 构建验证。
