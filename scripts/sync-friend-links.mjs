// 自动同步友链：评论区（Waline）申请去重合并进数据源 public/link.json，
// 再由它整体生成 pages/links/index.md 的 links 列表。手动友链直接编辑 link.json。
// CI（sync-links.yml）每周定时调用；本地：node scripts/sync-friend-links.mjs [--dry-run]
//
// 申请格式（``` 代码块或裸 JSON 均可，字符串外的 // 注释会被剥离）：
//   { "url": "https://example.com/", "avatar": "...", "name": "...", "blog": "...", "desc": "..." }
//
// 去重：按 URL，已在 link.json 里的不重复添加。手动删掉的友链若申请评论还在会被加回；
// 永久排除用下方 EXCLUDE_URLS，或到 Waline 后台删除该申请评论。
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// 友链数据源（评论区申请 + 手动友链），links 页列表由它生成；别手改 index.md
const STORE = join(root, 'public/link.json')
const TARGET = join(root, 'pages/links/index.md')

const WALINE_API = 'https://comment.politian.cn'
// 站点路由无尾斜杠，评论挂在 /links 下；两个变体都查，路由写法变化也不怕
const COMMENT_PATHS = ['/links', '/links/']
const PAGE_SIZE = 100
// 网络抖动容错：最多尝试 3 次，指数退避 + 随机抖动；
// 5xx / 429 视为暂时性错误参与重试，其余 4xx（配置类错误）立即失败
const FETCH_ATTEMPTS = 3
const FETCH_TIMEOUT = 15000

// 自己的站点：置顶模板评论里的自我申请不入列
const SELF_HOSTS = ['politian.cn']
// 永久排除的站点（写域名或完整 URL 均可）
const EXCLUDE_URLS = []

// 新友链未提供 color 时，按站名哈希从色板取固定颜色，观感与现有条目一致
const PALETTE = [
  '#2D96BD', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#FF9800', '#FF5722', '#607D8B',
]
// index.md 里 YunLinks 组件的 errorImg，头像缺失/挂掉时主题本来就会兜底到它
const FALLBACK_AVATAR = 'https://cdn.yunyoujun.cn/img/avatar/none.jpg'

const dryRun = process.argv.includes('--dry-run')

// Waline 会拒绝非浏览器请求（实测无 UA 直接 403），带上常规浏览器头
const BROWSER_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  accept: 'application/json',
  referer: 'https://politian.cn/',
}

