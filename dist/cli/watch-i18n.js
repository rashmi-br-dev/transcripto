"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchI18nCommand = watchI18nCommand;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const chokidar_1 = __importDefault(require("chokidar"));
const i18nGenerator_1 = require("../core/i18nGenerator");
async function watchI18nCommand() {
    console.log(chalk_1.default.cyan('👁️  Starting i18n file watcher...'));
    console.log(chalk_1.default.gray('📁 Monitoring: ./i18n/en.json'));
    console.log(chalk_1.default.gray('🔄 Auto-translating on changes...\n'));
    // Ensure i18n directory exists
    try {
        await fs_1.promises.mkdir('./i18n', { recursive: true });
    }
    catch {
        // Directory already exists
    }
    // Initial translation if en.json exists
    try {
        const enContent = await fs_1.promises.readFile('./i18n/en.json', 'utf-8');
        const translations = JSON.parse(enContent);
        const keys = Object.keys(translations);
        if (keys.length > 0) {
            console.log(chalk_1.default.yellow('📝 Found existing translations, running initial translation...'));
            await runTranslation();
        }
    }
    catch {
        console.log(chalk_1.default.yellow('📝 No existing en.json found, waiting for file creation...'));
    }
    // Watch for changes in en.json
    const watcher = chokidar_1.default.watch('./i18n/en.json', {
        persistent: true,
        ignoreInitial: true
    });
    watcher.on('change', async () => {
        console.log(chalk_1.default.cyan('\n🔄 File changed: ./i18n/en.json'));
        console.log(chalk_1.default.yellow('🌐 Running auto-translation...'));
        try {
            await runTranslation();
            console.log(chalk_1.default.green('✅ Auto-translation completed!'));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Auto-translation failed:'), error);
        }
    });
    watcher.on('add', async () => {
        console.log(chalk_1.default.cyan('\n📁 File created: ./i18n/en.json'));
        console.log(chalk_1.default.yellow('🌐 Running initial translation...'));
        try {
            await runTranslation();
            console.log(chalk_1.default.green('✅ Initial translation completed!'));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Initial translation failed:'), error);
        }
    });
    console.log(chalk_1.default.green('🎉 Watcher started successfully!'));
    console.log(chalk_1.default.gray('💡 Add new keys to ./i18n/en.json and they will be auto-translated'));
    console.log(chalk_1.default.gray('⏹️  Press Ctrl+C to stop watching\n'));
}
async function runTranslation() {
    const generator = new i18nGenerator_1.I18nGenerator();
    // Generate lingo.dev config for root/i18n
    await generator.generateLingoDevConfig();
    // Run lingo.dev translation
    await generator.runLingoDev();
}
//# sourceMappingURL=watch-i18n.js.map