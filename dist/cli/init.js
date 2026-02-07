"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
async function initCommand(options = {}) {
    console.log(chalk_1.default.blue('🚀 Initializing Transcripto in your project...'));
    const yes = options.yes || false;
    if (yes) {
        console.log(chalk_1.default.yellow('🤖 Running in non-interactive mode (--yes)'));
    }
    try {
        // Create .transcripto directory
        await fs_1.promises.mkdir('.transcripto', { recursive: true });
        // Create config file
        const config = {
            version: '1.1.5',
            scan: {
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.html'],
                exclude: ['node_modules', 'dist', 'build', '.git', 'coverage', 'src/i18n'],
                minStringLength: 2
            },
            i18n: {
                outputDir: './src/i18n',
                languages: ['en', 'hi', 'es', 'fr'],
                constantsFile: './src/i18n/constants.ts',
                keyPrefix: ''
            },
            replacement: {
                importPath: './i18n/constants',
                importName: 'TEXT',
                functionName: 't'
            }
        };
        await fs_1.promises.writeFile('.transcripto/config.json', JSON.stringify(config, null, 2), 'utf-8');
        // Create i18n directory structure
        await fs_1.promises.mkdir('./src/i18n', { recursive: true });
        // Create initial i18n helper
        const helperContent = `// Transcripto i18n helper
import { TEXT } from './constants';

export function t(key: keyof typeof TEXT): string {
  // In a real app, you would use the current locale
  // For now, return English text
  return TEXT[key] as string;
}

export function setLocale(locale: string): void {
  // TODO: Implement locale switching
  console.log(\`Locale set to: \${locale}\`);
}
`;
        await fs_1.promises.writeFile('./src/i18n/index.ts', helperContent, 'utf-8');
        // Create empty constants file
        const constantsContent = `// Auto-generated localization constants
export const TEXT = {};

export type TextKey = keyof typeof TEXT;
`;
        await fs_1.promises.writeFile('./src/i18n/constants.ts', constantsContent, 'utf-8');
        // Create empty translation files
        for (const lang of config.i18n.languages) {
            await fs_1.promises.writeFile(`./src/i18n/${lang}.json`, JSON.stringify({}, null, 2), 'utf-8');
        }
        console.log(chalk_1.default.green('✅ Transcripto initialized successfully!'));
        console.log(chalk_1.default.gray('📁 Created .transcripto/config.json'));
        console.log(chalk_1.default.gray('📁 Created src/i18n/ directory structure'));
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  transcripto scan     - Scan for UI text strings'));
        console.log(chalk_1.default.white('  transcripto generate - Generate i18n files'));
        console.log(chalk_1.default.white('  transcripto replace  - Replace inline text with constants'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Initialization failed:'), error);
        process.exit(1);
    }
}
//# sourceMappingURL=init.js.map