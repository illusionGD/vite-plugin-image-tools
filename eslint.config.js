import globals from 'globals'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**', '.idea', '.vscode', 'node_modules']
  },
  {
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser
    }
  }
]
