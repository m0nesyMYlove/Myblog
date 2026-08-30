export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // 行首 emoji + type(scope): 主题，与 .github/CONTRIBUTING.md 的规范一致
      headerPattern: /^\p{Extended_Pictographic}\uFE0F?\u20E3?\s+(\w+)(?:\(([^)]*)\))?!?: (.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'perf', 'style', 'refactor', 'docs', 'chore', 'revert']],
    'scope-enum': [2, 'always', ['theme', 'styles', 'pages', 'posts', 'locales', 'setup', 'config', 'assets', 'deps', 'ci']],
    'subject-case': [0],                    // 中文主题不适用英文大小写规则
    'header-max-length': [2, 'always', 72],
  },
}
