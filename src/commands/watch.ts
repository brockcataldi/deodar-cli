import { Command } from 'commander'
import chalk from 'chalk'
import chokidar from 'chokidar'
import path from 'path'
import { Stats } from 'fs'

import rightSpot from '../functions/right-spot.js'
import compileProject from '../functions/compile-project.js'

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

const action = async (): Promise<void> => {
	const [valid, cwd, config] = await rightSpot()

	if (!valid) {
		console.log(
			chalk.redBright(
				`You are not in the project folder, or you didn't name your plugin entry point correctly`
			)
		)
		process.exit(1)
	}

	console.log(chalk.gray('Running initial build...'))
	try {
		await compileProject(cwd, config, false)
		console.log(chalk.greenBright('Initial build complete!\n'))
	} catch (err) {
		console.error(chalk.redBright('Initial build failed:'), err)
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
	let isReady = false

	watcher.once('ready', () => {
		isReady = true
		console.log(chalk.blueBright('Watching for changes...'))
		console.log(chalk.gray(`Press Ctrl+C to stop\n`))
		process.stdin.resume()
	})

	watcher.on('all', async (event, filePath) => {
		if (!isReady || compiling) {
			return
		}

		compiling = true
		const relativePath = path.relative(cwd, filePath)

		console.log(chalk.yellowBright(`\n[${event}] ${relativePath}`))
		console.log(chalk.gray('Rebuilding...'))

		try {
			await compileProject(cwd, config, false)
			console.log(chalk.greenBright('Build complete!\n'))
		} catch (err) {
			console.error(chalk.redBright('Build failed:'), err)
		} finally {
			compiling = false
		}
	})

	watcher.on('error', (error) => {
		console.error(chalk.redBright('Watcher error:'), error)
	})

	const cleanup = async () => {
		console.log(chalk.yellow('\n\nShutting down watcher...'))
		await watcher.close()
		console.log(chalk.gray('Watcher closed.'))
		process.exit(0)
	}

	process.on('SIGINT', cleanup)
	process.on('SIGTERM', cleanup)

	await new Promise(() => {})
}

const watch = (): Command => {
	return new Command('watch')
		.aliases(['w', 'wat'])
		.description('Start a Watching Development Build')
		.action(action)
}


export default watch;