import { Command } from 'commander'
import chokidar, { FSWatcher } from 'chokidar'
import { Stats } from 'fs'

import {
	ERROR,
	INVALID_PROJECT_LOCATION,
	NOTICE
} from '../functions/messages.js'
import { initialize, compileProject } from '../functions/index.js'

/**
 * Determines if a file or directory should be ignored during file watching.
 *
 * @param {string} path - The file or directory path to check
 * @param {Stats | undefined} stats - File system stats for the path
 * @returns {boolean} True if the path should be ignored, false otherwise
 */
const ignored = (path: string, stats: Stats | undefined) => {
	if (
		path.includes('node_modules') ||
		path.includes('build') ||
		path.includes('.git')
	) {
		return true
	}

	if (!stats) {
		return false
	}

	if (stats.isDirectory()) {
		return false
	}

	if (path.includes('.build.')) {
		return true
	}

	if (!path.endsWith('.js') && !path.endsWith('.scss')) {
		return true
	}

	return false
}

/**
 * Handles the ready event when file watching starts.
 * Displays a notice message and resumes stdin for user input.
 */
const onReady = async () => {
	console.log(NOTICE('Watching for changes. Press Ctrl+C to stop\n'))
	process.stdin.resume()
}

/**
 * Handles errors that occur during file watching.
 *
 * @param {unknown} error - The error that occurred
 */
const onError = async (error: unknown) => {
	console.log(ERROR('Watcher error:'))
	console.log(error)
}

/**
 * Handles cleanup when the watcher is being shut down.
 * Gracefully closes the file watcher and exits the process.
 *
 * @param {FSWatcher} watcher - The file system watcher instance to close
 */
const onCleanUp = async (watcher: FSWatcher) => {
	console.log(NOTICE('\n\nShutting down watcher...'))
	await watcher.close()
	console.log(NOTICE('\n\nWatcher closed.'))
	process.exit(0)
}

/**
 * Creates a watch command for real-time development builds.
 *
 * This command starts a file watcher that monitors for changes to .js and .scss files
 * and automatically recompiles the project when changes are detected. Features include:
 * - Initial compilation on startup
 * - Real-time file watching with debouncing
 * - Graceful shutdown with Ctrl+C
 * - Error handling for build failures
 * - Prevention of concurrent compilation
 *
 * The command validates that the user is in a valid Deodar project directory
 * before starting the watch process.
 *
 * @returns {Command} Commander.js command instance for the 'watch' command
 */
const watchCommand = (): Command => {
	return new Command('watch')
		.alias('w')
		.description('Start a Watching Development Build')
		.action(async () => {
			const config = await initialize()

			if (!config) {
				console.log(INVALID_PROJECT_LOCATION)
				process.exit(1)
			}

			try {
				await compileProject(config.cwd, config, false)
			} catch (err) {
				process.exit(1)
			}

			const watcher = chokidar.watch('.', {
				ignoreInitial: true,
				ignored,
				persistent: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})

			let compiling = false

			watcher.once('ready', onReady)
			watcher.on('error', onError)
			process.on('SIGINT', () => onCleanUp(watcher))
			process.on('SIGTERM', () => onCleanUp(watcher))

			watcher.on('all', async () => {
				if (compiling) {
					return
				}

				compiling = true

				try {
					await compileProject(config.cwd, config, false)
				} catch (err) {
					console.log(ERROR('Build failed:'))
					console.log(err)
				}

				compiling = false
			})

			await new Promise(() => {})
		})
}

export default watchCommand
