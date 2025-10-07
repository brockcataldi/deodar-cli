import { Command } from 'commander'

import { initialize, compileProject } from '../functions.js'
import { INVALID_PROJECT_LOCATION } from '../messages.js'

const action = async (): Promise<void> => {
	const config = await initialize()
	if (!config) {
		console.log(INVALID_PROJECT_LOCATION)
		return
	}

	await compileProject(config.cwd, config, false)
}

const productionCommand = (): Command => {
	return new Command('production')
		.alias('p')
		.description('Build a Production Build of a Deodar Project')
		.action(action)
}

export default productionCommand
