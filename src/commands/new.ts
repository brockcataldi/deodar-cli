import { Command } from 'commander'
import { input, select, confirm } from '@inquirer/prompts'
import slugify from 'slugify'
import { titleCase } from 'title-case'
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'

import { exists, initialize, writeMustache } from '../functions.js'
import { INVALID_PROJECT_LOCATION } from '../messages.js'

const theme = async (name?: string) => {
	console.log('new Theme')
}

const plugin = async (name?: string) => {
	console.log('new Plugin')
}

const block = async (name?: string) => {
	const config = await initialize()

	if (!config) {
		console.log(INVALID_PROJECT_LOCATION)
		return
	}

	if (!name) {
		name = await input({
			message: 'What name/slug will your block have?',
            required: true
		})
	}

	const slug = slugify.default(name, { lower: true })
	const newBlockDir = path.join(config.cwd, 'blocks', 'acf', slug)

	if (await exists(newBlockDir)) {
		console.log(chalk.redBright(`Block ${slug} already exists.`))
		return
	}

	let title = await input({
		message: 'What display label will your block have?',
		required: true,
		default: titleCase(name)
	})

	let js = await confirm({
		message: 'Do you want JS included?',
		default: false
	})

	let category = await select({
		message: 'What category is this block?',
		choices: ['text', 'media', 'design', 'widgets', 'theme', 'custom']
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
	} catch (err) {
		console.log(chalk.redBright('Error creating directory', err))
		return
	}

    writeMustache(
        path.join(newBlockDir, 'block.json'),
        'block',
        'block.json',
        { title, slug, category, js }
    );

    writeMustache(
        path.join(newBlockDir, `${slug}.php`),
        'block',
        'block.php',
        { title, slug }
    );

    writeMustache(
        path.join(newBlockDir, `${slug}.scss`),
        'block',
        'block.scss',
        { slug }
    );
}

const newCommand = () => {
	return new Command('new')
		.alias('n')
		.argument('[type]', 'type of project or feature')
		.argument('[name]', 'name of new project or feature')
		.description('Scaffold a new Deodar Component or Project')
		.action(async (type?: string, name?: string) => {
			if (!type) {
				type = await select({
					message: 'What would you like to create?',
					choices: ['theme', 'plugin', 'block']
				})
			}

			switch (type) {
				case 't':
				case 'theme':
					return await theme(name)

				case 'p':
				case 'plugin':
					return await plugin(name)

				case 'b':
				case 'block':
					return await block(name)

				default:
					console.log(`Unknown type: ${type}`)
					return
			}
		})
}

export default newCommand
