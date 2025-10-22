import { promises as fs } from 'fs'
import path from 'path'
import { tmpdir } from 'os'

/**
 * Test utilities for creating temporary directories and files
 * to use in unit and integration tests.
 */

/**
 * Creates a temporary directory for testing.
 *
 * @param {string} prefix - Prefix for the temporary directory name
 * @returns {Promise<string>} Path to the created temporary directory
 */
export const createTempDir = async (
	prefix = 'deodar-test'
): Promise<string> => {
	const tempDir = await fs.mkdtemp(path.join(tmpdir(), prefix))
	return tempDir
}

/**
 * Creates a temporary file with the given content.
 *
 * @param {string} content - Content to write to the file
 * @param {string} extension - File extension (e.g., '.js', '.scss', '.php')
 * @param {string} dir - Directory to create the file in (optional)
 * @returns {Promise<string>} Path to the created file
 */
export const createTempFile = async (
	content: string,
	extension = '.txt',
	dir?: string
): Promise<string> => {
	const tempDir = dir || (await createTempDir())
	const fileName = `test-${Date.now()}${extension}`
	const filePath = path.join(tempDir, fileName)

	await fs.writeFile(filePath, content, 'utf-8')
	return filePath
}

/**
 * Creates a mock Deodar project structure for testing.
 *
 * @param {string} baseDir - Base directory to create the project in
 * @returns {Promise<string>} Path to the created project directory
 */
export const createMockProject = async (
	baseDir?: string
): Promise<string> => {
	const projectDir = baseDir || (await createTempDir('deodar-project'))

	// Create main plugin file
	await fs.writeFile(
		path.join(projectDir, 'test-plugin.php'),
		'<?php\n/* Plugin Name: Test Plugin */\n',
		'utf-8'
	)

	// Create blocks directory structure
	await fs.mkdir(path.join(projectDir, 'blocks', 'acf'), {
		recursive: true
	})

	// Create deodar.json config
	await fs.writeFile(
		path.join(projectDir, 'deodar.json'),
		JSON.stringify(
			{
				externals: {
					jquery: 'jQuery'
				},
				skip: ['node_modules/**']
			},
			null,
			2
		),
		'utf-8'
	)

	return projectDir
}

/**
 * Creates a mock block directory with all necessary files.
 *
 * @param {string} blockDir - Directory to create the block in
 * @param {string} slug - Block slug
 * @returns {Promise<void>}
 */
export const createMockBlock = async (
	blockDir: string,
	slug: string
): Promise<void> => {
	await fs.mkdir(blockDir, { recursive: true })

	// Create block.json
	await fs.writeFile(
		path.join(blockDir, 'block.json'),
		JSON.stringify(
			{
				name: `acf/${slug}`,
				title: 'Test Block',
				description: 'A test block',
				category: 'text'
			},
			null,
			2
		),
		'utf-8'
	)

	// Create PHP template
	await fs.writeFile(
		path.join(blockDir, `${slug}.php`),
		'<?php\n// Test block template\n',
		'utf-8'
	)

	// Create SCSS file
	await fs.writeFile(
		path.join(blockDir, `${slug}.scss`),
		`.${slug} {\n  color: red;\n}`,
		'utf-8'
	)

	// Create JS file
	await fs.writeFile(
		path.join(blockDir, `${slug}.js`),
		'console.log("Test block loaded");',
		'utf-8'
	)
}

/**
 * Cleans up a temporary directory and all its contents.
 *
 * @param {string} dir - Directory to clean up
 * @returns {Promise<void>}
 */
export const cleanupTempDir = async (dir: string): Promise<void> => {
	try {
		await fs.rm(dir, { recursive: true, force: true })
	} catch (error) {
		// Ignore cleanup errors in tests
		console.warn(`Failed to cleanup temp dir: ${dir}`, error)
	}
}

/**
 * Waits for a specified amount of time.
 * Useful for testing async operations.
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Captures console output during test execution.
 *
 * @param {Function} fn - Function to execute while capturing output
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export const captureConsole = async (
	fn: () => Promise<void> | void
): Promise<{
	stdout: string
	stderr: string
}> => {
	const originalStdout = process.stdout.write
	const originalStderr = process.stderr.write

	let stdout = ''
	let stderr = ''

	process.stdout.write = (chunk: string | Buffer | Uint8Array) => {
		stdout += chunk.toString()
		return true
	}

	process.stderr.write = (chunk: string | Buffer | Uint8Array) => {
		stderr += chunk.toString()
		return true
	}

	try {
		await fn()
	} finally {
		process.stdout.write = originalStdout
		process.stderr.write = originalStderr
	}

	return { stdout, stderr }
}
