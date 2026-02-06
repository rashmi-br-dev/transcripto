"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCommand = reportCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
async function reportCommand() {
    console.log(chalk_1.default.blue('📊 Generating localization report...'));
    try {
        const report = await generateReport();
        displayReport(report);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Report generation failed:'), error);
        process.exit(1);
    }
}
async function generateReport() {
    // Load extracted strings
    const strings = await loadExtractedStrings();
    // Load config
    const config = await loadConfig();
    // Load existing translations
    const translations = await loadTranslations(config.i18n.languages);
    // Calculate metrics
    const filesScanned = new Set(strings.map(s => s.filePath)).size;
    const stringsByFile = {};
    strings.forEach(str => {
        const fileName = str.filePath.split('/').pop() || str.filePath;
        stringsByFile[fileName] = (stringsByFile[fileName] || 0) + 1;
    });
    // Check missing translations
    const missingTranslations = [];
    for (const lang of config.i18n.languages) {
        if (lang !== 'en' && (!translations[lang] || Object.keys(translations[lang]).length < strings.length)) {
            missingTranslations.push(lang);
        }
    }
    const coverage = strings.length > 0
        ? Math.round((translations.en ? Object.keys(translations.en).length : 0) / strings.length * 100)
        : 0;
    return {
        totalStrings: strings.length,
        filesScanned,
        languages: config.i18n.languages,
        coverage,
        missingTranslations,
        stringsByFile
    };
}
function displayReport(report) {
    console.log(chalk_1.default.green('\n📈 DevLingo Localization Report'));
    console.log(chalk_1.default.gray('='.repeat(40)));
    console.log(chalk_1.default.white(`\n📝 Total Strings: ${report.totalStrings}`));
    console.log(chalk_1.default.white(`📁 Files Scanned: ${report.filesScanned}`));
    console.log(chalk_1.default.white(`🌐 Languages: ${report.languages.join(', ')}`));
    // Coverage with color coding
    let coverageColor = chalk_1.default.red;
    if (report.coverage >= 80)
        coverageColor = chalk_1.default.green;
    else if (report.coverage >= 50)
        coverageColor = chalk_1.default.yellow;
    console.log(coverageColor(`📊 Coverage: ${report.coverage}%`));
    // Missing translations
    if (report.missingTranslations.length > 0) {
        console.log(chalk_1.default.red(`\n⚠️  Missing Translations: ${report.missingTranslations.join(', ')}`));
    }
    else {
        console.log(chalk_1.default.green('\n✅ All languages have complete translations'));
    }
    // Strings by file
    if (Object.keys(report.stringsByFile).length > 0) {
        console.log(chalk_1.default.white('\n📋 Strings by File:'));
        const sortedFiles = Object.entries(report.stringsByFile)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);
        sortedFiles.forEach(([file, count]) => {
            console.log(chalk_1.default.gray(`  ${file}: ${count} strings`));
        });
        if (Object.keys(report.stringsByFile).length > 10) {
            console.log(chalk_1.default.gray(`  ... and ${Object.keys(report.stringsByFile).length - 10} more files`));
        }
    }
    // Recommendations
    console.log(chalk_1.default.white('\n💡 Recommendations:'));
    if (report.totalStrings === 0) {
        console.log(chalk_1.default.yellow('  • Run "devlingo scan" to extract UI strings'));
    }
    else if (report.coverage < 100) {
        console.log(chalk_1.default.yellow('  • Run "devlingo generate" to update translation files'));
    }
    if (report.missingTranslations.length > 0) {
        console.log(chalk_1.default.yellow('  • Run "npx lingo.dev@latest run" to generate missing translations'));
    }
    if (report.totalStrings > 0 && report.coverage === 100) {
        console.log(chalk_1.default.green('  • Localization is complete! 🎉'));
    }
}
async function loadExtractedStrings() {
    try {
        const content = await fs_1.promises.readFile('.devlingo/extracted-strings.json', 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return [];
    }
}
async function loadConfig() {
    try {
        const configContent = await fs_1.promises.readFile('.devlingo/config.json', 'utf-8');
        return JSON.parse(configContent);
    }
    catch (error) {
        return {
            i18n: {
                languages: ['en', 'hi', 'kn'],
                outputDir: './src/i18n'
            }
        };
    }
}
async function loadTranslations(languages) {
    const translations = {};
    for (const lang of languages) {
        try {
            const content = await fs_1.promises.readFile(`./src/i18n/${lang}.json`, 'utf-8');
            translations[lang] = JSON.parse(content);
        }
        catch (error) {
            translations[lang] = {};
        }
    }
    return translations;
}
//# sourceMappingURL=report.js.map