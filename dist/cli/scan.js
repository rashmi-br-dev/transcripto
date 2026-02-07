"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanCommand = scanCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const projectScanner_1 = require("../core/projectScanner");
const stringExtractor_1 = require("../core/stringExtractor");
async function scanCommand() {
    console.log(chalk_1.default.blue('🔍 Scanning project for UI text strings...'));
    try {
        // Load config
        const config = await loadConfig();
        // Initialize scanner and extractor
        const scanner = new projectScanner_1.ProjectScanner();
        const extractor = new stringExtractor_1.StringExtractor();
        // Scan project
        const files = await scanner.scanProject();
        console.log(chalk_1.default.gray(`📁 Found ${files.length} files to scan`));
        // Extract strings
        const strings = await extractor.extractStrings(files);
        // Save results
        await fs_1.promises.writeFile('.transcripto/extracted-strings.json', JSON.stringify(strings, null, 2), 'utf-8');
        console.log(chalk_1.default.green(`✅ Extracted ${strings.length} UI text strings`));
        if (strings.length > 0) {
            console.log(chalk_1.default.yellow('\n📝 Sample extracted strings:'));
            strings.slice(0, 5).forEach((str, index) => {
                console.log(chalk_1.default.white(`  ${index + 1}. "${str.text}" → ${str.key}`));
                console.log(chalk_1.default.gray(`     from ${str.filePath}:${str.line}`));
            });
            if (strings.length > 5) {
                console.log(chalk_1.default.gray(`  ... and ${strings.length - 5} more`));
            }
        }
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  transcripto generate - Generate i18n files from extracted strings'));
        console.log(chalk_1.default.white('  transcripto replace  - Replace inline text with constants'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Scan failed:'), error);
        process.exit(1);
    }
}
async function loadConfig() {
    try {
        const configContent = await fs_1.promises.readFile('.transcripto/config.json', 'utf-8');
        return JSON.parse(configContent);
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️  No .transcripto/config.json found, using defaults'));
        return {
            scan: {
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.html'],
                exclude: ['node_modules', 'dist', 'build', '.git', 'coverage'],
                minStringLength: 2
            }
        };
    }
}
//# sourceMappingURL=scan.js.map