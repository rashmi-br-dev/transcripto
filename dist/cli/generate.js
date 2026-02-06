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
        // Check if lingo.dev is configured
        const hasLingoDevConfig = await checkLingoDevConfig();
        if (!hasLingoDevConfig) {
            console.log(chalk_1.default.yellow('\n🌐 Lingo.dev Setup Required'));
            console.log(chalk_1.default.white('Setting up lingo.dev for AI translations...\n'));
            // Setup lingo.dev automatically
            await setupLingoDev();
        }
        // Get language configuration from user
        const languageConfig = await getLanguageConfiguration();
        // Generate i18n files
        const generator = new i18nGenerator_1.I18nGenerator();
        await generator.generateI18nFiles(strings, languageConfig);
        // Generate lingo.dev config with user's target languages
        await generator.generateLingoDevConfig(languageConfig.languages.filter(lang => lang !== 'en'));
        // Generate welcome.md with extracted text
        await generateWelcomeFile(strings, languageConfig);
        console.log(chalk_1.default.green(`✅ Generated i18n files for ${strings.length} strings`));
        console.log(chalk_1.default.gray(`📁 Constants: ${languageConfig.constantsFile}`));
        console.log(chalk_1.default.gray(`📁 Translations: ${languageConfig.outputDir}/`));
        console.log(chalk_1.default.gray(`🌍 Languages: ${languageConfig.languages.join(', ')}`));
        // Ask if user wants to run lingo.dev (now automatic)
        const shouldRunLingoDev = await askToRunLingoDev();
        if (shouldRunLingoDev) {
            console.log(chalk_1.default.yellow('\n🌐 Running lingo.dev for translations...'));
            try {
                await generator.runLingoDev();
                console.log(chalk_1.default.green('✅ lingo.dev translations completed!'));
                // Ask if user wants to create language dropdown
                const shouldCreateDropdown = await askToCreateDropdown();
                if (shouldCreateDropdown) {
                    await createLanguageDropdown(languageConfig);
                }
            }
            catch (error) {
                console.log(chalk_1.default.yellow('⚠️  lingo.dev failed. You can run "npx lingo.dev@latest run" manually.'));
            }
        }
        else {
            console.log(chalk_1.default.cyan('ℹ️  Skipping lingo.dev translations'));
            // Still create language dropdown for manual switching
            const shouldCreateDropdown = await askToCreateDropdown();
            if (shouldCreateDropdown) {
                await createLanguageDropdown(languageConfig);
            }
        }
        console.log(chalk_1.default.yellow('\n🎯 Next steps:'));
        console.log(chalk_1.default.white('  devlingo replace - Replace inline text with constants'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Generation failed:'), error);
        process.exit(1);
    }
}
async function checkLingoDevConfig() {
    try {
        await fs_1.promises.access('.lingodev.json');
        return true;
    }
    catch {
        return false;
    }
}
async function setupLingoDev() {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log(chalk_1.default.cyan('🔑 Lingo.dev API Setup'));
    return new Promise((resolve) => {
        const askForApiKey = () => {
            rl.question(chalk_1.default.white('Do you have a lingo.dev API key? (Y/n): '), async (answer) => {
                const hasKey = answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'no';
                if (hasKey) {
                    rl.question(chalk_1.default.white('Enter your lingo.dev API key: '), async (apiKey) => {
                        if (apiKey.trim()) {
                            // Save API key to environment
                            await saveApiKey(apiKey.trim());
                            console.log(chalk_1.default.green('✅ API key saved!'));
                            rl.close();
                            resolve();
                        }
                        else {
                            console.log(chalk_1.default.red('❌ API key cannot be empty'));
                            askForApiKey();
                        }
                    });
                }
                else {
                    rl.question(chalk_1.default.white('Would you like to create an account and get API key? (Y/n): '), async (answer) => {
                        if (answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'no') {
                            console.log(chalk_1.default.cyan('🌐 Opening lingo.dev to create account...'));
                            console.log(chalk_1.default.white('Please get your API key from: https://lingo.dev/dashboard'));
                            console.log(chalk_1.default.white('After getting your API key, run "devlingo generate" again.\n'));
                            // Open browser (simplified - in production use 'open' package)
                            const { spawn } = await Promise.resolve().then(() => __importStar(require('child_process')));
                            spawn('start', ['https://lingo.dev/dashboard'], { detached: true });
                        }
                        rl.close();
                        resolve();
                    });
                }
            });
        };
        askForApiKey();
    });
}
async function saveApiKey(apiKey) {
    const envContent = `# DevLingo Configuration
LINGO_DEV_API_KEY=${apiKey}
`;
    await fs_1.promises.writeFile('.env', envContent, 'utf-8');
}
async function generateWelcomeFile(strings, config) {
    const welcomeContent = `# Welcome to Your Localized Project!

This file contains all the text strings that were extracted from your project.

## 📊 Extraction Summary
- **Total Strings**: ${strings.length}
- **Target Languages**: ${config.languages.join(', ')}
- **Generated**: ${new Date().toLocaleString()}

## 📝 Extracted Text Strings

${strings.map((str, index) => `${index + 1}. **${str.key}**\n   \`${str.text}\`\n   Location: ${str.filePath}:${str.line || 'unknown'}\n`).join('\n')}

## 🌐 Next Steps