// 键名别名：申请人未必严格按模板写，常见写法都能认出来
const FIELD_ALIASES = {
  url: ['url', 'link', 'homepage', '链接', '网址'],
  avatar: ['avatar', 'icon', '头像'],
  name: ['name', 'nick', '昵称'],
  blog: ['blog', 'site', 'website', '站点名称', '站点', '网站', '博客名'],
  desc: ['desc', 'description', '一句话介绍', '介绍', '描述'],
  color: ['color', '颜色'],
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

async function fetchWithRetry(api, options) {
  let lastError = null
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    let res = null
    try {
      res = await fetch(api, { ...options, signal: AbortSignal.timeout(FETCH_TIMEOUT) })
    }
    catch (err) {
      // 网络错误 / 超时，视为暂时性错误
      lastError = err
    }
    if (res) {
      if (res.ok)
        return res
      lastError = new Error(`Waline 接口返回 HTTP ${res.status}`)
      if (!(res.status >= 500 || res.status === 429))
        throw lastError
    }
    if (attempt === FETCH_ATTEMPTS)
      throw lastError
    const delay = 2000 * 2 ** (attempt - 1) + Math.round(Math.random() * 1000)
    console.warn(`[友链同步] 请求失败（${lastError.message}），${(delay / 1000).toFixed(1)}s 后进行第 ${attempt + 1}/${FETCH_ATTEMPTS} 次尝试……`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  throw lastError
}

async function fetchCommentsByPath(path) {
  const comments = []
  for (let page = 1;; page++) {
    const api = `${WALINE_API}/api/comment?path=${encodeURIComponent(path)}&pageSize=${PAGE_SIZE}&page=${page}`
    const res = await fetchWithRetry(api, { headers: BROWSER_HEADERS })
    const json = await res.json()
    if (json.errno !== 0)
      throw new Error(`Waline 接口返回 errno=${json.errno} ${json.errmsg || ''}`.trim())
    const list = json.data?.data ?? []
    comments.push(...list)
    if (!list.length || page >= (json.data?.totalPages ?? 1))
      break
  }
  return comments
}

async function fetchComments() {
  const merged = new Map()
  for (const path of COMMENT_PATHS)
    for (const comment of await fetchCommentsByPath(path))
      if (!merged.has(comment.objectId))
        merged.set(comment.objectId, comment)
  // 按时间正序处理，先申请的先入列
  return [...merged.values()].sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
}

// 优先用 orig（原始 Markdown，解析最可靠），缺失时才从渲染后的 HTML 兜底提取
function commentText(comment) {
  if (comment.orig)
    return comment.orig.replace(/\r\n/g, '\n')
  const html = comment.comment ?? ''
  const codes = [...html.matchAll(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)]
    .map(m => decodeEntities(m[1]))
  const text = decodeEntities(html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|pre|div|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
  return `${codes.join('\n')}\n${text}`.replace(/\r\n/g, '\n')
}

// 剥离字符串外的 // 注释。仅当 // 前是空白或行首才视为注释，
// 这样无引号 URL 里的 :// 不会被误伤
function stripLineComments(text) {
  let out = ''
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      out += ch
      if (ch === '\\') {
        out += text[i + 1] ?? ''
        i++
      }
      else if (ch === quote) {
        quote = null
      }
    }
    else if (ch === '"' || ch === '\'') {
      quote = ch
      out += ch
    }
    else if (ch === '/' && text[i + 1] === '/' && (i === 0 || /\s/.test(text[i - 1]))) {
      const end = text.indexOf('\n', i)
      if (end === -1)
        break
      out += '\n'
      i = end
    }
    else {
      out += ch
    }
  }
  return out
}

// 提取候选片段：``` 围栏代码块优先，其后在剩余文本里按括号配对找裸 {...}
function extractCandidates(text) {
  const blocks = [...text.matchAll(/```[^\n]*\n?([\s\S]*?)```/g)].map(m => m[1])
  const rest = text.replace(/```[^\n]*\n?[\s\S]*?```/g, '')
  let start = rest.indexOf('{')
  while (start !== -1) {
    let depth = 0
    let quote = null
    let end = -1
    for (let i = start; i < rest.length; i++) {
      const ch = rest[i]
      if (quote) {
        if (ch === '\\')
          i++
        else if (ch === quote)
          quote = null
      }
      else if (ch === '"' || ch === '\'') {
        quote = ch
      }
      else if (ch === '{') {
        depth++
      }
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end !== -1)
      blocks.push(rest.slice(start, end + 1))
    start = rest.indexOf('{', Math.max(start + 1, end + 1))
  }
  return blocks
}

// 宽松解析键值对：容忍单引号 / 无引号 / 中英文冒号 / 尾逗号
function parseFields(block) {
  const cleaned = stripLineComments(block)
  const fields = {}
  for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const re = new RegExp(`(?:^|[\\s,{\\[])["']?${alias}["']?\\s*[:：]\\s*("((?:[^"\\\\]|\\\\.)*)"|'([^']*)'|([^,\\n}]+))`)
      const m = cleaned.match(re)
      if (!m)
        continue
      const value = (m[2] ?? m[3] ?? m[4] ?? '').replace(/\\(.)/g, '$1').trim()
      if (value) {
        fields[key] = decodeEntities(value)
        break
      }
    }
  }
  return Object.keys(fields).length ? fields : null
}

function hashString(s) {
  let hash = 5381
  for (let i = 0; i < s.length; i++)
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0
  return Math.abs(hash)
}

