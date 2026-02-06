import { promises as fs } from 'fs';
import path from 'path';
import { ExtractedString } from './stringExtractor';

export interface I18nConfig {
  outputDir: string;
  languages: string[];
  constantsFile: string;
  keyPrefix: string;
}

export class I18nGenerator {
  private readonly defaultConfig: I18nConfig = {
    outputDir: './src/i18n',
    languages: ['en', 'hi', 'kn'],
    constantsFile: './src/i18n/constants.ts',
    keyPrefix: ''
  };

  async generateI18nFiles(
    strings: ExtractedString[], 
    config: Partial<I18nConfig> = {}
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Create output directory
    await fs.mkdir(finalConfig.outputDir, { recursive: true });

    // Generate constants file
    await this.generateConstantsFile(strings, finalConfig);

    // Generate translation files for each language
    for (const language of finalConfig.languages) {
      await this.generateTranslationFile(strings, language, finalConfig);
    }
  }

  private async generateConstantsFile(
    strings: ExtractedString[], 
    config: I18nConfig
  ): Promise<void> {
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

    await fs.writeFile(config.constantsFile, content, 'utf-8');
  }

  private async generateTranslationFile(
    strings: ExtractedString[], 
    language: string, 
    config: I18nConfig
  ): Promise<void> {
    const translations: Record<string, string> = {};

    for (const str of strings) {
      translations[str.key] = str.text;
    }

    const filePath = path.join(config.outputDir, `${language}.json`);
    const content = JSON.stringify(translations, null, 2);

    await fs.writeFile(filePath, content, 'utf-8');
  }

  async generateLingoDevConfig(targetLanguages: string[] = ['hi', 'es', 'fr']): Promise<void> {
    const config = {
      source: './src/i18n/en.json',
      target: targetLanguages,
      output: './src/i18n',
      format: 'json'
    };

    const content = JSON.stringify(config, null, 2);
    await fs.writeFile('.lingodev.json', content, 'utf-8');
  }

  async runLingoDev(): Promise<void> {
    const { spawn } = await import('child_process');
    
    // First, initialize lingo.dev if not already done
    try {
      await fs.access('i18n.json');
      console.log('📁 lingo.dev already initialized');
    } catch {
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
        } else {
          reject(new Error(`lingo.dev process exited with code ${code}`));
        }
      });

      process.on('error', reject);
    });
  }

  private async initializeLingoDev(): Promise<void> {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('npx', ['lingo.dev@latest', 'init'], {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ lingo.dev initialized successfully');
          resolve();
        } else {
          reject(new Error(`lingo.dev init failed with code ${code}`));
        }
      });

      process.on('error', reject);
    });
  }
}
