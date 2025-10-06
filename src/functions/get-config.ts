import { promises as fs } from 'fs'
import exists from './exists.js'

import { DeodarConfig } from '../types.js'

const getConfig = async (location: string): Promise<DeodarConfig> => {
	const doesExist: boolean = await exists(location)

	if (doesExist) {
		try {
			const data = await fs.readFile(location, 'utf-8')
			const parsed = JSON.parse(data) as DeodarConfig
			return parsed
		} catch (err) {
			return {}
		}
	}
	return {}
}

export default getConfig
