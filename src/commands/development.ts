import { Command } from 'commander'

import { INVALID_PROJECT_LOCATION } from '../messages.js'

import { initialize, compileProject } from '../functions.js'

const developmentCommand = (): Command => {
	return new Command('development')
		.alias('d')
		.description('Build a Development Build of a Deodar Project')
		.action(async (): Promise<void> => {
			const config = await initialize()

			if (!config) {
				console.log(INVALID_PROJECT_LOCATION)
				return
			}

			await compileProject(config.cwd, config, false)
		})
}

export default developmentCommand
