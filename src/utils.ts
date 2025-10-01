import path from 'path'
import { promises as fs } from 'fs'

import { Spot } from './types.js'

export async function exists(file: string): Promise<boolean> {
	try {
		await fs.access(file)
		return true
	} catch {
		return false
	}
}

export async function rightSpot(): Promise<[boolean, string, Spot]> {
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

	if (pluginExistCheck) {
		return [true, cwd, Spot.PLUGIN]
	}

	if (themeExistChecks.every((i) => i === true)) {
		return [true, cwd, Spot.THEME]
	}

	return [false, cwd, Spot.INVALID]
}
