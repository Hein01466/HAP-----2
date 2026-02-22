const js = require('@eslint/js')
const tseslint = require('typescript-eslint')

module.exports = [
  { ignores: ['dist/**', 'node_modules/**', '**/*.d.ts', 'eslint.config.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  },
]
