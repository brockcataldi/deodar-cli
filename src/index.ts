#!/usr/bin/env node
import { Command } from 'commander'

import bundleCommand from './commands/bundle.js'
import developmentCommand from './commands/development.js'
import newCommand from './commands/new.js'
import productionCommand from './commands/production.js'
import watchCommand from './commands/watch.js'

const program = new Command()

program.name('Deodar').description('The Deodar CLI Tool').version('2.0.0')

program.addCommand(bundleCommand())
program.addCommand(developmentCommand())
program.addCommand(newCommand())
program.addCommand(productionCommand())
program.addCommand(watchCommand())

program.parse(process.argv)
