import { select } from '@inquirer/prompts'
import { Command, CommandOptions } from 'commander'

const theme = async (name?: string) => {
	console.log('new Theme')
}

const plugin = async (name?: string) => {
	console.log('new Plugin')
}

const block = async (name?: string) => {
	console.log('new block')
}

const action = async (type?: string, name?: string) => {
	if (!type) {
		type = await select({
			message: 'What would you like to create?',
			choices: ['theme', 'plugin', 'block']
		})
	}

	switch (type) {
		case 't':
		case 'theme':
			await theme()
			break

		case 'p':
		case 'plugin':
			await plugin()
			break

		case 'b':
		case 'block':
			await block()
			break

		default:
			console.log(`Unknown type: ${type}`)
			return
	}
}

const newCommand = () => {
	return new Command('new')
		.alias('n')
		.argument('[type]', 'type of project or feature')
		.argument('[name]', 'name of new project or feature')
		.description('Scaffold a new Deodar Component or Project')
		.action(action)
}

export default newCommand
