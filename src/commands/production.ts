import { Command } from 'commander'

import rightSpot from '../functions/right-spot.js'
import compileProject from '../functions/compile-project.js'
import { INVALID_PROJECT_LOCATION } from '../messages.js'

const action = async (): Promise<void> => {
	const [valid, cwd, config] = await rightSpot()
	if (!valid) {
		console.log(INVALID_PROJECT_LOCATION)
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

export default production