function normalizeUrl(raw) {
  try {
    const url = new URL(raw)
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}${url.search}${url.hash}`
  }
  catch {
    return raw.trim().replace(/\/+$/, '')
  }
}

function hostOf(raw) {
  try {
    return new URL(raw).hostname.replace(/^www\./, '')
  }
  catch {
    return ''
  }
}

// 文件缺失/非法时直接失败，绝不回退成空列表——那会把 links 页整表清空
function loadStore() {
  let raw
  try {
    raw = readFileSync(STORE, 'utf8')
  }
  catch {
    throw new Error('友链数据源 public/link.json 不存在，它是所有友链的唯一存储，请先创建（字段：avatar/name/url/color/blog/desc）')
  }
  let list
  try {
    list = JSON.parse(raw)
  }
  catch (err) {
    throw new Error(`public/link.json 不是合法 JSON：${err.message}`)
  }
  if (!Array.isArray(list))
    throw new Error('public/link.json 顶层必须是数组')

  const seen = new Set()
  const entries = []
  for (const item of list) {
    const url = String(item.url ?? '').trim()
    if (!url) {
      console.warn(`[友链同步] ⚠ 数据源里有一条无 url 的条目，已忽略：${JSON.stringify(item)}`)
      continue
    }
    const normUrl = normalizeUrl(url)
    if (seen.has(normUrl)) {
      console.warn(`[友链同步] ⚠ 数据源里 url 重复，保留首条：${url}`)
      continue
    }
    seen.add(normUrl)
    const name = item.name || item.blog || url
    entries.push({
      avatar: item.avatar || FALLBACK_AVATAR,
      name,
      url,
      color: item.color || PALETTE[hashString(name) % PALETTE.length],
      blog: item.blog || name,
      desc: item.desc || '',
    })
  }
  return entries
}

function saveStore(entries) {
  writeFileSync(STORE, `${JSON.stringify(entries, null, 2)}\n`)
}

// 申请评论片段 → 友链条目；url 必填，name/blog/avatar/desc 缺失时逐级回退
function toEntry(fields, comment) {
  const url = fields.url?.replace(/^<|>$/g, '').trim() ?? ''
  if (!/^https?:\/\//.test(url))
    return { error: `url 缺失或非法（${fields.url || '空'}）` }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
      return { error: `url 协议不支持（${url}）` }
  }
  catch {
    return { error: `url 无法解析（${url}）` }
  }

  const nick = comment.nick || ''
  const avatar = (fields.avatar ?? '').replace(/^<|>$/g, '').trim()
  let validAvatar = ''
  if (avatar) {
    const absolute = avatar.startsWith('//') ? `https:${avatar}` : avatar
    if (/^https?:\/\//.test(absolute))
      validAvatar = absolute
  }

  const name = fields.name || fields.blog || nick
  return {
    normUrl: normalizeUrl(url),
    entry: {
      avatar: validAvatar || FALLBACK_AVATAR,
      name,
      url,
      color: (fields.color || PALETTE[hashString(name) % PALETTE.length]).replace(/"/g, ''),
      blog: fields.blog || fields.name || nick,
      desc: fields.desc || '',
    },
  }
}

// 定位 frontmatter 里的 links: 列表块（起止行号）
function locateLinksBlock(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  if (lines[0]?.trim() !== '---')
    throw new Error('pages/links/index.md 开头不是 frontmatter（---）')
  let fmEnd = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      fmEnd = i
      break
    }
  }
  if (fmEnd === -1)
    throw new Error('未找到 frontmatter 结束标记')
  const linksIdx = lines.findIndex((line, i) => i > 0 && i < fmEnd && /^links:\s*(?:#.*)?$/.test(line))
  if (linksIdx === -1)
    throw new Error('frontmatter 中未找到 links: 字段')
  let blockEnd = fmEnd
  for (let i = linksIdx + 1; i < fmEnd; i++) {
    // 列表块在第一个非缩进行（如 random: true）或空行处结束
    if (lines[i] === '' || !/^\s/.test(lines[i])) {
      blockEnd = i
      break
    }
  }
  return { lines, linksIdx, blockEnd }
}

// 内容与现状一致时不写文件；每次运行都执行，手动改的 link.json 由此流进 links 页
function regenerateIndex(entries) {
  const content = readFileSync(TARGET, 'utf8')
  const { lines, linksIdx, blockEnd } = locateLinksBlock(content)
  const rendered = renderEntries(entries)
  const current = lines.slice(linksIdx + 1, blockEnd)
  if (current.length === rendered.length && current.every((line, i) => line === rendered[i]))
    return false
  lines.splice(linksIdx + 1, current.length, ...rendered)
  writeFileSync(TARGET, lines.join('\n'))
  return true
}

// 与现有条目风格一致：普通文本不加引号（含空格的 中文/英文 值也无需引号），
// 有 YAML 特殊含义时才用双引号
function yamlScalar(value) {
  const v = String(value)
  if (v === '')
    return '""'
  if (/^\s|\s$|[:#]\s|[\n\r\t]/.test(v) || /^[-?&*!|>%@`"'\[{,]/.test(v) || /:$/.test(v))
    return JSON.stringify(v)
  return v
}

