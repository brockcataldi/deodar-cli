import { Command } from 'commander'

import { INVALID_PROJECT_LOCATION } from '../messages.js'

import initialize from '../functions/initialize.js'
import compileProject from '../functions/compile-project.js'

const action = async (): Promise<void> => {
	const config = await initialize()

	if (!config) {
		console.log(INVALID_PROJECT_LOCATION)
		return
	}

	await compileProject(config.cwd, config, false)
}

const development = (): Command => {
	return new Command('development')
		.aliases(['d', 'dev'])
		.description('Build a Development Build of a Deodar Project')
		.action(action)
}

export default development
