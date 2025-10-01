import chalk from 'chalk'
import { rightSpot } from '../utils.js'

async function buildCommand() {
	const [valid, cwd, type] = await rightSpot()

	if (!valid) {
		console.log(
			chalk.redBright(
				`You are not in the project folder, or you didn't name your plugin entry point correctly`
			)
		)
		return
	}

	console.log(chalk.greenBright(`You're in the right spot`))
}

export default buildCommand
