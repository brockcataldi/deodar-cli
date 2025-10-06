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

const production = (): Command => {
	return new Command('production')
		.aliases(['p', 'prod'])
		.description('Build a Production Build of a Deodar Project')
		.action(action)
}

export default production;