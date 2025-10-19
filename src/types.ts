export type EntryPoints = { scss: string[]; js: string[] }

export type DeodarConfig = {
	externals?: Record<string, string>
	skip?: string[]
	cwd: string
}

export type CreateBlockOptions = {
	title: string
	slug: string
	category: string
	js: boolean
}
