import path from 'path'

import exists from './exists.js'
import getConfig from './get-config.js'

import { DeodarConfig } from '../types.js'

const initialize = async (): Promise<DeodarConfig | null> => {
	const cwd = process.cwd()
	const basename = path.basename(cwd)

	const pluginEntryPoint = path.join(cwd, `${basename}.php`)
	const themeRequiredFiles = [
		path.join(cwd, `functions.php`),
		path.join(cwd, `style.css`)
	]

	const pluginExistCheck: boolean = await exists(pluginEntryPoint)
	const themeExistChecks: boolean[] = await Promise.all(
		themeRequiredFiles.map(exists)
	)

	const deodarConfig = await getConfig(cwd)

	if (pluginExistCheck) {
		return deodarConfig
	}

	if (themeExistChecks.every((i) => i === true)) {
		return deodarConfig
	}

	return null
}

export default initialize
