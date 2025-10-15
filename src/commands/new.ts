import { Command } from 'commander'
import { input, select, confirm } from '@inquirer/prompts'
import { capitalCase, kebabCase, pascalCase } from 'change-case'
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'

import { exists, initialize, writeTemplate } from '../functions.js'
import { ERROR, INVALID_PROJECT_LOCATION } from '../messages.js'

const newCommand = () => {
	return new Command('new')
		.alias('n')
		.argument('[name]', 'name of the block')
		.description('Create a new block')
		.action(async (name?: string) => {
			const config = await initialize()

			if (!config) {
				console.log(INVALID_PROJECT_LOCATION)
				process.exit(0)
			}

			if (!name) {
				name = await input({
					message: 'What name/slug will your block have?',
					required: true
				})
			}

			const slug = kebabCase(name)
			const newBlockDir = path.join(
				config.cwd,
				'blocks',
				'acf',
				slug
			)

			if (await exists(newBlockDir)) {
				console.log(ERROR(`Block ${slug} already exists.`))
				return
			}

			let title = await input({
				message: 'What display label will your block have?',
				required: true,
				default: capitalCase(name)
			})

			let js = await confirm({
				message: 'Do you want JS included?',
				default: false
			})

			let category: string = await select({
				message: 'What category is this block?',
				choices: [
					'text',
					'media',
					'design',
					'widgets',
					'theme',
					'custom'
				]
			})

			if (category === 'custom') {
				category = await input({
					message: 'What custom category does this block have?',
					required: true,
					default: 'deodar'
				})
			}

			try {
				await fs.mkdir(newBlockDir)

				writeTemplate(
					path.join(newBlockDir, 'block.json'),
					'block.json',
					{ title, slug, category, js }
				)

				writeTemplate(
					path.join(newBlockDir, `${slug}.php`),
					'block.php',
					{ title, slug }
				)

				writeTemplate(
					path.join(newBlockDir, `${slug}.scss`),
					'block.scss',
					{ slug }
				)

				if (js) {
					const pascal = pascalCase(slug)

					writeTemplate(
						path.join(newBlockDir, `${slug}.js`),
						'block.js',
						{ pascal, slug }
					)
				}
			} catch (err) {
				console.log(
					chalk.redBright('Error creating the block', err)
				)
				return
			}
		})
}

export default newCommand
