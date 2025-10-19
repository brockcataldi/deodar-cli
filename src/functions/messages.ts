import chalk from 'chalk'

/**
 * Creates a formatted error message with red styling and error icon.
 *
 * @param {string} message - The error message to display
 * @returns {string} Formatted error message with styling
 */
export const ERROR = (message: string) =>
	`${chalk.red('✘')} ${chalk.bgRed(chalk.white(' ERROR '))} ${message}`

/**
 * Creates a formatted success message with green styling and success icon.
 *
 * @param {string} message - The success message to display
 * @returns {string} Formatted success message with styling
 */
export const SUCCESS = (message: string) =>
	`${chalk.green('✔')} ${chalk.bgGreen(chalk.black(' SUCCESS '))} ${message}`

/**
 * Creates a formatted notice message with cyan styling.
 *
 * @param {string} message - The notice message to display
 * @returns {string} Formatted notice message with styling
 */
export const NOTICE = (message: string) =>
	`  ${chalk.bgCyanBright(chalk.black(' NOTICE '))} ${message}`

/**
 * Pre-formatted error message for invalid project locations.
 * Indicates that the user is not in a valid Deodar project directory.
 */
export const INVALID_PROJECT_LOCATION = ERROR(
	chalk.bold.whiteBright(
		`You are not in the project folder, or you didn't name your plugin entry point correctly`
	)
)

/**
 * Pre-formatted notice message indicating build process has started.
 */
export const BUILD_START = NOTICE('Started')

/**
 * Pre-formatted notice message indicating build process has finished.
 */
export const BUILD_END = NOTICE('Finished')

/**
 * Creates a formatted success message for successful file compilation.
 * Shows the source file path and output file path with color coding.
 *
 * @param {string} src - Source file path
 * @param {string} out - Output file path
 * @returns {string} Formatted build success message
 */
export const BUILD_SUCCESS = (src: string, out: string) =>
	SUCCESS(
		`${chalk.yellowBright(src)} ${chalk.gray(`to`)} ${chalk.greenBright(out)}`
	)
