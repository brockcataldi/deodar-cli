import { sassPlugin } from 'esbuild-sass-plugin'
import path from 'path'

import getOutFile from './get-out-file.js'
import safeBuild from './safe-build.js'

import { EntryPoints, DeodarConfig } from '../types.js'

const compile = async (
	entryPoints: EntryPoints,
	location: string,
	config: DeodarConfig,
	production: boolean
) => {
	for (const styles of entryPoints.scss) {
		const outfile = getOutFile(styles, location, '.scss', '.build.css')

		await safeBuild(
			{
				entryPoints: [styles],
				outfile,
				bundle: true,
				plugins: [sassPlugin()],
				minify: production,
				sourcemap: !production
			},
			path.relative(config.cwd, styles),
			path.relative(config.cwd, outfile)
		)
	}

	for (const scripts of entryPoints.js) {
		const outfile = getOutFile(scripts, location, '.js', '.build.js')
		await safeBuild(
			{
				entryPoints: [scripts],
				outfile,
				bundle: true,
				minify: production,
				sourcemap: !production,
				external: config.externals ? config.externals : ['jquery'],
				format: 'iife'
			},
			path.relative(config.cwd, scripts),
			path.relative(config.cwd, outfile)
		)
	}
}

export default compile
