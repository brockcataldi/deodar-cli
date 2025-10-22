import { promises as fs } from 'fs'
import path from 'path'
import mustache from 'mustache'

import { EntryPoints, DeodarConfig, CreateBlockOptions } from '../types.js'
import { pascalCase } from 'change-case'

/**
 * Checks whether a file or directory exists.
 *
 * @param {string} file - Path to file or directory.
 * @returns {Promise<boolean>} True if exists, false otherwise.
 */
export const exists = async (file: string): Promise<boolean> => {
	try {
		await fs.access(file)
		return true
	} catch {
		return false
	}
}

/**
 * Retrieves files within a directory that can be compiled (.scss, .js).
 *
 * @param {string} location - Directory to search for compilable files.
 * @returns {Promise<EntryPoints>} Structure containing `scss` and `js` arrays.
 */
export const getCompilables = async (
	location: string
): Promise<EntryPoints> => {
	const result: EntryPoints = { scss: [], js: [] }
	try {
		const entries = await fs.readdir(location, { withFileTypes: true })

		for (const entry of entries) {
			if (!entry.isFile()) {
				continue
			}

			const ext = path.extname(entry.name)
			if (ext === '.scss') {
				result.scss.push(path.join(location, entry.name))
			}

			if (ext === '.js') {
				result.js.push(path.join(location, entry.name))
			}
		}
		return result
	} catch (err) {
		// Log error but return empty result to allow graceful degradation
		console.warn(`Warning: Failed to read directory ${location}:`, err instanceof Error ? err.message : err)
		return result
	}
}

/**
 * Loads and validates a `deodar.json` configuration file from the project.
 *
 * @param {string} cwd - Project's root directory.
 * @returns {Promise<DeodarConfig>} A valid configuration object.
 */
export const getConfig = async (cwd: string): Promise<DeodarConfig> => {
	const location = path.join(cwd, `deodar.json`)

	if (!(await exists(location))) {
		return { cwd }
	}

	try {
		const data = await fs.readFile(location, 'utf-8')
		const parsed = JSON.parse(data) as DeodarConfig
		return { ...parsed, cwd }
	} catch {
		return { cwd }
	}
}

/**
 * Returns all directories within a given path.
 *
 * @param {string} location - Directory path to scan.
 * @returns {Promise<string[]>} List of directory names.
 */
export const getDirectories = async (
	location: string
): Promise<string[]> => {
	const entries = await fs.readdir(location, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
}

/**
 * Reads the .bundleignore file to get patterns to ignore during bundle time.
 *
 * This function reads a .bundleignore file from the project root and returns
 * an array of glob patterns that should be excluded from the bundle archive.
 * Lines starting with '#' are treated as comments and ignored.
 *
 * @param {string} cwd - Project's root directory
 * @returns {Promise<string[]>} Array of ignore patterns for bundling
 */
export const getIgnores = async (cwd: string): Promise<string[]> => {
	const ignorePath = path.join(cwd, '.bundleignore')

	const ignorePatterns: string[] = []

	if (await exists(ignorePath)) {
		const content = await fs.readFile(ignorePath, 'utf-8')

		for (const line of content.split('\n')) {
			const trimmed = line.trim()
			if (trimmed.startsWith('#')) {
				continue
			}

			if (trimmed === '') {
				continue
			}

			ignorePatterns.push(trimmed)
		}
	}

	return ignorePatterns
}

/**
 * Writes a mustache template to a location
 *
 * @param {string} location - Where the file is being saved to.
 * @param {string} name - Template file name, without the .mustache.
 * @param {unknown} data - Template Data.
 *
 * @returns {Promise<[boolean, string | unknown]>} The result of write, either true and empty string or false and error.
 */
export const writeTemplate = async (
	location: string,
	name: string,
	data: unknown
): Promise<[boolean, string | unknown]> => {
	try {
		const template = await fs.readFile(
			path.resolve(
				import.meta.dirname,
				`../../templates/${name}.mustache`
			),
			'utf-8'
		)

		await fs.writeFile(location, mustache.render(template, data))

		return [true, '']
	} catch (err) {
		return [false, err]
	}
}

/**
 * Creates a new ACF block with all necessary files and templates.
 *
 * This function generates a complete block structure including:
 * - block.json: Block configuration file
 * - {slug}.php: PHP template file
 * - {slug}.scss: Stylesheet file
 * - {slug}.js: JavaScript file (if js option is true)
 *
 * All files are generated using Mustache templates with the provided options.
 * The function creates the block directory if it doesn't exist.
 *
 * @param {string} location - Directory path where the block should be created
 * @param {CreateBlockOptions} options - Block configuration options
 * @param {string} options.title - Display title for the block
 * @param {string} options.slug - URL-friendly slug for the block
 * @param {string} options.category - Block category (text, media, design, etc.)
 * @param {boolean} options.js - Whether to include JavaScript file
 * @returns {Promise<[boolean, unknown]>} Tuple of [success, error] where success is boolean and error is the error object if failed
 */
export const createBlock = async (
	location: string,
	{ title, slug, category, js }: CreateBlockOptions
): Promise<[boolean, unknown]> => {
	try {
		await fs.mkdir(location)

		await writeTemplate(
			path.join(location, 'block.json'),
			'block.json',
			{
				title,
				slug,
				category,
				js
			}
		)

		await writeTemplate(
			path.join(location, `${slug}.php`),
			'block.php',
			{
				title,
				slug
			}
		)

		await writeTemplate(
			path.join(location, `${slug}.scss`),
			'block.scss',
			{
				slug
			}
		)

		if (js) {
			const pascal = pascalCase(slug)

			await writeTemplate(
				path.join(location, `${slug}.js`),
				'block.js',
				{
					pascal,
					slug
				}
			)
		}

		return [true, undefined]
	} catch (err) {
		return [false, err]
	}
}
