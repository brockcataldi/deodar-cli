import { Command } from 'commander'

import { initialize, compileProject } from '../functions/index.js'
import { INVALID_PROJECT_LOCATION } from '../functions/messages.js'

const productionCommand = (): Command => {
	return new Command('production')
		.alias('p')
		.description('Build a Production Build of a Deodar Project')
		.action(async () => {
			const config = await initialize()
			if (!config) {
				console.log(INVALID_PROJECT_LOCATION)
				return
			}

			await compileProject(config.cwd, config, false)
		})
}

export default productionCommand
