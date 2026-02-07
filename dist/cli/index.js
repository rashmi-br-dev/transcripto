#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const generate_1 = require("./generate");
const init_1 = require("./init");
const report_1 = require("./report");
const scan_1 = require("./scan");
const watch_1 = require("./watch");
const watch_i18n_1 = require("./watch-i18n");
const program = new commander_1.Command();
program
    .name('transcripto')
    .description('Automated localization CLI that scans projects and generates i18n files')
    .version('1.1.5');
program
    .command('init')
    .description('Initialize Transcripto in your project')
    .option('--yes', 'Run in non-interactive mode')
    .action(init_1.initCommand);
program
    .command('scan')
    .description('Scan project for UI text strings')
    .action(scan_1.scanCommand);
program
    .command('generate')
    .description('Generate i18n translation files')
    .action(generate_1.generateCommand);
program
    .command('watch')
    .description('Watch project files for changes and auto-generate i18n')
    .option('--yes', 'Run in non-interactive mode')
    .action(watch_1.watchCommand);
program
    .command('watch-i18n')
    .description('Watch i18n/en.json file for changes and auto-translate')
    .action(watch_i18n_1.watchI18nCommand);
program
    .command('report')
    .description('Show localization coverage report')
    .action(report_1.reportCommand);
program.parse();
//# sourceMappingURL=index.js.map