import { build, BuildOptions } from 'esbuild'
import { BUILD_START, BUILD_SUCCESS } from '../messages.js'

const safeBuild = async (
	options: BuildOptions,
	srcRel: string,
	outRel: string
) => {
	try {
		await build(options)
		console.log(BUILD_SUCCESS(srcRel, outRel))
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message)
		} else {
			console.error(err)
		}
	}
}

export default safeBuild
