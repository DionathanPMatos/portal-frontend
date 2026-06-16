import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
    'no-unused-vars': 'off',          // Ignora variáveis não usadas
    'react-hooks/rules-of-hooks': 'error', 
    'react-hooks/exhaustive-deps': 'warn', // Muda de erro para aviso
    'no-empty': 'off',               // Permite blocos vazios
    'no-undef': 'off',               // Permite variáveis não definidas (para corrigir o process/global)
    'no-prototype-builtins': 'off',
    'react-refresh/only-export-components': 'off' // Isso vai parar o erro de exportação
}
  },
])
