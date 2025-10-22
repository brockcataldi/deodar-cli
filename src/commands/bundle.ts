import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import archiver, { ArchiverError } from 'archiver'
import micromatch from 'micromatch'

import {
	ERROR,
	INVALID_PROJECT_LOCATION,
	SUCCESS
} from '../functions/messages.js'
import { exists, getIgnores, initialize } from '../functions/index.js'
import { DeodarConfig } from '../types.js'

/**
 * Handles the successful completion of archive creation.
 * Displays a success message to the user.
 */
const onClose = () => {
	console.log(SUCCESS(`Archive Created`))
}

/**
 * Handles errors that occur during archive creation.
 *
 * @param {ArchiverError} err - The archiver error that occurred
 */
const onError = (err: ArchiverError) => {
	console.log(ERROR("Couldn't create archive."))
	console.log(err)
}

/**
 * Creates a bundle command for packaging Deodar projects into distributable archives.
 *
 * This command creates a ZIP archive of the current Deodar project with:
 * - High compression (level 9) for optimal file sizes
 * - Respect for .bundleignore patterns to exclude development files
 * - Automatic creation of dist directory if it doesn't exist
 * - Project name-based archive naming
 *
 * The command validates that the user is in a valid Deodar project directory
 * before creating the archive.
 *
 * @returns {Command} Commander.js command instance for the 'bundle' command
 */
const bundleCommand = (): Command => {
	return new Command('bundle')
		.alias('b')
		.description(
			'Bundle current Deodar project into a distributable archive'
		)
		.action(async (): Promise<void> => {
			let config: Awaited<ReturnType<typeof initialize>>
			
			try {
				config = await initialize()

				if (!config) {
					console.log(INVALID_PROJECT_LOCATION)
					process.exit(1)
				}

				const baseName = path.basename(config.cwd)
				const distPath = path.join(config.cwd, 'dist')
				const archivePath = path.join(distPath, `${baseName}.zip`)
				const ignores = await getIgnores(config.cwd)

				if (!(await exists(distPath))) {
					fs.mkdirSync(distPath, { recursive: true })
				}

				if (await exists(archivePath)) {
					fs.rmSync(archivePath)
				}

				// Create the archive
				const output = fs.createWriteStream(archivePath)
				output.on('close', onClose)
				output.on('error', (err) => {
					console.log(ERROR('Failed to create archive file'))
					console.error(err)
					process.exit(1)
				})

				const archive = archiver('zip', { zlib: { level: 9 } })
				archive.pipe(output)
				archive.on('error', onError)

				const walk = (location: string, config: DeodarConfig) => {
					try {
						const entries = fs.readdirSync(location, {
							withFileTypes: true
						})

						for (const entry of entries) {
							const fullPath = path.join(location, entry.name)
							const relativePath = path.relative(
								config.cwd,
								fullPath
							)

							if (
								micromatch.isMatch(relativePath, ignores, {
									dot: true
								})
							) {
								continue
							}

							if (entry.isDirectory()) {
								walk(fullPath, config)
							} else {
								archive.file(fullPath, { name: relativePath })
							}
						}
					} catch (err) {
						console.log(ERROR(`Failed to read directory: ${location}`))
						if (err instanceof Error) {
							console.error(err.message)
						} else {
							console.error(err)
						}
						throw err
					}
				}

				walk(config.cwd, config)
				await archive.finalize()
			} catch (error) {
				console.log(ERROR('Failed to create archive'))
				if (error instanceof Error) {
					console.error(error.message)
				} else {
					console.error(error)
				}
				process.exit(1)
			}
		})
}

export default bundleCommand
