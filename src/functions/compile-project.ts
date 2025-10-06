import path from 'path'

import getCompilables from './get-compilables.js'
import getDirectories from './get-directories.js'
import compile from './compile.js'

import { DeodarConfig } from '../types.js'
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

	compile(sourceEntries, '../build', config, production)

	for (const block of blocks) {
		compile(block, 'build', config, production)
	}
}

export default compileProject
