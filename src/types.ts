/**
 * Represents the entry points for compilation, organized by file type.
 * Used to group SCSS and JavaScript files that need to be compiled.
 */
export type EntryPoints = { 
	/** Array of SCSS file paths to compile */
	scss: string[]
	/** Array of JavaScript file paths to compile */
	js: string[] 
}

/**
 * Configuration object for Deodar projects.
 * Defines how the build process should handle external dependencies and file exclusions.
 */
export type DeodarConfig = {
	/** External dependencies to exclude from bundling (e.g., 'jquery': 'jQuery') */
	externals?: Record<string, string>
	/** File patterns to skip during compilation or bundling */
	skip?: string[]
	/** Current working directory of the project */
	cwd: string
}

/**
 * Options for creating a new ACF block.
 * Defines the properties needed to generate a complete block structure.
 */
export type CreateBlockOptions = {
	/** Display title for the block (shown in WordPress admin) */
	title: string
	/** URL-friendly slug for the block (used in file names and block registration) */
	slug: string
	/** Block category (text, media, design, widgets, theme, or custom) */
	category: string
	/** Whether to include a JavaScript file for the block */
	js: boolean
}
