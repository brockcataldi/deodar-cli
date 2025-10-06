import { Dirent, promises as fs } from 'fs'
import path from 'path'
import { EntryPoints } from '../types.js'

const getCompilables = async (location: string): Promise<EntryPoints> => {
	const entries = await fs.readdir(location, { withFileTypes: true })
	return entries
		.filter((entry) => entry.isFile())
		.map((entry): [Dirent<string>, string] => [
			entry,
			path.extname(entry.name)
		])
		.filter(([, ext]) => {
			return ext === '.scss' || ext === '.js'
		})
		.reduce(
			(accumulator, [entry, ext]): EntryPoints => {
				if (ext === '.scss') {
					return {
						...accumulator,
						scss: [
							...accumulator.scss,
							path.join(location, entry.name)
						]
					}
				}

				if (ext === '.js') {
					return {
						...accumulator,
						js: [
							...accumulator.js,
							path.join(location, entry.name)
						]
					}
				}

				return accumulator
			},
			{ scss: [], js: [] }
		)
}

export default getCompilables
