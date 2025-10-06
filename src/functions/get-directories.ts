import { promises as fs } from 'fs'

const getDirectories = async (location: string) => {
	const entries = await fs.readdir(location, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
}

export default getDirectories
