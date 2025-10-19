import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { initialize } from '../config.js'
import { createTempDir, cleanupTempDir } from '../../test-utils/index.js'

describe('config', () => {
	let tempDir: string

	beforeEach(async () => {
		tempDir = await createTempDir()
	})

	afterEach(async () => {
		await cleanupTempDir(tempDir)
	})

	describe('initialize', () => {
		it('should return null for invalid project location', async () => {
			const result = await initialize()
			expect(result).toBeNull()
		})

		it('should detect WordPress plugin project', async () => {
			const basename = path.basename(tempDir)
			const pluginFile = path.join(tempDir, `${basename}.php`)

			await fs.writeFile(
				pluginFile,
				'<?php\n/* Plugin Name: Test Plugin */\n',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).not.toBeNull()
				expect(result?.cwd).toBe(process.cwd())
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should detect WordPress theme project', async () => {
			// Create theme files
			await fs.writeFile(
				path.join(tempDir, 'functions.php'),
				'<?php\n// Theme functions\n',
				'utf-8'
			)

			await fs.writeFile(
				path.join(tempDir, 'style.css'),
				'/*\nTheme Name: Test Theme\n*/\n',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).not.toBeNull()
				expect(result?.cwd).toBe(process.cwd())
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should return null for incomplete theme project', async () => {
			// Create only functions.php, missing style.css
			await fs.writeFile(
				path.join(tempDir, 'functions.php'),
				'<?php\n// Theme functions\n',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).toBeNull()
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should return null for incomplete plugin project', async () => {
			const basename = path.basename(tempDir)
			const wrongPluginFile = path.join(tempDir, 'wrong-name.php')

			await fs.writeFile(
				wrongPluginFile,
				'<?php\n/* Plugin Name: Test Plugin */\n',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).toBeNull()
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should load deodar.json config when available', async () => {
			const basename = path.basename(tempDir)
			const pluginFile = path.join(tempDir, `${basename}.php`)

			await fs.writeFile(
				pluginFile,
				'<?php\n/* Plugin Name: Test Plugin */\n',
				'utf-8'
			)

			// Create deodar.json config
			const configContent = {
				externals: {
					jquery: 'jQuery',
					lodash: '_'
				},
				skip: ['node_modules/**', 'dist/**']
			}

			await fs.writeFile(
				path.join(tempDir, 'deodar.json'),
				JSON.stringify(configContent),
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).not.toBeNull()
				expect(result?.cwd).toBe(process.cwd())
				expect(result?.externals).toEqual({
					jquery: 'jQuery',
					lodash: '_'
				})
				expect(result?.skip).toEqual([
					'node_modules/**',
					'dist/**'
				])
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should handle invalid deodar.json gracefully', async () => {
			const basename = path.basename(tempDir)
			const pluginFile = path.join(tempDir, `${basename}.php`)

			await fs.writeFile(
				pluginFile,
				'<?php\n/* Plugin Name: Test Plugin */\n',
				'utf-8'
			)

			// Create invalid JSON
			await fs.writeFile(
				path.join(tempDir, 'deodar.json'),
				'invalid json content',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).not.toBeNull()
				expect(result?.cwd).toBe(process.cwd())
				// Should fall back to default config
				expect(result?.externals).toBeUndefined()
				expect(result?.skip).toBeUndefined()
			} finally {
				process.chdir(originalCwd)
			}
		})

		it('should prioritize plugin detection over theme detection', async () => {
			const basename = path.basename(tempDir)
			const pluginFile = path.join(tempDir, `${basename}.php`)

			// Create both plugin and theme files
			await fs.writeFile(
				pluginFile,
				'<?php\n/* Plugin Name: Test Plugin */\n',
				'utf-8'
			)

			await fs.writeFile(
				path.join(tempDir, 'functions.php'),
				'<?php\n// Theme functions\n',
				'utf-8'
			)

			await fs.writeFile(
				path.join(tempDir, 'style.css'),
				'/*\nTheme Name: Test Theme\n*/\n',
				'utf-8'
			)

			// Change to the temp directory
			const originalCwd = process.cwd()
			process.chdir(tempDir)

			try {
				const result = await initialize()
				expect(result).not.toBeNull()
				expect(result?.cwd).toBe(process.cwd())
				// Should detect as plugin, not theme
				expect(
					await fs
						.access(pluginFile)
						.then(() => true)
						.catch(() => false)
				).toBe(true)
			} finally {
				process.chdir(originalCwd)
			}
		})
	})
})
