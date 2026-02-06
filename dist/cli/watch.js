"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchCommand = watchCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const chokidar = __importStar(require("chokidar"));
const i18nGenerator_1 = require("../core/i18nGenerator");
const projectScanner_1 = require("../core/projectScanner");
const stringExtractor_1 = require("../core/stringExtractor");
const replacer_1 = require("../core/replacer");
async function watchCommand(options) {
    console.log(chalk_1.default.blue('👁️  Starting DevLingo file watcher...'));
    const yes = options.yes || false;
    if (yes) {
        console.log(chalk_1.default.yellow('🤖 Running in non-interactive mode (--yes)'));
    }
    // Initial setup
    await setupProject(yes);
    // Watch for file changes
    const watcher = chokidar.watch([
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/i18n/**/*',
        '!dist/**/*',
        '!node_modules/**/*'
    ], {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true
    });
    console.log(chalk_1.default.green('📁 Watching for changes in src/ directory...'));
    console.log(chalk_1.default.gray('💡 Press Ctrl+C to stop watching'));
    watcher.on('change', async (filePath) => {
        console.log(chalk_1.default.yellow(`\n📝 File changed: ${filePath}`));
        await handleFileChange(filePath, yes);
    });
    watcher.on('add', async (filePath) => {
        console.log(chalk_1.default.yellow(`\n➕ File added: ${filePath}`));
        await handleFileChange(filePath, yes);
    });
    // Handle process termination
    process.on('SIGINT', () => {
        console.log(chalk_1.default.cyan('\n👋 Stopping DevLingo watcher...'));
        watcher.close();
        process.exit(0);
    });
}
async function setupProject(yes) {
    try {
        // Check if project is initialized
        try {
            await fs_1.promises.access('.devlingo');
            console.log(chalk_1.default.green('✅ DevLingo project already initialized'));
        }
        catch {
            console.log(chalk_1.default.yellow('🔧 Initializing DevLingo project...'));
            const { initCommand } = await Promise.resolve().then(() => __importStar(require('./init')));
            await initCommand();
        }
        // Initial scan and generation
        console.log(chalk_1.default.blue('🔍 Performing initial scan...'));
        await performFullWorkflow(yes);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Setup failed:'), error);
        process.exit(1);
    }
}
async function handleFileChange(filePath, yes) {
    try {
        console.log(chalk_1.default.cyan('🔄 Updating translations...'));
        // Perform full workflow
        await performFullWorkflow(yes);
        console.log(chalk_1.default.green('✅ Translations updated successfully!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Update failed:'), error);
    }
}
async function performFullWorkflow(yes) {
    // Scan for strings
    const scanner = new projectScanner_1.ProjectScanner();
    const files = await scanner.scanProject('./src');
    const extractor = new stringExtractor_1.StringExtractor();
    const strings = await extractor.extractStrings(files);
    if (strings.length === 0) {
        console.log(chalk_1.default.yellow('⚠️  No strings found'));
        return;
    }
    // Generate i18n files using same config as generate command
    const generator = new i18nGenerator_1.I18nGenerator();
    const config = {
        outputDir: './src/i18n',
        languages: ['en', 'hi', 'es', 'fr'],
        constantsFile: './src/i18n/constants.ts',
        keyPrefix: ''
    };
    await generator.generateI18nFiles(strings, config);
    await generator.generateLingoDevConfig(['hi', 'es', 'fr']);
    // Run lingo.dev automatically
    try {
        await generator.runLingoDev();
        console.log(chalk_1.default.green('🌐 lingo.dev translations completed!'));
    }
    catch (error) {
        console.log(chalk_1.default.yellow('⚠️  lingo.dev failed, continuing...'));
    }
    // Replace strings with constants
    const replacer = new replacer_1.TextReplacer();
    await replacer.replaceInFiles(strings);
    console.log(chalk_1.default.green(`✅ Processed ${strings.length} strings`));
}
//# sourceMappingURL=watch.js.map