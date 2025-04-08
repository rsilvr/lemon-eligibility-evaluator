import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'

export default defineConfig([
	{ 
		files: ['**/*.js'], 
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: {
			globals: globals.node
		},
		rules: {
			'semi': ['error', 'never'],
			'quotes': ['error', 'single'],
			'no-shadow': 'error',
			'no-redeclare': 'error',
			'no-unused-vars': ['error', {
				'ignoreRestSiblings': true,
				'argsIgnorePattern': '^_',
				'varsIgnorePattern': '^_' 
			}],
			'eqeqeq': ['error', 'always']
		} 
	}
])
