import { promises as fs } from 'fs';
import chalk from 'chalk';
import { ProjectScanner } from '../core/projectScanner';
import { StringExtractor } from '../core/stringExtractor';

export async function scanCommand(): Promise<void> {
  console.log(chalk.blue('🔍 Scanning project for UI text strings...'));

  try {
    // Load config
    const config = await loadConfig();
    
    // Initialize scanner and extractor
    const scanner = new ProjectScanner();
    const extractor = new StringExtractor();

    // Scan project
    const files = await scanner.scanProject();
    console.log(chalk.gray(`📁 Found ${files.length} files to scan`));

    // Extract strings
    const strings = await extractor.extractStrings(files);
    
    // Save results
    await fs.writeFile(
      '.transcripto/extracted-strings.json', 
      JSON.stringify(strings, null, 2), 
      'utf-8'
    );

    console.log(chalk.green(`✅ Extracted ${strings.length} UI text strings`));
    
    if (strings.length > 0) {
      console.log(chalk.yellow('\n📝 Sample extracted strings:'));
      strings.slice(0, 5).forEach((str, index) => {
        console.log(chalk.white(`  ${index + 1}. "${str.text}" → ${str.key}`));
        console.log(chalk.gray(`     from ${str.filePath}:${str.line}`));
      });
      
      if (strings.length > 5) {
        console.log(chalk.gray(`  ... and ${strings.length - 5} more`));
      }
    }

    console.log(chalk.yellow('\n🎯 Next steps:'));
    console.log(chalk.white('  transcripto generate - Generate i18n files from extracted strings'));
    console.log(chalk.white('  transcripto replace  - Replace inline text with constants'));

  } catch (error) {
    console.error(chalk.red('❌ Scan failed:'), error);
    process.exit(1);
  }
}

async function loadConfig() {
  try {
    const configContent = await fs.readFile('.transcripto/config.json', 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(chalk.yellow('⚠️  No .transcripto/config.json found, using defaults'));
    return {
      scan: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.html'],
        exclude: ['node_modules', 'dist', 'build', '.git', 'coverage'],
        minStringLength: 2
      }
    };
  }
}
