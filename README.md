# Deodar CLI

A powerful command-line tool for building and managing WordPress blocks with Advanced Custom Fields (ACF). Deodar CLI streamlines the development workflow for creating custom Gutenberg blocks with integrated SCSS compilation, JavaScript bundling, and automated file generation.

## Features

- **Block Generation**: Create new ACF blocks with interactive prompts
- **Asset Bundling**: Compile SCSS and JavaScript files using esbuild
- **Watch Mode**: Real-time compilation during development
- **Build Modes**: Development and production builds with optimization
- **Project Bundling**: Create distributable archives of your projects

## Installation _(In Process)_

```bash
npm install -g deodar-cli
```

Or use it directly with npx:

```bash
npx deodar-cli [command]
```

## Prerequisites

Deodar CLI works with WordPress plugins and themes that follow the Deodar structure:

- **For Plugins**: Must have a main plugin file (e.g., `plugin-name.php`)
- **For Themes**: Must have `functions.php` and `style.css` files

## Commands

### `deodar new [name]` (alias: `n`)

Create a new ACF block with interactive prompts.

```bash
deodar new my-awesome-block
```

**Interactive prompts:**

- Block name/slug
- Display title
- Category (text, media, design, widgets, theme, or custom)
- Include JavaScript (optional)

**Generated files:**

- `block.json` - Block configuration
- `block.php` - PHP template
- `block.scss` - Stylesheet
- `block.js` - JavaScript (if selected)

### `deodar development` (alias: `d`)

Build a development version of your Deodar project with source maps and unminified assets.

```bash
deodar development
```

### `deodar production` (alias: `p`)

Build a production version of your Deodar project with minified assets and no source maps.

```bash
deodar production
```

### `deodar watch` (alias: `w`)

Start a development server that watches for file changes and automatically recompiles assets.

```bash
deodar watch
```

**Features:**

- Watches `.js` and `.scss` files
- Ignores `node_modules`, `build`, and `.git` directories
- Automatic recompilation on file changes
- Graceful shutdown with Ctrl+C

### `deodar bundle` (alias: `b`)

Create a distributable ZIP archive of your current Deodar project.

```bash
deodar bundle
```

**Features:**

- Creates a ZIP file in the `dist/` directory
- Respects `.gitignore` patterns within a `.bundleignore` file
- Excludes development files and dependencies
- High compression (level 9)

## Project Structure

A typical Deodar project structure looks like this:

```
your-project/
├── blocks/
│   └── acf/
│       └── your-block/
│           ├── block.json
│           ├── block.php
│           ├── block.scss
│           ├── block.js (optional)
│           └── build/
│               ├── your-block.build.css
│               └── your-block.build.js
├── dist/
│   └── your-project.zip
├── deodar.config.js (optional)
└── your-main-file.php
```

## Configuration

Create a `deodar.config.js` file in your project root to customize the build process:

```javascript
export default {
	// External dependencies to exclude from bundling
	externals: {
		jquery: 'jQuery',
		lodash: '_'
	},

	// Files/directories to skip during bundling
	skip: ['node_modules/**', 'dist/**']
}
```

## Development Workflow

1. **Initialize a new block:**

    ```bash
    deodar new my-block
    ```

2. **Start development with watch mode:**

    ```bash
    deodar watch
    ```

3. **Build for production:**

    ```bash
    deodar production
    ```

4. **Create distribution package:**
    ```bash
    deodar bundle
    ```

## Build Process

Deodar CLI uses esbuild for fast compilation:

- **SCSS**: Compiled to CSS with Sass support
- **JavaScript**: Bundled and transpiled
- **Source Maps**: Generated in development mode
- **Minification**: Applied in production mode
- **External Dependencies**: Configurable exclusions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Version

Current version: 2.0.0

---

For more information and examples, visit the [project repository](https://github.com/brockcataldi/deodar-cli).
