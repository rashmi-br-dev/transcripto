import { promises as fs } from 'fs';
import chalk from 'chalk';
import { I18nGenerator } from '../core/i18nGenerator';
import { ProjectScanner } from '../core/projectScanner';
import { StringExtractor } from '../core/stringExtractor';
import { ExtractedString } from '../core/stringExtractor';

export async function generateCommand(): Promise<void> {
  console.log(chalk.blue('📝 Generating i18n files...'));

  try {
    // Automatically scan the project first
    console.log(chalk.cyan('🔍 Scanning project for UI text strings...'));
    const scanner = new ProjectScanner();
    const files = await scanner.scanProject('./src');
    
    const extractor = new StringExtractor();
    const strings = await extractor.extractStrings(files);
    
    if (strings.length === 0) {
      console.log(chalk.yellow('⚠️  No UI text strings found in the project.'));
      console.log(chalk.gray('💡 Make sure your React components have text content to extract.'));
      return;
    }

    console.log(chalk.green(`✅ Found ${strings.length} UI text strings`));
    
    // Save extracted strings for future use
    await fs.mkdir('.devlingo', { recursive: true });
    await fs.writeFile('.devlingo/extracted-strings.json', JSON.stringify(strings, null, 2), 'utf-8');
    
    // Check if lingo.dev is configured
    const hasLingoDevConfig = await checkLingoDevConfig();
    
    if (!hasLingoDevConfig) {
      console.log(chalk.yellow('\n🌐 Lingo.dev Setup Required'));
      console.log(chalk.white('Setting up lingo.dev for AI translations...\n'));
      
      // Setup lingo.dev automatically
      await setupLingoDev();
    }

    // Get language configuration from user
    const languageConfig = await getLanguageConfiguration();

    // Generate i18n files
    const generator = new I18nGenerator();
    await generator.generateI18nFiles(strings, languageConfig);

    // Generate lingo.dev config with user's target languages
    await generator.generateLingoDevConfig(languageConfig.languages.filter(lang => lang !== 'en'));

    // Generate welcome.md with extracted text
    await generateWelcomeFile(strings, languageConfig);

    console.log(chalk.green(`✅ Generated i18n files for ${strings.length} strings`));
    console.log(chalk.gray(`📁 Constants: ${languageConfig.constantsFile}`));
    console.log(chalk.gray(`📁 Translations: ${languageConfig.outputDir}/`));
    console.log(chalk.gray(`🌍 Languages: ${languageConfig.languages.join(', ')}`));

    // Run lingo.dev automatically
    console.log(chalk.cyan('🌐 Running lingo.dev for translations...'));
    
    try {
      await generator.runLingoDev();
      console.log(chalk.green('✅ lingo.dev translations completed!'));
      
      // Ask if user wants to create language dropdown (now automatic)
      const shouldCreateDropdown = true; // Always create dropdown
      await createLanguageDropdown(languageConfig);
    } catch (error) {
      console.log(chalk.yellow('⚠️  lingo.dev failed. You can run "npx lingo.dev@latest run" manually.'));
    }

    console.log(chalk.cyan('\n🎯 Next steps:'));
    console.log(chalk.white('  npm start - Test your localized application'));
    console.log(chalk.gray('💡 Text is ready for translation. Use constants in your React components.'));

  } catch (error) {
    console.error(chalk.red('❌ Generation failed:'), error);
    process.exit(1);
  }
}

async function checkLingoDevConfig(): Promise<boolean> {
  try {
    await fs.access('.lingodev.json');
    return true;
  } catch {
    return false;
  }
}

