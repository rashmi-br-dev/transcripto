#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './init';
import { scanCommand } from './scan';
import { replaceCommand } from './replace';
import { generateCommand } from './generate';
import { reportCommand } from './report';
import { watchCommand } from './watch';

const program = new Command();

program
  .name('devlingo')
  .description('Automated localization CLI that scans projects and generates i18n files')
  .version('1.1.5');

program
  .command('init')
  .description('Initialize DevLingo in your project')
  .option('--yes', 'Run in non-interactive mode')
  .action(initCommand);

program
  .command('scan')
  .description('Scan project for UI text strings')
  .action(scanCommand);

program
  .command('replace')
  .description('Replace inline UI text with localization constants')
  .action(replaceCommand);

program
  .command('generate')
  .description('Generate i18n translation files')
  .action(generateCommand);

program
  .command('watch')
  .description('Watch for file changes and auto-update translations')
  .option('--yes', 'Run in non-interactive mode')
  .action(watchCommand);

program
  .command('report')
  .description('Show localization coverage report')
  .action(reportCommand);

program.parse();
