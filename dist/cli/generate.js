"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = generateCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const i18nGenerator_1 = require("../core/i18nGenerator");
async function generateCommand() {
    console.log(chalk_1.default.blue('📝 Generating i18n files...'));
    try {
        // Load extracted strings
        const strings = await loadExtractedStrings();
        if (strings.length === 0) {
            console.log(chalk_1.default.yellow('⚠️  No strings found. Run "devlingo scan" first.'));
            return;
        }
        // Load config
        const config = await loadConfig();
        // Generate i18n files
        const generator = new i18nGenerator_1.I18nGenerator();
        await generator.generateI18nFiles(strings, config.i18n);
        // Generate lingo.dev config
        await generator.generateLingoDevConfig();
        console.log(chalk_1.default.green(`✅ Generated i18n files for ${strings.length} strings`));
        console.log(chalk_1.default.gray(`📁 Constants: ${config.i18n.constantsFile}`));
        console.log(chalk_1.default.gray(`📁 Translations: ${config.i18n.outputDir}/`));
        console.log(chalk_1.default.yellow('\n🌐 Running lingo.dev for translations...'));
        try {
            await generator.runLingoDev();
            console.log(chalk_1.default.green('✅ lingo.dev translations completed!'));
        }
        catch (error) {
            console.log(chalk_1.default.yellow('⚠️  lingo.dev failed. You can run "npx lingo.dev@latest run" manually.'));
        }
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  devlingo replace - Replace inline text with constants'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Generation failed:'), error);
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
            i18n: {
                outputDir: './src/i18n',
                languages: ['en', 'hi', 'kn'],
                constantsFile: './src/i18n/constants.ts',
                keyPrefix: ''
            }
        };
    }
}
//# sourceMappingURL=generate.js.map