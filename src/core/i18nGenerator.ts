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

    // Generate translation files only (no constants file)
    for (const language of finalConfig.languages) {
      await this.generateTranslationFile(strings, language, finalConfig);
    }
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

  async generateLingoDevConfig(): Promise<void> {
    // First, delete any existing lingo.dev config to ensure clean setup
    try {
      await fs.unlink('.lingodev.json');
      console.log('🗑️  Removed existing lingo.dev config');
    } catch {
      // Config doesn't exist, that's fine
    }

    // Let lingo.dev handle target languages automatically - don't specify any
    const config = {
      source: './src/i18n/en.json',
      // target: [] - Let lingo.dev decide automatically
      output: './src/i18n',
      format: 'json'
    };

    const content = JSON.stringify(config, null, 2);
    await fs.writeFile('.lingodev.json', content, 'utf-8');
    console.log('📁 Created lingo.dev config with automatic language selection');
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
          console.log('✅ lingo.dev translations completed successfully!');
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
