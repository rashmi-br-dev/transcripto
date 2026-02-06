"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceCommand = replaceCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const replacer_1 = require("../core/replacer");
async function replaceCommand() {
    console.log(chalk_1.default.blue('🔄 Replacing inline UI text with localization constants...'));
    try {
        // Load extracted strings
        const strings = await loadExtractedStrings();
        if (strings.length === 0) {
            console.log(chalk_1.default.yellow('⚠️  No strings found. Run "devlingo scan" first.'));
            return;
        }
        // Load config
        const config = await loadConfig();
        // Create backup warning
        console.log(chalk_1.default.yellow('⚠️  This will modify your source files!'));
        console.log(chalk_1.default.gray('💡 Make sure you have version control backup'));
        // Replace strings
        const replacer = new replacer_1.TextReplacer();
        await replacer.replaceInFiles(strings, config.replacement);
        console.log(chalk_1.default.green(`✅ Replaced ${strings.length} strings with localization constants`));
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  1. Test your application'));
        console.log(chalk_1.default.white('  2. Commit changes to version control'));
        console.log(chalk_1.default.white('  3. Add new languages as needed'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Replacement failed:'), error);
        process.exit(1);
    }
}
async function loadExtractedStrings() {
    try {
        const content = await fs_1.promises.readFile('.devlingo/extracted-strings.json', 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️  No extracted strings found. Run "devlingo scan" first.'));
        return [];
    }
}
async function loadConfig() {
    try {
        const configContent = await fs_1.promises.readFile('.devlingo/config.json', 'utf-8');
        return JSON.parse(configContent);
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('⚠️  No .devlingo/config.json found, using defaults'));
        return {
            replacement: {
                importPath: './i18n/constants',
                importName: 'TEXT',
                functionName: 't'
            }
        };
    }
}
//# sourceMappingURL=replace.js.map