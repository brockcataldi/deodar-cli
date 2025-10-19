import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import {
	exists,
	getCompilables,
	getConfig,
	getDirectories,
	getIgnores,
	writeTemplate,
	createBlock
} from '../file-system.js'
import {
	createTempDir,
	createTempFile,
	createMockProject,
	cleanupTempDir
} from '../../test-utils/index.js'

describe('file-system', () => {
	let tempDir: string

	beforeEach(async () => {
		tempDir = await createTempDir()
	})

	afterEach(async () => {
		await cleanupTempDir(tempDir)
	})

	describe('exists', () => {
		it('should return true for existing files', async () => {
			const filePath = await createTempFile(
				'test content',
				'.txt',
				tempDir
			)
			expect(await exists(filePath)).toBe(true)
		})

		it('should return true for existing directories', async () => {
			const dirPath = path.join(tempDir, 'test-dir')
			await fs.mkdir(dirPath)
			expect(await exists(dirPath)).toBe(true)
		})

		it('should return false for non-existing files', async () => {
			const filePath = path.join(tempDir, 'non-existing.txt')
			expect(await exists(filePath)).toBe(false)
		})

		it('should return false for non-existing directories', async () => {
			const dirPath = path.join(tempDir, 'non-existing-dir')
			expect(await exists(dirPath)).toBe(false)
		})
	})

	describe('getCompilables', () => {
		it('should find SCSS and JS files in a directory', async () => {
			await createTempFile('$color: red;', '.scss', tempDir)
			await createTempFile('console.log("test");', '.js', tempDir)
			await createTempFile('some text', '.txt', tempDir)

			const result = await getCompilables(tempDir)

			expect(result.scss).toHaveLength(1)
			expect(result.js).toHaveLength(1)
			expect(result.scss[0]).toMatch(/\.scss$/)
			expect(result.js[0]).toMatch(/\.js$/)
		})

		it('should return empty arrays for directory with no compilable files', async () => {
			await createTempFile('some text', '.txt', tempDir)
			await createTempFile('more text', '.md', tempDir)

			const result = await getCompilables(tempDir)

			expect(result.scss).toHaveLength(0)
			expect(result.js).toHaveLength(0)
		})

		it('should handle non-existent directory gracefully', async () => {
			const nonExistentDir = path.join(tempDir, 'non-existent')
			const result = await getCompilables(nonExistentDir)

			expect(result.scss).toHaveLength(0)
			expect(result.js).toHaveLength(0)
		})
	})

	describe('getConfig', () => {
		it('should return default config when deodar.json does not exist', async () => {
			const config = await getConfig(tempDir)

			expect(config).toEqual({
				cwd: tempDir
			})
		})

		it('should load and merge config from deodar.json', async () => {
			const configContent = {
				externals: {
					jquery: 'jQuery'
				},
				skip: ['node_modules/**']
			}

			await fs.writeFile(
				path.join(tempDir, 'deodar.json'),
				JSON.stringify(configContent),
				'utf-8'
			)

			const config = await getConfig(tempDir)

			expect(config).toEqual({
				cwd: tempDir,
				externals: {
					jquery: 'jQuery'
				},
				skip: ['node_modules/**']
			})
		})

		it('should return default config for invalid JSON', async () => {
			await fs.writeFile(
				path.join(tempDir, 'deodar.json'),
				'invalid json content',
				'utf-8'
			)

			const config = await getConfig(tempDir)

			expect(config).toEqual({
				cwd: tempDir
			})
		})
	})

	describe('getDirectories', () => {
		it('should return directory names in a given path', async () => {
			await fs.mkdir(path.join(tempDir, 'dir1'))
			await fs.mkdir(path.join(tempDir, 'dir2'))
			await createTempFile('content', '.txt', tempDir)

			const directories = await getDirectories(tempDir)

			expect(directories).toHaveLength(2)
			expect(directories).toContain('dir1')
			expect(directories).toContain('dir2')
		})

		it('should return empty array for directory with no subdirectories', async () => {
			await createTempFile('content', '.txt', tempDir)

			const directories = await getDirectories(tempDir)

			expect(directories).toHaveLength(0)
		})
	})

	describe('getIgnores', () => {
		it('should return empty array when .bundleignore does not exist', async () => {
			const ignores = await getIgnores(tempDir)
			expect(ignores).toEqual([])
		})

		it('should parse .bundleignore file correctly', async () => {
			const ignoreContent = [
				'node_modules/',
				'# This is a comment',
				'',
				'dist/',
				'*.log'
			].join('\n')

			await fs.writeFile(
				path.join(tempDir, '.bundleignore'),
				ignoreContent,
				'utf-8'
			)

			const ignores = await getIgnores(tempDir)

			expect(ignores).toEqual(['node_modules/', 'dist/', '*.log'])
		})

		it('should handle empty .bundleignore file', async () => {
			await fs.writeFile(
				path.join(tempDir, '.bundleignore'),
				'',
				'utf-8'
			)

			const ignores = await getIgnores(tempDir)
			expect(ignores).toEqual([])
		})
	})

	describe('writeTemplate', () => {
		it('should write template file successfully', async () => {
			const outputPath = path.join(tempDir, 'test-output.txt')
			const templateData = { name: 'Test', value: 42 }

			const [success, error] = await writeTemplate(
				outputPath,
				'block.json', // This will use the existing template
				templateData
			)

			expect(success).toBe(true)
			expect(error).toBe('')
			expect(await exists(outputPath)).toBe(true)
		})

		it('should handle template file not found', async () => {
			const outputPath = path.join(tempDir, 'test-output.txt')
			const templateData = { name: 'Test' }

			const [success, error] = await writeTemplate(
				outputPath,
				'non-existent-template',
				templateData
			)

			expect(success).toBe(false)
			expect(error).toBeDefined()
		})
	})

	describe('createBlock', () => {
		it('should create a complete block structure', async () => {
			const blockDir = path.join(tempDir, 'test-block')
			const options = {
				title: 'Test Block',
				slug: 'test-block',
				category: 'text',
				js: true
			}

			const [success, error] = await createBlock(blockDir, options)

			expect(success).toBe(true)
			expect(error).toBeUndefined()
			expect(await exists(blockDir)).toBe(true)
			expect(await exists(path.join(blockDir, 'block.json'))).toBe(
				true
			)
			expect(
				await exists(path.join(blockDir, 'test-block.php'))
			).toBe(true)
			expect(
				await exists(path.join(blockDir, 'test-block.scss'))
			).toBe(true)
			expect(
				await exists(path.join(blockDir, 'test-block.js'))
			).toBe(true)
		})

		it('should create block without JS file when js is false', async () => {
			const blockDir = path.join(tempDir, 'test-block')
			const options = {
				title: 'Test Block',
				slug: 'test-block',
				category: 'text',
				js: false
			}

			const [success, error] = await createBlock(blockDir, options)

			expect(success).toBe(true)
			expect(
				await exists(path.join(blockDir, 'test-block.js'))
			).toBe(false)
		})

		it('should handle directory creation errors', async () => {
			// Create a file with the same name as the directory we want to create
			const filePath = path.join(tempDir, 'test-block')
			await fs.writeFile(filePath, 'content', 'utf-8')

			const options = {
				title: 'Test Block',
				slug: 'test-block',
				category: 'text',
				js: false
			}

			const [success, error] = await createBlock(filePath, options)

			expect(success).toBe(false)
			expect(error).toBeDefined()
		})
	})
})
