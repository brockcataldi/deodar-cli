#!/usr/bin/env node
import { Command } from 'commander'

import bundleCommand from './commands/bundle.js'
import developmentCommand from './commands/development.js'
import newCommand from './commands/new.js'
import productionCommand from './commands/production.js'
import watchCommand from './commands/watch.js'

/**
 * Main entry point for the Deodar CLI application.
 *
 * This file sets up the Commander.js CLI interface and registers all available commands:
 * - new: Create new ACF blocks with interactive prompts
 * - development: Build development version with source maps
 * - production: Build production version with minification
 * - watch: Start file watcher for real-time development
 * - bundle: Create distributable ZIP archives
 *
 * The CLI tool is designed for WordPress developers working with ACF blocks,
 * providing a streamlined workflow for block creation, asset compilation, and project distribution.
 */

const program = new Command()

program.name('Deodar').description('The Deodar CLI Tool').version('2.0.0')

// Register all available commands
program.addCommand(bundleCommand())
program.addCommand(developmentCommand())
program.addCommand(newCommand())
program.addCommand(productionCommand())
program.addCommand(watchCommand())

// Parse command line arguments and execute the appropriate command
program.parse(process.argv)
