#!/usr/bin/env node
import { Command } from 'commander'

import buildCommand from './commands/build.js'

const program = new Command()

program.name('Deodar').description('The Deodar CLI Tool').version('2.0.0')

program
	.command('build')
	.description('Build the Deodar Project')
	.action(buildCommand)

program.parse(process.argv)
