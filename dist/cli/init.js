"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
async function initCommand() {
    console.log(chalk_1.default.blue('🚀 Initializing DevLingo in your project...'));
    try {
        // Create .devlingo directory
        await fs_1.promises.mkdir('.devlingo', { recursive: true });
        // Create config file
        const config = {
            version: '1.0.0',
            scan: {
                extensions: ['.ts', '.tsx', '.js', '.jsx', '.html'],
                exclude: ['node_modules', 'dist', 'build', '.git', 'coverage'],
                minStringLength: 2
            },
            i18n: {
                outputDir: './src/i18n',
                languages: ['en', 'hi', 'kn'],
                constantsFile: './src/i18n/constants.ts',
                keyPrefix: ''
            },
            replacement: {
                importPath: './i18n/constants',
                importName: 'TEXT',
                functionName: 't'
            }
        };
        await fs_1.promises.writeFile('.devlingo/config.json', JSON.stringify(config, null, 2), 'utf-8');
        // Create i18n directory structure
        await fs_1.promises.mkdir('./src/i18n', { recursive: true });
        // Create initial i18n helper
        const helperContent = `// DevLingo i18n helper
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
        console.log(chalk_1.default.green('✅ DevLingo initialized successfully!'));
        console.log(chalk_1.default.gray('📁 Created .devlingo/config.json'));
        console.log(chalk_1.default.gray('📁 Created src/i18n/ directory structure'));
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  devlingo scan     - Scan for UI text strings'));
        console.log(chalk_1.default.white('  devlingo generate - Generate i18n files'));
        console.log(chalk_1.default.white('  devlingo replace  - Replace inline text with constants'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Initialization failed:'), error);
        process.exit(1);
    }
}
//# sourceMappingURL=init.js.map