import { Command } from 'commander'
import fs from 'fs'
import path, { relative } from 'path'
import archiver, { ArchiverError } from 'archiver'
import micromatch from 'micromatch'

import { ERROR, INVALID_PROJECT_LOCATION, SUCCESS } from '../functions/messages.js'
import { exists, getIgnores, initialize } from '../functions/index.js'

const onClose = () => {
	console.log(SUCCESS(`Archive Created`))
}

const onError = (err: ArchiverError) => {
	console.log(ERROR("Couldn't create archive."))
	console.log(err)
}

const bundleCommand = (): Command => {
	return new Command('bundle')
		.alias('b')
		.description(
			'Bundle current Deodar project into a distributable archive'
		)
		.action(async (): Promise<void> => {
			const config = await initialize()

			if (!config) {
				console.log(INVALID_PROJECT_LOCATION)
				return
			}

			const baseName = path.basename(config.cwd)
			const distPath = path.join(config.cwd, 'dist')
			const archivePath = path.join(distPath, `${baseName}.zip`)
			const ignores = await getIgnores(config.cwd)

			if (!(await exists(distPath))) {
				fs.mkdirSync(distPath)
			}

			if (!(await exists(archivePath))) {
				fs.rmSync(archivePath)
			}

			const output = fs.createWriteStream(archivePath)
			output.on('close', onClose)

			const archive = archiver('zip', { zlib: { level: 9 } })
			archive.pipe(output)
			archive.on('error', onError)

			const walk = (location: string) => {
				const entries = fs.readdirSync(location, {
					withFileTypes: true
				})

				for (const entry of entries) {
					const fullPath = path.join(location, entry.name)
					const relativePath = path.relative(config.cwd, fullPath)

					if(micromatch.isMatch(relativePath, ignores, {
						dot: true
					})){
						continue;
					}

					if (entry.isDirectory()) {
						walk(fullPath)
					} else {
						archive.file(fullPath, { name: relativePath })
					}
				}
			}
			
			walk(config.cwd)
			await archive.finalize()
		})
}

export default bundleCommand
