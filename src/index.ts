#!/usr/bin/env node
import { Command } from 'commander'

import development from './commands/development.js'
import production from './commands/production.js'
import watch from './commands/watch.js'

const program = new Command()

program.name('Deodar').description('The Deodar CLI Tool').version('2.0.0')

program.addCommand(development())
program.addCommand(production())
program.addCommand(watch())

program.parse(process.argv)
