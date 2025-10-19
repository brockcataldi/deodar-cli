import path from 'path'
import { exists, getConfig } from './file-system.js'
import { DeodarConfig } from '../types.js'

/**
 * Initializes and validates a Deodar-compatible environment.
 * Detects whether the current working directory is a plugin or a theme.
 *
 * @returns {Promise<DeodarConfig | null>} Valid configuration if Deodar-compatible, otherwise null.
 */
export const initialize = async (): Promise<DeodarConfig | null> => {
	const cwd = process.cwd()
	const basename = path.basename(cwd)

	const pluginEntryPoint = path.join(cwd, `${basename}.php`)
	const themeRequiredFiles = [
		path.join(cwd, `functions.php`),
		path.join(cwd, `style.css`)
	]

	const pluginExistCheck = await exists(pluginEntryPoint)
	const themeExistChecks = await Promise.all(
		themeRequiredFiles.map(exists)
	)
	const deodarConfig = await getConfig(cwd)

	if (pluginExistCheck) {
		return deodarConfig
	}
	if (themeExistChecks.every((exists) => exists)) {
		return deodarConfig
	}

	return null
}
