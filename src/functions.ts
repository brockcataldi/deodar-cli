import { promises as fs } from 'fs'
import { sassPlugin } from 'esbuild-sass-plugin'
import path from 'path'
import { build, BuildOptions, Plugin } from 'esbuild'

import { BUILD_END, BUILD_START, BUILD_SUCCESS, ERROR } from './messages.js'
import { EntryPoints, DeodarConfig } from './types.js'
import mustache from 'mustache'

/**
 * Compiles a set of SCSS and JS entry points using esbuild.
 *
 * @param {EntryPoints} entryPoints - Lists of SCSS and JS files to compile.
 * @param {string} location - Relative location to output compiled files.
 * @param {DeodarConfig} config - Deodar configuration object.
 * @param {boolean} production - If true, enables minification and disables sourcemaps.
 */
export const compileEntryPoints = async (
	entryPoints: EntryPoints,
	location: string,
	config: DeodarConfig,
	production: boolean
) => {
	for (const styles of entryPoints.scss) {
		const outfile = getOutFile(styles, location, '.scss', '.build.css')

		await safeBuild(
			{
				entryPoints: [styles],
				outfile,
				bundle: true,
				plugins: [sassPlugin()],
				minify: production,
				sourcemap: !production
			},
			path.relative(config.cwd, styles),
			path.relative(config.cwd, outfile)
		)
	}
	for (const scripts of entryPoints.js) {
		const outfile = getOutFile(scripts, location, '.js', '.build.js')

		await safeBuild(
			{
				entryPoints: [scripts],
				outfile,
				bundle: true,
				minify: production,
				sourcemap: !production,
				external: config.externals
					? Object.keys(config.externals)
					: ['jquery'],
				plugins: [
					globalsAliasPlugin(
						config.externals
							? config.externals
							: {
									jquery: 'jQuery'
								}
					)
				],
				format: 'iife'
			},
			path.relative(config.cwd, scripts),
			path.relative(config.cwd, outfile)
		)
	}
}

/**
 * Compiles an entire project including "source" and "block" assets.
 *
 * @param {string} cwd - Current working directory of the project.
 * @param {DeodarConfig} config - Deodar configuration object.
 * @param {boolean} [production=false] - If true, enables production optimizations.
 */
export const compileProject = async (
	cwd: string,
	config: DeodarConfig,
	production: boolean = false
) => {
	const sourceEntries = await getCompilables(path.join(cwd, 'source'))

	const blocks: EntryPoints[] = []
	const blocksDir = path.join(cwd, 'blocks')
	const providers = await getDirectories(blocksDir)

	for (const provider of providers) {
		const providerDir = path.join(blocksDir, provider)
		const providerDirEntries = await getDirectories(providerDir)

		for (const block of providerDirEntries) {
			blocks.push(
				await getCompilables(path.join(providerDir, block))
			)
		}
	}

	console.log(BUILD_START)

	await compileEntryPoints(sourceEntries, '../build', config, production)
	for (const block of blocks) {
		await compileEntryPoints(block, 'build', config, production)
	}

	await addIndexes(cwd, config);
	console.log(BUILD_END)
}

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
 * Computes the output file path for a given entry file.
 *
 * @param {string} entry - Full path to source file.
 * @param {string} change - Relative directory to place compiled file in.
 * @param {string} entryType - Original file extension (e.g. `.scss`).
 * @param {string} outType - New output file extension (e.g. `.build.css`).
 * @returns {string} The resolved output file path.
 */
export const getOutFile = (
	entry: string,
	change: string,
	entryType: string,
	outType: string
): string => {
	const basename = path.basename(entry)
	const dirname = path.dirname(entry)
	return path.resolve(
		dirname,
		change,
		basename.replace(entryType, outType)
	)
}

/**
 * esbuild plugin to pass to externals to work with the import issue.
 *
 * @param {{[key: string]: string}} globals - The externalized globals
 * @returns void
 */
export function globalsAliasPlugin(globals: {
	[key: string]: string
}): Plugin {
	return {
		name: 'globals-alias',
		setup(build) {
			for (const [pkg, globalVar] of Object.entries(globals)) {
				const namespace = `global-alias:${pkg}`

				build.onResolve(
					{ filter: new RegExp(`^${pkg}$`) },
					() => ({
						path: pkg,
						namespace
					})
				)

				build.onLoad({ filter: /.*/, namespace }, () => ({
					contents: `
            const globalValue = window.${globalVar};
            export default globalValue;
            export { globalValue };
          `,
					loader: 'js'
				}))
			}
		}
	}
}

/**
 * Initializes and validates a Deodar-compatible environment.
 * Detects whether the current working directory is a plugin or a theme.
 *
 * @returns {Promise<DeodarConfig | null>} Valid configuration if Deodar-compatible, otherwise null.
 */
export const initialize = async (): Promise<DeodarConfig | null> => {
	const cwd = process.cwd()
	const basename = path.basename(cwd)

	const pluginEntryPoint = path.join(cwd, `${basename}.php`)
	const themeRequiredFiles = [
		path.join(cwd, `functions.php`),
		path.join(cwd, `style.css`)
	]

	const pluginExistCheck = await exists(pluginEntryPoint)
	const themeExistChecks = await Promise.all(
		themeRequiredFiles.map(exists)
	)
	const deodarConfig = await getConfig(cwd)

	// Determine if project is a plugin or theme
	if (pluginExistCheck) return deodarConfig
	if (themeExistChecks.every((exists) => exists)) return deodarConfig

	return null
}

/**
 * Runs a safe build using esbuild, reporting success or failure.
 *
 * @param {BuildOptions} options - esbuild configuration options.
 * @param {string} srcRel - Relative path of the source file.
 * @param {string} outRel - Relative path of the output file.
 */
export const safeBuild = async (
	options: BuildOptions,
	srcRel: string,
	outRel: string
) => {
	try {
		await build(options)
		console.log(BUILD_SUCCESS(srcRel, outRel))
	} catch (err) {
		if (err instanceof Error) console.error(err.message)
		else console.error(err)
	}
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
				`../templates/${name}.mustache`
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
 * Recursively ensures every directory contains an index.php file,
 * skipping directories based on DeodarConfig or defaults.
 *
 * @param {string} root - Directory to begin scanning from.
 * @param {DeodarConfig} config - Configuration object (may include skips).
 * @returns {Promise<void>}
 */
export const addIndexes = async (
	root: string,
	config: DeodarConfig
): Promise<void> => {
	const skips = new Set(
		config.skip && Array.isArray(config.skip)
			? config.skip
			: []
	)

	const folderName = path.basename(root)
	if (skips.has(folderName)) {
		return
	}

	const indexPath = path.join(root, 'index.php')
	if (!(await exists(indexPath))) {
		const [ok, err] = await writeTemplate(indexPath, 'index.php', {})
		if (!ok) {
			console.log(ERROR(`Failed to write ${indexPath}`))
			console.log(err);
		}
	}

	const subdirs = await getDirectories(root)
	for (const dir of subdirs) {
		const child = path.join(root, dir)
		await addIndexes(child, config)
	}
}