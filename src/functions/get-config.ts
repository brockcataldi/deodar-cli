import { promises as fs } from 'fs'
import path from 'path'

import exists from './exists.js'

import { DeodarConfig } from '../types.js'

const getConfig = async (cwd: string): Promise<DeodarConfig> => {
	const location = path.join(cwd, `deodar.json`)
	const doesExist: boolean = await exists(location)

	if (doesExist) {
		try {
			const data = await fs.readFile(location, 'utf-8')
			const parsed = JSON.parse(data) as DeodarConfig
			return { ...parsed, cwd }
		} catch (err) {
			return { cwd }
		}
	}
	return { cwd }
}

export default getConfig
