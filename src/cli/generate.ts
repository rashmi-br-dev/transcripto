import { promises as fs } from 'fs';
import chalk from 'chalk';
import { I18nGenerator } from '../core/i18nGenerator';
import { ExtractedString } from '../core/stringExtractor';

export async function generateCommand(): Promise<void> {
  console.log(chalk.blue('📝 Generating i18n files...'));

  try {
    // Load extracted strings
    const strings = await loadExtractedStrings();
    
    if (strings.length === 0) {
      console.log(chalk.yellow('⚠️  No strings found. Run "devlingo scan" first.'));
      return;
    }

    // Load config
    const config = await loadConfig();

    // Generate i18n files
    const generator = new I18nGenerator();
    await generator.generateI18nFiles(strings, config.i18n);

    // Generate lingo.dev config
    await generator.generateLingoDevConfig();

    console.log(chalk.green(`✅ Generated i18n files for ${strings.length} strings`));
    console.log(chalk.gray(`📁 Constants: ${config.i18n.constantsFile}`));
    console.log(chalk.gray(`📁 Translations: ${config.i18n.outputDir}/`));

    console.log(chalk.yellow('\n🌐 Running lingo.dev for translations...'));
    
    try {
      await generator.runLingoDev();
      console.log(chalk.green('✅ lingo.dev translations completed!'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  lingo.dev failed. You can run "npx lingo.dev@latest run" manually.'));
    }

    console.log(chalk.yellow('\n🎯 Next steps:'));
    console.log(chalk.white('  devlingo replace - Replace inline text with constants'));

  } catch (error) {
    console.error(chalk.red('❌ Generation failed:'), error);
    process.exit(1);
  }
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

async function loadConfig() {
  try {
    const configContent = await fs.readFile('.devlingo/config.json', 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(chalk.yellow('⚠️  No .devlingo/config.json found, using defaults'));
    return {
      i18n: {
        outputDir: './src/i18n',
        languages: ['en', 'hi', 'kn'],
        constantsFile: './src/i18n/constants.ts',
        keyPrefix: ''
      }
    };
  }
}