function renderEntries(entries) {
  return entries.flatMap(entry => [
    `   - avatar: ${entry.avatar}`,
    `     name: ${yamlScalar(entry.name)}`,
    `     url: ${yamlScalar(entry.url)}`,
    `     color: "${entry.color}"`,
    `     blog: ${yamlScalar(entry.blog)}`,
    `     desc: ${yamlScalar(entry.desc)}`,
  ])
}

function report(commentCount, store, added, skip, warnings, indexUpdated) {
  const consoleLines = [
    `检查评论：${commentCount} 条`,
    `数据源现有友链：${store.length} 条（public/link.json）`,
    `新增友链：${added.length} 条`,
    ...added.map(e => `  + ${e.blog}（${e.url}）`),
    `跳过：自己站点 ${skip.self} · 排除列表 ${skip.excluded} · 已存在 ${skip.exists}`,
    `无效/不完整申请：${warnings.length} 处`,
    ...warnings.map(w => `  ⚠ ${w}`),
    `links 页列表：${indexUpdated ? '已按数据源重新生成（pages/links/index.md）' : '与数据源一致，无需改动'}`,
  ]
  console.log(`[友链同步]\n${consoleLines.map(l => `  ${l}`).join('\n')}`)
  if (dryRun)
    console.log('[友链同步] --dry-run：未写入文件')

  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    appendFileSync(summaryPath, [
      '## 🤝 友链同步结果',
      '',
      `- 检查评论 **${commentCount}** 条`,
      `- 数据源现有友链 **${store.length}** 条`,
      `- 新增友链 **${added.length}** 条${added.length ? `：${added.map(e => `[${e.blog}](${e.url})`).join('、')}` : ''}`,
      `- 跳过：自己站点 ${skip.self} · 排除列表 ${skip.excluded} · 已存在 ${skip.exists}`,
      `- 无效/不完整申请：${warnings.length} 处`,
      ...warnings.map(w => `  - ⚠️ ${w}`),
      `- links 页列表${indexUpdated ? '已按数据源重新生成' : '与数据源一致'}`,
      '',
      dryRun ? '> --dry-run 模式，未写入文件' : '',
      '',
    ].filter(Boolean).join('\n'))
  }
}

async function main() {
  const store = loadStore()
  const storeUrls = new Set(store.map(e => normalizeUrl(e.url)))

  const comments = await fetchComments()

  const excludedHosts = new Set(EXCLUDE_URLS.map(hostOf).filter(Boolean))
  const excludedUrls = new Set(EXCLUDE_URLS.map(normalizeUrl))

  const added = []
  const warnings = []
  const skip = { self: 0, excluded: 0, exists: 0 }

  for (const comment of comments) {
    for (const block of extractCandidates(commentText(comment))) {
      const fields = parseFields(block)
      if (!fields)
        continue
      const result = toEntry(fields, comment)
      if (result.error) {
        warnings.push(`「${comment.nick || '匿名'}」的申请：${result.error}`)
        continue
      }
      const { entry, normUrl } = result
      const host = hostOf(entry.url)
      if (SELF_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) {
        skip.self++
        continue
      }
      if (excludedUrls.has(normUrl) || excludedHosts.has(host)) {
        skip.excluded++
        continue
      }
      if (storeUrls.has(normUrl)) {
        skip.exists++
        continue
      }
      storeUrls.add(normUrl)
      added.push(entry)
    }
  }

  if (added.length && !dryRun) {
    store.push(...added)
    saveStore(store)
  }

  let indexUpdated = false
  if (!dryRun)
    indexUpdated = regenerateIndex(store)

  report(comments.length, store, added, skip, warnings, indexUpdated)
}

main().catch((err) => {
  console.error('[友链同步] 失败：', err?.message ?? err)
  process.exit(1)
})
