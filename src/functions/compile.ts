import { build } from 'esbuild'
import { sassPlugin } from 'esbuild-sass-plugin'

import getOutFile from './get-out-file.js'

import { EntryPoints, DeodarConfig } from '../types.js'

const compile = async (
	entryPoints: EntryPoints,
	location: string,
	config: DeodarConfig,
	production: boolean
) => {
	for (const styles of entryPoints.scss) {
		await build({
			entryPoints: [styles],
			outfile: getOutFile(styles, location, '.scss', '.build.css'),
			bundle: true,
			plugins: [sassPlugin()],
			minify: production,
			sourcemap: !production
		})
	}

	for (const scripts of entryPoints.js) {
		await build({
			entryPoints: [scripts],
			outfile: getOutFile(scripts, location, '.js', '.build.js'),
			bundle: true,
			minify: production,
			sourcemap: !production,
			external: config.externals ? config.externals : ['jquery'],
			format: 'iife'
		})
	}
}

export default compile