1. **Review Translations**: Check the generated translation files in \`${config.outputDir}\`
2. **Test Language Switching**: Use the language dropdown to verify functionality
3. **Deploy**: Your project is now ready for multi-language deployment!

---

*Generated by DevLingo - Automated Localization CLI*
*Learn more: https://github.com/brrashmi408-sys/devlingo-npm*
`;
    await fs_1.promises.writeFile('welcome.md', welcomeContent, 'utf-8');
    console.log(chalk_1.default.green('📄 Created welcome.md with extracted text'));
}
async function createLanguageDropdown(config) {
    const dropdownContent = `import React, { useState, useEffect } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: '${config.languages[0] || 'en'}', name: 'English', flag: '🇺🇸' },
  ${config.languages.slice(1).map((lang) => `  { code: '${lang}', name: '${lang}', flag: '🌍' },`).join('\n')}
];

export const LanguageDropdown: React.FC = () => {
  const [currentLang, setCurrentLang] = useState('${config.languages[0] || 'en'}');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('language');
    if (saved && languages.find(l => l.code === saved)) {
      setCurrentLang(saved);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('language', langCode);
    
    // Reload page with new language
    window.location.reload();
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px',
      zIndex: 1000 
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <span>{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <span style={{ marginLeft: '4px' }}>▼</span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          minWidth: '200px',
          marginTop: '4px'
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%'
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.code === currentLang && <span style={{ marginLeft: 'auto' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
`;
    await fs_1.promises.writeFile('LanguageDropdown.tsx', dropdownContent, 'utf-8');
    console.log(chalk_1.default.green('🎨 Created LanguageDropdown.tsx component'));
    console.log(chalk_1.default.cyan('\n📋 How to use the language dropdown:'));
    console.log(chalk_1.default.white('1. Copy LanguageDropdown.tsx to your project'));
    console.log(chalk_1.default.white('2. Import and add to your main page/layout:'));
    console.log(chalk_1.default.white('   import LanguageDropdown from "./components/LanguageDropdown";'));
    console.log(chalk_1.default.white('3. Add to your App.tsx or layout:'));
    console.log(chalk_1.default.white('   <LanguageDropdown />'));
    console.log(chalk_1.default.white('4. The dropdown will automatically switch languages and reload page'));
    console.log(chalk_1.default.white('5. Position: Fixed top-right corner for easy access'));
}
async function getLanguageConfiguration() {
    console.log(chalk_1.default.cyan('\n🌍 Language Configuration'));
    // Skip language selection - let lingo.dev handle it automatically
    console.log(chalk_1.default.yellow('🤖 Letting lingo.dev handle language selection automatically...'));
    // Use default configuration
    const outputDir = './src/i18n';
    const constantsFile = './src/i18n/constants.ts';
    // Default to English + common languages
    const languages = ['en', 'hi', 'es', 'fr'];
    return {
        outputDir,
        languages,
        constantsFile,
        keyPrefix: ''
    };
}
async function promptForLanguage(message, defaultValue) {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(`${message} (${defaultValue}): `, (answer) => {
            rl.close();
            resolve(answer.trim() || defaultValue);
        });
    });
}
async function promptForTargetLanguages() {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log(chalk_1.default.yellow('\nAvailable language codes:'));
    console.log(chalk_1.default.white('  en - English'));
    console.log(chalk_1.default.white('  hi - Hindi'));
    console.log(chalk_1.default.white('  kn - Kannada'));
    console.log(chalk_1.default.white('  es - Spanish'));
    console.log(chalk_1.default.white('  fr - French'));
    console.log(chalk_1.default.white('  de - German'));
    console.log(chalk_1.default.white('  zh - Chinese'));
    console.log(chalk_1.default.white('  ja - Japanese'));
    console.log(chalk_1.default.white('  ta - Tamil'));
    console.log(chalk_1.default.white('  te - Telugu'));
    console.log(chalk_1.default.white('  ml - Malayalam'));
    console.log(chalk_1.default.white('  mr - Marathi'));
    console.log(chalk_1.default.white('  gu - Gujarati'));
    console.log(chalk_1.default.white('  bn - Bengali'));
    console.log(chalk_1.default.white('  pa - Punjabi'));
    console.log(chalk_1.default.white('  ur - Urdu'));
    console.log(chalk_1.default.white('  ar - Arabic'));
    console.log(chalk_1.default.white('  pt - Portuguese'));
    console.log(chalk_1.default.white('  it - Italian'));
    console.log(chalk_1.default.white('  ru - Russian'));
    return new Promise((resolve) => {
        rl.question('\nEnter target languages (comma-separated, e.g., hi,kn,es,fr): ', (answer) => {
            rl.close();
            const languages = answer.split(',')
                .map(lang => lang.trim().toLowerCase())
                .filter(lang => lang.length > 0);
            resolve(languages.length > 0 ? languages : ['hi', 'kn']);
        });
    });
}
async function promptForOutputDirectory() {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question('Output directory for translation files (./src/i18n): ', (answer) => {
            rl.close();
            resolve(answer.trim() || './src/i18n');
        });
    });
}
async function promptForConstantsFile(outputDir) {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(`Constants file path (${outputDir}/constants.ts): `, (answer) => {
            rl.close();
            resolve(answer.trim() || `${outputDir}/constants.ts`);
        });
    });
}
async function askToRunLingoDev() {
    // Always return true to run lingo.dev automatically
    return true;
}
async function askToCreateDropdown() {
    // Always return true to create language dropdown automatically
    return true;
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
//# sourceMappingURL=generate.js.map