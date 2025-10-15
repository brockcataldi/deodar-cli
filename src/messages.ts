import chalk from 'chalk'

export const ERROR = (message: string) =>
	`${chalk.red('✘')} ${chalk.bgRed(chalk.white(' ERROR '))} ${message}`
export const SUCCESS = (message: string) =>
	`${chalk.green('✔')} ${chalk.bgGreen(chalk.black(' SUCCESS '))} ${message}`
export const NOTICE = (message: string) =>
	`  ${chalk.bgCyanBright(chalk.black(' NOTICE '))} ${message}`

export const INVALID_PROJECT_LOCATION = ERROR(
	chalk.bold.whiteBright(
		`You are not in the project folder, or you didn't name your plugin entry point correctly`
	)
)

export const BUILD_START = NOTICE('Started')
export const BUILD_END = NOTICE('Finished')

export const BUILD_SUCCESS = (src: string, out: string) =>
	SUCCESS(
		`${chalk.yellowBright(src)} ${chalk.gray(`to`)} ${chalk.greenBright(out)}`
	)
