import { Command } from 'commander'
import { input, select, confirm } from '@inquirer/prompts'
import { capitalCase, kebabCase } from 'change-case'
import path from 'path'

import { createBlock, exists, initialize } from '../functions/index.js'
import {
	ERROR,
	INVALID_PROJECT_LOCATION,
	SUCCESS
} from '../functions/messages.js'

/**
 * Creates a new ACF block with interactive prompts for configuration.
 *
 * This command guides users through creating a new WordPress block with:
 * - Block name/slug (auto-converted to kebab-case)
 * - Display title (auto-suggested from name)
 * - Category selection (text, media, design, widgets, theme, or custom)
 * - Optional JavaScript inclusion
 *
 * The command validates that the user is in a valid Deodar project directory
 * and checks for existing blocks to prevent overwrites.
 *
 * @returns {Command} Commander.js command instance for the 'new' command
 */
const newCommand = (): Command => {
	return new Command('new')
		.alias('n')
		.argument('[name]', 'name of the block')
		.description('Create a new block')
		.action(async (name?: string) => {
			try {
				const config = await initialize()

				if (!config) {
					console.log(INVALID_PROJECT_LOCATION)
					process.exit(1)
				}

			if (!name) {
				name = await input({
					message: 'What name/slug will your block have?',
					required: true
				})
			}

			const slug = kebabCase(name)

			const location = path.join(config.cwd, 'blocks', 'acf', slug)

			if (await exists(location)) {
				console.log(ERROR(`Block ${slug} already exists.`))
				process.exit(1)
			}

			const title = await input({
				message: 'What display label will your block have?',
				required: true,
				default: capitalCase(name)
			})

			const js = await confirm({
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

			const [result, data] = await createBlock(location, {
				title,
				slug,
				category,
				js
			})

			if (result) {
				console.log(SUCCESS(`${slug} was created.`))
				process.exit(0)
			} else {
				console.log(ERROR(`Error creating ${slug}`))
				console.log(data)
				process.exit(1)
			}
			} catch (error) {
				console.log(ERROR('Failed to create block'))
				if (error instanceof Error) {
					console.error(error.message)
				} else {
					console.error(error)
				}
				process.exit(1)
			}
		})
}

export default newCommand
