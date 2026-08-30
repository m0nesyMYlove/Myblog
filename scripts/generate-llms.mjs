// 构建后自动生成 dist/llms.txt（给 AI 智能体看的站点说明书，约定见 llmstxt.org）。
// 数据全部来自 valaxy 每次构建的产物，发文、增删页面、改社交链接后 pnpm build 自动同步：
//   - 站点标题    ← dist/atom.xml 的 feed 标题
//   - 文章列表    ← dist/atom.xml 的 entry
//   - 页面列表    ← dist/sitemap.xml（valaxy 从真实路由生成，启用/停用页面自动跟随）
//   - 社交链接    ← dist/index.html 的 JSON-LD sameAs（来自 site.config.ts 的 social）
// package.json 的 build:ssg 在 valaxy build 之后调用本脚本。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const SITE_URL = 'https://politian.cn/'
// 站点简介是唯一手写文案（无数据源可同步），改站点定位时更新这一句
const INTRO = 'Politian 的个人博客，记录建站过程、AI 使用记录与学习笔记，基于 Valaxy + Yun 主题构建，主要内容为中文文章。'

// 页面美化名与说明（可选）：sitemap 里出现的路径若在这里没有条目，
// 会自动以路径本身作为名称列出，因此新启用页面不必改这里，起名只是锦上添花
const PAGE_META = {
  '/': ['首页', '最新文章列表'],
  '/about': ['关于我', '博主介绍'],
  '/about/site': ['关于站点', '架构与主题信息'],
  '/archives': ['归档', '全部文章按时间归档'],
  '/categories': ['分类', '文章分类'],
  '/links': ['我的小伙伴们', '友情链接'],
  '/posts': ['文章列表', '全部文章'],
  '/tags': ['标签', '文章标签'],
}

// 社交链接美化名（可选）：按域名匹配 site.config.ts 的 social，未匹配时用域名本身
const SOCIAL_META = {
  'github.com': 'GitHub',
  'music.163.com': '网易云音乐',
  'space.bilibili.com': '哔哩哔哩',
}

const decodeEntities = s =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&')

// atom 的标题一般是 CDATA 包裹的原文；无 CDATA 时才需要反转义实体
function extractTitle(block) {
  const cdata = block.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)
  if (cdata)
    return cdata[1].trim()
  const plain = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)
  return plain ? decodeEntities(plain[1]).trim() : ''
}

function loadPosts() {
  const atomPath = join(dist, 'atom.xml')
  if (!existsSync(atomPath))
    return { feedTitle: 'Blog', posts: [] }

  const atom = readFileSync(atomPath, 'utf8')
  const feedTitle = extractTitle(atom.split('<entry>')[0]) || 'Blog'
  const posts = [...atom.matchAll(/<entry>[\s\S]*?<\/entry>/g)]
    .map((m) => {
      const block = m[0]
      return {
        title: extractTitle(block),
        link: block.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? SITE_URL,
        date: block.match(/<updated>(\d{4}-\d{2}-\d{2})/)?.[1] ?? '',
      }
    })
    .filter(p => p.title)
  return { feedTitle, posts }
}

// 页面 = sitemap 里的真实路由，去掉 404 与文章详情（文章由 atom 单独一节列出）
function loadPages() {
  const sitemapPath = join(dist, 'sitemap.xml')
  if (!existsSync(sitemapPath)) {
    console.warn('[llms.txt] 未找到 dist/sitemap.xml，页面列表为空')
    return []
  }

  const xml = readFileSync(sitemapPath, 'utf8')
  const pathnames = [...new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => new URL(decodeEntities(m[1])).pathname)
      .filter((p) => {
        if (p === '/' || p === '/404')
          return p === '/'
        if (p.startsWith('/posts/'))
          return false
        return !/\.(xml|txt|json|webmanifest)$/.test(p)
      }),
  )]

  // 首页置顶，其余按路径排序，保证输出稳定
  return pathnames.sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
    .map(pathname => ({ pathname, meta: PAGE_META[pathname] }))
}

// 社交链接 = 首页 SSG HTML 中 schema.org JSON-LD 的 sameAs（来自 site.config.ts social）
function loadSocials() {
  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) {
    console.warn('[llms.txt] 未找到 dist/index.html，社交链接列表为空')
    return []
  }

  const html = readFileSync(indexPath, 'utf8')
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const graph = JSON.parse(m[1])?.['@graph'] ?? []
      const sameAs = graph.find(node => Array.isArray(node.sameAs))?.sameAs ?? []
      return sameAs.map((url) => {
        const host = new URL(url).hostname.replace(/^www\./, '')
        return { url, label: SOCIAL_META[host] ?? host }
      })
    }
    catch {}
  }
  return []
}

function generate() {
  const { feedTitle, posts } = loadPosts()
  const pages = loadPages()
  const socials = loadSocials()

  const lines = [
    `# ${feedTitle}`,
    '',
    `> ${INTRO}`,
    '',
    '## 页面',
    ...pages.map((p) => {
      const href = `${SITE_URL}${p.pathname.replace(/^\//, '')}`
      return p.meta
        ? `- [${p.meta[0]}](${href}): ${p.meta[1]}`
        : `- [${p.pathname.replace(/^\/|\/$/g, '')}](${href})`
    }),
    '',
    '## 文章（按时间倒序）',
    ...posts.map(p => `- [${p.title}](${p.link})${p.date ? `（${p.date}）` : ''}`),
    '',
    '## 相关链接',
    `- [站点地图](${SITE_URL}sitemap.xml): 全部页面索引（始终最新，找内容优先看这里）`,
    `- [RSS 订阅](${SITE_URL}atom.xml): 文章更新订阅`,
    ...socials.map(s => `- [${s.label}](${s.url}): 博主主页`),
    '',
  ]

  writeFileSync(join(dist, 'llms.txt'), lines.join('\n'))
  console.log(`[llms.txt] 已生成（${pages.length} 个页面 / ${posts.length} 篇文章 / ${socials.length} 个社交链接）`)
}

try {
  generate()
}
catch (err) {
  // llms.txt 属于附加产物，生成失败不阻断构建，但要留下可见警告
  console.warn('[llms.txt] 生成失败：', err)
}
