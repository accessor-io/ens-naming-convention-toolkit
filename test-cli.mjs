#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('test-cli')
  .description('Test CLI')
  .version('1.0.0');

program
  .command('test')
  .description('Test command')
  .action((options) => {
    console.log('Test command executed');
    console.log('Options:', options);
  });

program.parse();
