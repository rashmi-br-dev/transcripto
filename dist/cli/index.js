#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./init");
const scan_1 = require("./scan");
const replace_1 = require("./replace");
const generate_1 = require("./generate");
const report_1 = require("./report");
const program = new commander_1.Command();
program
    .name('devlingo')
    .description('Automated localization CLI that scans projects and generates i18n files')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize DevLingo in your project')
    .action(init_1.initCommand);
program
    .command('scan')
    .description('Scan project for UI text strings')
    .action(scan_1.scanCommand);
program
    .command('replace')
    .description('Replace inline UI text with localization constants')
    .action(replace_1.replaceCommand);
program
    .command('generate')
    .description('Generate i18n translation files')
    .action(generate_1.generateCommand);
program
    .command('report')
    .description('Show localization coverage report')
    .action(report_1.reportCommand);
program.parse();
//# sourceMappingURL=index.js.map