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
exports.I18nGenerator = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class I18nGenerator {
    constructor() {
        this.defaultConfig = {
            outputDir: './src/i18n',
            languages: ['en', 'hi', 'kn'],
            constantsFile: './src/i18n/constants.ts',
            keyPrefix: ''
        };
    }
    async generateI18nFiles(strings, config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config };
        // Create output directory
        await fs_1.promises.mkdir(finalConfig.outputDir, { recursive: true });
        // Generate constants file
        await this.generateConstantsFile(strings, finalConfig);
        // Generate translation files for each language
        for (const language of finalConfig.languages) {
            await this.generateTranslationFile(strings, language, finalConfig);
        }
    }
    async generateConstantsFile(strings, config) {
        const constants = strings.map(str => {
            const key = config.keyPrefix + str.key.toUpperCase();
            return `  ${key}: "${str.key}"`;
        });
        const content = `// Auto-generated localization constants
export const TEXT = {
${constants.join(',\n')}
} as const;

export type TextKey = keyof typeof TEXT;
`;
        await fs_1.promises.writeFile(config.constantsFile, content, 'utf-8');
    }
    async generateTranslationFile(strings, language, config) {
        const translations = {};
        for (const str of strings) {
            translations[str.key] = str.text;
        }
        const filePath = path_1.default.join(config.outputDir, `${language}.json`);
        const content = JSON.stringify(translations, null, 2);
        await fs_1.promises.writeFile(filePath, content, 'utf-8');
    }
    async generateLingoDevConfig(targetLanguages = ['hi', 'es', 'fr']) {
        const config = {
            source: './src/i18n/en.json',
            target: targetLanguages,
            output: './src/i18n',
            format: 'json'
        };
        const content = JSON.stringify(config, null, 2);
        await fs_1.promises.writeFile('.lingodev.json', content, 'utf-8');
    }
    async runLingoDev() {
        const { spawn } = await Promise.resolve().then(() => __importStar(require('child_process')));
        // First, initialize lingo.dev if not already done
        try {
            await fs_1.promises.access('i18n.json');
            console.log('📁 lingo.dev already initialized');
        }
        catch {
            console.log('🔧 Initializing lingo.dev...');
            await this.initializeLingoDev();
        }
        // Then run lingo.dev
        return new Promise((resolve, reject) => {
            const process = spawn('npx', ['lingo.dev@latest', 'run'], {
                stdio: 'inherit',
                shell: true
            });
            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`lingo.dev process exited with code ${code}`));
                }
            });
            process.on('error', reject);
        });
    }
    async initializeLingoDev() {
        const { spawn } = await Promise.resolve().then(() => __importStar(require('child_process')));
        return new Promise((resolve, reject) => {
            const process = spawn('npx', ['lingo.dev@latest', 'init'], {
                stdio: 'inherit',
                shell: true
            });
            process.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ lingo.dev initialized successfully');
                    resolve();
                }
                else {
                    reject(new Error(`lingo.dev init failed with code ${code}`));
                }
            });
            process.on('error', reject);
        });
    }
}
exports.I18nGenerator = I18nGenerator;
//# sourceMappingURL=i18nGenerator.js.map