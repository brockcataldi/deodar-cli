import chalk from 'chalk'

export const INVALID_PROJECT_LOCATION = chalk.redBright(
	`You are not in the project folder, or you didn't name your plugin entry point correctly`
)

export const BUILD_START = chalk.gray('Build Started')
export const BUILD_END = chalk.gray('Build Finished')

export const BUILD_SUCCESS = (src: string, out: string) =>
	`${chalk.bgGreenBright(chalk.black(' Built '))} ${chalk.yellowBright(src)} ${chalk.gray(`to`)} ${chalk.greenBright(out)}`
