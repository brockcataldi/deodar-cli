import path from 'path'

import exists from './exists.js'
import getConfig from './get-config.js'

import { DeodarConfig } from '../types.js'

const rightSpot = async (): Promise<[boolean, string, DeodarConfig]> => {
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

	const deodarConfig = await getConfig(path.join(cwd, `deodar.json`))

	if (pluginExistCheck) {
		return [true, cwd, deodarConfig]
	}

	if (themeExistChecks.every((i) => i === true)) {
		return [true, cwd, deodarConfig]
	}

	return [false, cwd, deodarConfig]
}

export default rightSpot
