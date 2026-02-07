#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './generate';
import { initCommand } from './init';
import { reportCommand } from './report';
import { scanCommand } from './scan';
import { watchCommand } from './watch';
import { watchI18nCommand } from './watch-i18n';

const program = new Command();

program
  .name('transcripto')
  .description('Automated localization CLI that scans projects and generates i18n files')
  .version('1.1.5');

program
  .command('init')
  .description('Initialize Transcripto in your project')
  .option('--yes', 'Run in non-interactive mode')
  .action(initCommand);

program
  .command('scan')
  .description('Scan project for UI text strings')
  .action(scanCommand);

program
  .command('generate')
  .description('Generate i18n translation files')
  .action(generateCommand);

program
  .command('watch')
  .description('Watch project files for changes and auto-generate i18n')
  .option('--yes', 'Run in non-interactive mode')
  .action(watchCommand);

program
  .command('watch-i18n')
  .description('Watch i18n/en.json file for changes and auto-translate')
  .action(watchI18nCommand);

program
  .command('report')
  .description('Show localization coverage report')
  .action(reportCommand);

program.parse();
