import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import * as chokidar from 'chokidar';
import { I18nGenerator } from '../core/i18nGenerator';
import { ProjectScanner } from '../core/projectScanner';
import { StringExtractor } from '../core/stringExtractor';
import { ExtractedString } from '../core/stringExtractor';

export async function watchCommand(options: any): Promise<void> {
  console.log(chalk.blue('👁️  Starting Transcripto file watcher...'));
  
  const yes = options.yes || false;
  
  if (yes) {
    console.log(chalk.yellow('🤖 Running in non-interactive mode (--yes)'));
  }

  // Initial setup
  await setupProject(yes);

  // Watch for file changes
  const watcher = chokidar.watch([
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/i18n/**/*',
    '!dist/**/*',
    '!node_modules/**/*'
  ], {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true
  });

  console.log(chalk.green('📁 Watching for changes in src/ directory...'));
  console.log(chalk.gray('💡 Press Ctrl+C to stop watching'));

  watcher.on('change', async (filePath: string) => {
    console.log(chalk.yellow(`\n📝 File changed: ${filePath}`));
    await handleFileChange(filePath, yes);
  });

  watcher.on('add', async (filePath: string) => {
    console.log(chalk.yellow(`\n➕ File added: ${filePath}`));
    await handleFileChange(filePath, yes);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log(chalk.cyan('\n👋 Stopping Transcripto watcher...'));
    watcher.close();
    process.exit(0);
  });
}

async function setupProject(yes: boolean): Promise<void> {
  try {
    // Check if project is initialized
    try {
      await fs.access('.transcripto');
      console.log(chalk.green('✅ Transcripto project already initialized'));
    } catch {
      console.log(chalk.yellow('🔧 Initializing Transcripto project...'));
      const { initCommand } = await import('./init');
      await initCommand();
    }

    // Initial scan and generation
    console.log(chalk.blue('🔍 Performing initial scan...'));
    await performFullWorkflow(yes);
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error);
    process.exit(1);
  }
}

async function handleFileChange(filePath: string, yes: boolean): Promise<void> {
  try {
    console.log(chalk.cyan('🔄 Updating translations...'));
    
    // Perform full workflow
    await performFullWorkflow(yes);
    
    console.log(chalk.green('✅ Translations updated successfully!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Update failed:'), error);
  }
}

async function performFullWorkflow(yes: boolean): Promise<void> {
  // Scan for strings
  const scanner = new ProjectScanner();
  const files = await scanner.scanProject('./src');
  
  const extractor = new StringExtractor();
  const strings = await extractor.extractStrings(files);
  
  if (strings.length === 0) {
    console.log(chalk.yellow('⚠️  No strings found'));
    return;
  }

  // Generate i18n files using same config as generate command
  const generator = new I18nGenerator();
  const config = {
    outputDir: './i18n', // Changed to root folder
    languages: ['en'], // Start with just English, lingo.dev will add more
    constantsFile: '', // No constants file needed
    keyPrefix: ''
  };
  
  await generator.generateI18nFiles(strings, config);
  await generator.generateLingoDevConfig(); // Let lingo.dev decide target languages

  // Run lingo.dev automatically
  try {
    await generator.runLingoDev();
    console.log(chalk.green('🌐 lingo.dev translations completed!'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  lingo.dev failed, continuing...'));
  }

  // Replace strings with constants
  // const replacer = new TextReplacer();
  // await replacer.replaceInFiles(strings);
  
  console.log(chalk.green(`✅ Processed ${strings.length} strings`));
}