async function setupLingoDev(): Promise<void> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(chalk.cyan('🔑 Lingo.dev API Setup'));
  
  return new Promise((resolve) => {
    const askForApiKey = () => {
      rl.question(chalk.white('Do you have a lingo.dev API key? (Y/n): '), async (answer) => {
        const hasKey = answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'no';
        
        if (hasKey) {
          rl.question(chalk.white('Enter your lingo.dev API key: '), async (apiKey) => {
            if (apiKey.trim()) {
              // Save API key to environment
              await saveApiKey(apiKey.trim());
              console.log(chalk.green('✅ API key saved!'));
              rl.close();
              resolve();
            } else {
              console.log(chalk.red('❌ API key cannot be empty'));
              askForApiKey();
            }
          });
        } else {
          rl.question(chalk.white('Would you like to create an account and get API key? (Y/n): '), async (answer) => {
            if (answer.trim().toLowerCase() !== 'n' && answer.trim().toLowerCase() !== 'no') {
              console.log(chalk.cyan('🌐 Opening lingo.dev to create account...'));
              console.log(chalk.white('Please get your API key from: https://lingo.dev/dashboard'));
              console.log(chalk.white('After getting your API key, run "devlingo generate" again.\n'));
              
              // Open browser (simplified - in production use 'open' package)
              const { spawn } = await import('child_process');
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

async function saveApiKey(apiKey: string): Promise<void> {
  const envContent = `# DevLingo Configuration
LINGO_DEV_API_KEY=${apiKey}
`;
  await fs.writeFile('.env', envContent, 'utf-8');
}

async function generateWelcomeFile(strings: ExtractedString[], config: any): Promise<void> {
  const welcomeContent = `# Welcome to Your Localized Project!

This file contains all the text strings that were extracted from your project.

## 📊 Extraction Summary
- **Total Strings**: ${strings.length}
- **Target Languages**: ${config.languages.join(', ')}
- **Generated**: ${new Date().toLocaleString()}

## 📝 Extracted Text Strings

${strings.map((str, index) => 
  `${index + 1}. **${str.key}**\n   \`${str.text}\`\n   Location: ${str.filePath}:${str.line || 'unknown'}\n`
).join('\n')}

## 🌐 Next Steps

1. **Review Translations**: Check the generated translation files in \`${config.outputDir}\`
2. **Test Language Switching**: Use the language dropdown to verify functionality
3. **Deploy**: Your project is now ready for multi-language deployment!

---

*Generated by DevLingo - Automated Localization CLI*
*Learn more: https://github.com/brrashmi408-sys/devlingo-npm*
`;

  await fs.writeFile('welcome.md', welcomeContent, 'utf-8');
  console.log(chalk.green('📄 Created welcome.md with extracted text'));
}

async function createLanguageDropdown(config: any): Promise<void> {
  const dropdownContent = `import React, { useState, useEffect } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: '${config.languages[0] || 'en'}', name: 'English', flag: '🇺🇸' },
  ${config.languages.slice(1).map((lang: string) => `  { code: '${lang}', name: '${lang}', flag: '🌍' },`).join('\n')}
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

  await fs.writeFile('LanguageDropdown.tsx', dropdownContent, 'utf-8');
  console.log(chalk.green('🎨 Created LanguageDropdown.tsx component'));
  
  console.log(chalk.cyan('\n📋 How to use the language dropdown:'));
  console.log(chalk.white('1. Copy LanguageDropdown.tsx to your project'));
  console.log(chalk.white('2. Import and add to your main page/layout:'));
  console.log(chalk.white('   import LanguageDropdown from "./components/LanguageDropdown";'));
  console.log(chalk.white('3. Add to your App.tsx or layout:'));
  console.log(chalk.white('   <LanguageDropdown />'));
  console.log(chalk.white('4. The dropdown will automatically switch languages and reload page'));
  console.log(chalk.white('5. Position: Fixed top-right corner for easy access'));
}

async function getLanguageConfiguration() {
  console.log(chalk.cyan('\n🌍 Language Configuration'));
  
  // Skip language selection - let lingo.dev handle it automatically
  console.log(chalk.yellow('🤖 Letting lingo.dev handle language selection automatically...'));
  
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

async function promptForLanguage(message: string, defaultValue: string): Promise<string> {
  const readline = await import('readline');
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

async function promptForTargetLanguages(): Promise<string[]> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(chalk.yellow('\nAvailable language codes:'));
  console.log(chalk.white('  en - English'));
  console.log(chalk.white('  hi - Hindi'));
  console.log(chalk.white('  kn - Kannada'));
  console.log(chalk.white('  es - Spanish'));
  console.log(chalk.white('  fr - French'));
  console.log(chalk.white('  de - German'));
  console.log(chalk.white('  zh - Chinese'));
  console.log(chalk.white('  ja - Japanese'));
  console.log(chalk.white('  ta - Tamil'));
  console.log(chalk.white('  te - Telugu'));
  console.log(chalk.white('  ml - Malayalam'));
  console.log(chalk.white('  mr - Marathi'));
  console.log(chalk.white('  gu - Gujarati'));
  console.log(chalk.white('  bn - Bengali'));
  console.log(chalk.white('  pa - Punjabi'));
  console.log(chalk.white('  ur - Urdu'));
  console.log(chalk.white('  ar - Arabic'));
  console.log(chalk.white('  pt - Portuguese'));
  console.log(chalk.white('  it - Italian'));
  console.log(chalk.white('  ru - Russian'));

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

async function promptForOutputDirectory(): Promise<string> {
  const readline = await import('readline');
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

async function promptForConstantsFile(outputDir: string): Promise<string> {
  const readline = await import('readline');
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

async function askToRunLingoDev(): Promise<boolean> {
  // Always return true to run lingo.dev automatically
  return true;
}

async function askToCreateDropdown(): Promise<boolean> {
  // Always return true to create language dropdown automatically
  return true;
}

async function loadExtractedStrings(): Promise<ExtractedString[]> {
  try {
    const content = await fs.readFile('.devlingo/extracted-strings.json', 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(chalk.yellow('⚠️  No extracted strings found. Run "devlingo scan" first.'));
    return [];
  }
}
