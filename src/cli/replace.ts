import { promises as fs } from 'fs';
import chalk from 'chalk';
import { TextReplacer } from '../core/replacer';
import { ExtractedString } from '../core/stringExtractor';

export async function replaceCommand(): Promise<void> {
  console.log(chalk.blue('🔄 Replacing inline UI text with localization constants...'));

  try {
    // Load extracted strings
    const strings = await loadExtractedStrings();
    
    if (strings.length === 0) {
      console.log(chalk.yellow('⚠️  No strings found. Run "devlingo scan" first.'));
      return;
    }

    // Load config
    const config = await loadConfig();

    // Create backup warning
    console.log(chalk.yellow('⚠️  This will modify your source files!'));
    console.log(chalk.gray('💡 Make sure you have version control backup'));

    // Replace strings
    const replacer = new TextReplacer();
    await replacer.replaceInFiles(strings, config.replacement);

    console.log(chalk.green(`✅ Replaced ${strings.length} strings with localization constants`));

    console.log(chalk.yellow('\n🎯 Next steps:'));
    console.log(chalk.white('  1. Test your application'));
    console.log(chalk.white('  2. Commit changes to version control'));
    console.log(chalk.white('  3. Add new languages as needed'));

  } catch (error) {
    console.error(chalk.red('❌ Replacement failed:'), error);
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
      replacement: {
        importPath: './i18n/constants',
        importName: 'TEXT',
        functionName: 't'
      }
    };
  }
}
