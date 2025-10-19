import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { compileProject } from '../build.js'
import {
	createMockProject,
	createMockBlock,
	cleanupTempDir
} from '../../test-utils/index.js'

describe('build', () => {
	let projectDir: string

	beforeEach(async () => {
		projectDir = await createMockProject()
	})

	afterEach(async () => {
		await cleanupTempDir(projectDir)
	})

	describe('compileProject', () => {
		it('should compile SCSS files to CSS', async () => {
			// Create a test block with SCSS
			const blockDir = path.join(
				projectDir,
				'blocks',
				'acf',
				'test-block'
			)
			await createMockBlock(blockDir, 'test-block')

			// Add some SCSS content
			await fs.writeFile(
				path.join(blockDir, 'test-block.scss'),
				`.test-block {
          color: red;
          font-size: 16px;
          
          &__title {
            font-weight: bold;
          }
        }`,
				'utf-8'
			)

			// Mock the config
			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			// Compile the project
			await compileProject(projectDir, config, false)

			// Check if the build directory and CSS file were created
			const buildDir = path.join(blockDir, 'build')
			const cssFile = path.join(buildDir, 'test-block.build.css')

			expect(
				await fs
					.access(buildDir)
					.then(() => true)
					.catch(() => false)
			).toBe(true)
			expect(
				await fs
					.access(cssFile)
					.then(() => true)
					.catch(() => false)
			).toBe(true)

			// Check CSS content
			const cssContent = await fs.readFile(cssFile, 'utf-8')
			expect(cssContent).toContain('.test-block')
			expect(cssContent).toContain('color: red')
		})

		it('should compile JavaScript files', async () => {
			// Create a test block with JS
			const blockDir = path.join(
				projectDir,
				'blocks',
				'acf',
				'test-block'
			)
			await createMockBlock(blockDir, 'test-block')

			// Add some JS content
			await fs.writeFile(
				path.join(blockDir, 'test-block.js'),
				`console.log('Test block loaded');

        function initBlock() {
          console.log('Block initialized');
        }

        initBlock();`,
				'utf-8'
			)

			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			await compileProject(projectDir, config, false)

			// Check if the JS build file was created
			const buildDir = path.join(blockDir, 'build')
			const jsFile = path.join(buildDir, 'test-block.build.js')

			expect(
				await fs
					.access(jsFile)
					.then(() => true)
					.catch(() => false)
			).toBe(true)

			// Check JS content
			const jsContent = await fs.readFile(jsFile, 'utf-8')
			expect(jsContent).toContain('Test block loaded')
		})

		it('should handle production builds with minification', async () => {
			const blockDir = path.join(
				projectDir,
				'blocks',
				'acf',
				'test-block'
			)
			await createMockBlock(blockDir, 'test-block')

			// Add SCSS with comments and whitespace
			await fs.writeFile(
				path.join(blockDir, 'test-block.scss'),
				`/* This is a comment */
        .test-block {
          color: red;
          
          /* Another comment */
          font-size: 16px;
        }`,
				'utf-8'
			)

			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			// Compile in production mode
			await compileProject(projectDir, config, true)

			const cssFile = path.join(
				blockDir,
				'build',
				'test-block.build.css'
			)
			const cssContent = await fs.readFile(cssFile, 'utf-8')

			// In production, CSS should be minified (no comments, minimal whitespace)
			expect(cssContent).not.toContain('/* This is a comment */')
			expect(cssContent).not.toContain('/* Another comment */')
		})

		it('should respect external dependencies configuration', async () => {
			const blockDir = path.join(
				projectDir,
				'blocks',
				'acf',
				'test-block'
			)
			await createMockBlock(blockDir, 'test-block')

			// Add JS that uses jQuery
			await fs.writeFile(
				path.join(blockDir, 'test-block.js'),
				`import $ from 'jquery';

        $(document).ready(function() {
          console.log('jQuery is available');
        });`,
				'utf-8'
			)

			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			await compileProject(projectDir, config, false)

			const jsFile = path.join(
				blockDir,
				'build',
				'test-block.build.js'
			)
			const jsContent = await fs.readFile(jsFile, 'utf-8')

			// jQuery should be treated as external, not bundled
			expect(jsContent).toContain('jQuery')
		})

		it('should handle blocks without JavaScript files', async () => {
			const blockDir = path.join(
				projectDir,
				'blocks',
				'acf',
				'test-block'
			)
			await createMockBlock(blockDir, 'test-block')

			// Remove the JS file
			await fs.unlink(path.join(blockDir, 'test-block.js'))

			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			// Should not throw an error
			await expect(
				compileProject(projectDir, config, false)
			).resolves.not.toThrow()

			// Only CSS should be generated
			const buildDir = path.join(blockDir, 'build')
			const cssFile = path.join(buildDir, 'test-block.build.css')
			const jsFile = path.join(buildDir, 'test-block.build.js')

			expect(
				await fs
					.access(cssFile)
					.then(() => true)
					.catch(() => false)
			).toBe(true)
			expect(
				await fs
					.access(jsFile)
					.then(() => true)
					.catch(() => false)
			).toBe(false)
		})

		it('should handle multiple blocks in the same project', async () => {
			// Create two blocks
			const block1Dir = path.join(
				projectDir,
				'blocks',
				'acf',
				'block-one'
			)
			const block2Dir = path.join(
				projectDir,
				'blocks',
				'acf',
				'block-two'
			)

			await createMockBlock(block1Dir, 'block-one')
			await createMockBlock(block2Dir, 'block-two')

			// Add different content to each
			await fs.writeFile(
				path.join(block1Dir, 'block-one.scss'),
				'.block-one { color: red; }',
				'utf-8'
			)

			await fs.writeFile(
				path.join(block2Dir, 'block-two.scss'),
				'.block-two { color: blue; }',
				'utf-8'
			)

			const config = {
				cwd: projectDir,
				externals: { jquery: 'jQuery' },
				skip: []
			}

			await compileProject(projectDir, config, false)

			// Both blocks should be compiled
			const css1 = path.join(
				block1Dir,
				'build',
				'block-one.build.css'
			)
			const css2 = path.join(
				block2Dir,
				'build',
				'block-two.build.css'
			)

			expect(
				await fs
					.access(css1)
					.then(() => true)
					.catch(() => false)
			).toBe(true)
			expect(
				await fs
					.access(css2)
					.then(() => true)
					.catch(() => false)
			).toBe(true)

			const content1 = await fs.readFile(css1, 'utf-8')
			const content2 = await fs.readFile(css2, 'utf-8')

			expect(content1).toContain('.block-one')
			expect(content2).toContain('.block-two')
		})
	})
})
