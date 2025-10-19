import { Command } from 'commander'

import { INVALID_PROJECT_LOCATION } from '../functions/messages.js'

import { initialize, compileProject } from '../functions/index.js'

/**
 * Creates a development build command for Deodar projects.
 * 
 * This command compiles all SCSS and JavaScript files in the project with:
 * - Source maps enabled for debugging
 * - Unminified output for easier development
 * - Fast compilation using esbuild
 * 
 * The command validates that the user is in a valid Deodar project directory
 * before attempting to compile assets.
 * 
 * @returns {Command} Commander.js command instance for the 'development' command
 */
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
