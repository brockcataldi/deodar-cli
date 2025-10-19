import { Command } from 'commander'

import { initialize, compileProject } from '../functions/index.js'
import { INVALID_PROJECT_LOCATION } from '../functions/messages.js'

/**
 * Creates a production build command for Deodar projects.
 * 
 * This command compiles all SCSS and JavaScript files in the project with:
 * - Minified output for optimal file sizes
 * - No source maps for production deployment
 * - Optimized compilation using esbuild
 * 
 * The command validates that the user is in a valid Deodar project directory
 * before attempting to compile assets for production.
 * 
 * @returns {Command} Commander.js command instance for the 'production' command
 */
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
