import { Command } from 'commander'
import chalk from 'chalk'

import rightSpot from '../functions/right-spot.js'
import compileProject from '../functions/compile-project.js'

const action = async (): Promise<void> => {
	const [valid, cwd, config] = await rightSpot()
	if (!valid) {
		console.log(
			chalk.redBright(
				`You are not in the project folder, or you didn't name your plugin entry point correctly`
			)
		)
		return
	}

	await compileProject(cwd, config, false)
}

const development = (): Command => {
	return new Command('development')
		.aliases(['d', 'dev'])
		.description('Build a Development Build of a Deodar Project')
		.action(action)
}

export default development;