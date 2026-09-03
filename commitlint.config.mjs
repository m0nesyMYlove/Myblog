const EMOJI_BY_TYPE = {
  feat: '✨',
  fix: '🐛',
  perf: '⚡',
  style: '🎨',
  refactor: '♻️',
  docs: '📝',
  chore: '🔧',
  revert: '⏪',
}

// CONTRIBUTING 第二节注明 🤖 为友链同步与保活心跳的机器人专用。commitlint 拿不到
// author，「人工提交请勿使用」这条拦不住，仍靠人遵守
const BOT_EMOJI = '🤖'

// ♻️ 之类的符号带不带变体选择符都是同一个 emoji，比较前统一剥掉
const VARIATION_SELECTOR_16 = 0xfe0f
const bare = (text) =>
  Array.from(text)
    .filter((ch) => ch.codePointAt(0) !== VARIATION_SELECTOR_16)
    .join('')

// headerPattern 已保证行首是 emoji + 空白，取第一个空白前的整段即可
const leadingEmoji = (header) => bare(header.split(/\s/u, 1)[0] ?? '')

// CONTRIBUTING 的「25 个汉字」「40 个汉字」说的是显示宽度而非字符数
const WIDE_RANGES = [
  [0x1100, 0x115f], [0x2e80, 0x303e], [0x3041, 0x33ff], [0x3400, 0x4dbf],
  [0x4e00, 0x9fff], [0xa000, 0xa4cf], [0xac00, 0xd7a3], [0xf900, 0xfaff],
  [0xfe30, 0xfe6f], [0xff01, 0xff60], [0xffe0, 0xffe6],
]
const width = (text) =>
  Array.from(text).reduce((sum, ch) => {
    const cp = ch.codePointAt(0)
    return sum + (WIDE_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi) ? 2 : 1)
  }, 0)

const localRules = {
  'emoji-type-pair': ({ header, type }) => {
    if (!header || !type) return [true]

    const actual = leadingEmoji(header)
    if (actual === BOT_EMOJI) return [true]

    const expected = EMOJI_BY_TYPE[type]
    if (!expected) return [true]

    return [
      actual === bare(expected),
      `type 为 ${type} 时行首 emoji 必须是 ${expected}，实为 ${actual}；对照表见 .github/CONTRIBUTING.md 第二节`,
    ]
  },

  'subject-no-full-stop': ({ subject }) => [
    !/[。.]$/u.test(subject ?? ''),
    '主题行结尾不加句号',
  ],

  'subject-max-width': ({ subject }, _when, max) => {
    const actual = width(subject ?? '')
    return [actual <= max, `主题行显示宽度 ${actual} 超过上限 ${max}（约 ${max / 2} 个汉字）`]
  },

  'body-max-line-width': ({ body }, _when, max) => {
    const over = (body ?? '').split('\n').filter((line) => width(line) > max)
    return [
      over.length === 0,
      `正文有 ${over.length} 行显示宽度超过 ${max}（约 ${max / 2} 个汉字），请折行`,
    ]
  },
}

export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 行首 emoji + type(scope): 主题，与 .github/CONTRIBUTING.md 的规范一致
      // \p{M}* 吃掉变体选择符与组合记号（♻️ 的 U+FE0F、⃣ 的 U+20E3）
      headerPattern: /^\p{Extended_Pictographic}\p{M}*\s+(\w+)(?:\(([^)]*)\))?!?: (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  plugins: [{ rules: localRules }],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'perf', 'style', 'refactor', 'docs', 'chore', 'revert']],
    'scope-enum': [2, 'always', ['theme', 'styles', 'pages', 'posts', 'locales', 'setup', 'config', 'assets', 'deps', 'ci']],
    'subject-case': [0],                    // 中文主题不适用英文大小写规则
    'header-max-length': [2, 'always', 72],
    'emoji-type-pair': [2, 'always'],
    'subject-no-full-stop': [2, 'always'],
    'subject-max-width': [1, 'always', 50],
    'body-max-line-width': [1, 'always', 80],
  },
}
