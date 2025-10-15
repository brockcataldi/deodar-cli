import { Command } from 'commander'
import chalk from 'chalk'
import chokidar, { FSWatcher } from 'chokidar'
import { Stats } from 'fs'

import { INVALID_PROJECT_LOCATION } from '../messages.js'
import { initialize, compileProject } from '../functions.js'

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

const onReady = async () => {
	console.log(chalk.blueBright('Watching for changes...'))
	console.log(chalk.gray(`Press Ctrl+C to stop\n`))
	process.stdin.resume()
}

const onError = async (error: unknown) => {
	console.error(chalk.redBright('Watcher error:'), error)
}

const onCleanUp = async (watcher: FSWatcher) => {
	console.log(chalk.yellow('\n\nShutting down watcher...'))
	await watcher.close()
	console.log(chalk.gray('Watcher closed.'))
	process.exit(0)
}

const action = async (): Promise<void> => {
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
			console.error(chalk.redBright('Build failed:'), err)
		}

		compiling = false
	})

	await new Promise(() => {})
}

const watchCommand = (): Command => {
	return new Command('watch')
		.alias('w')
		.description('Start a Watching Development Build')
		.action(action)
}

export default watchCommand
