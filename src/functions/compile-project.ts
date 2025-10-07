import path from 'path'

import getCompilables from './get-compilables.js'
import getDirectories from './get-directories.js'
import compile from './compile.js'

import { DeodarConfig } from '../types.js'
import { BUILD_END, BUILD_START } from '../messages.js'

const compileProject = async (
	cwd: string,
	config: DeodarConfig,
	production: boolean = false
) => {
	const sourceDir = path.join(cwd, 'source')
	const sourceEntries = await getCompilables(sourceDir)

	const blocks = []

	const blocksDir = path.join(cwd, 'blocks')
	const providers = await getDirectories(blocksDir)

	for (const provider of providers) {
		const providerDir = path.join(blocksDir, provider)
		const providerDirEntries = await getDirectories(providerDir)

		for (const block of providerDirEntries) {
			blocks.push(
				await getCompilables(path.join(providerDir, block))
			)
		}
	}

	console.log(BUILD_START)

	await compile(sourceEntries, '../build', config, production)

	for (const block of blocks) {
		await compile(block, 'build', config, production)
	}

	console.log(BUILD_END)
}

export default compileProject
