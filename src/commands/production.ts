import { Command } from 'commander'

import initialize from '../functions/initialize.js'
import compileProject from '../functions/compile-project.js'
import { INVALID_PROJECT_LOCATION } from '../messages.js'

const action = async (): Promise<void> => {
	const config = await initialize()
	if (!config) {
		console.log(INVALID_PROJECT_LOCATION)
		return
	}

	await compileProject(config.cwd, config, false)
}

const production = (): Command => {
	return new Command('production')
		.aliases(['p', 'prod'])
		.description('Build a Production Build of a Deodar Project')
		.action(action)
}

export default production
