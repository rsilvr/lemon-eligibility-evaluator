import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'

export default defineConfig([
	{ 
		files: ['**/*.js'], 
		plugins: { js, jest: jestPlugin },
		extends: ['js/recommended'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				...globals.node,
				...globals.jest
			}
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
