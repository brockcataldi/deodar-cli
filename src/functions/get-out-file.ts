import path from 'path'

export const getOutFile = (
	entry: string,
	change: string,
	entryType: string,
	outType: string
) => {
	const basename = path.basename(entry)
	const dirname = path.dirname(entry)
	return path.resolve(
		dirname,
		change,
		basename.replace(entryType, outType)
	)
}

export default getOutFile
