import chalk from 'chalk';
import { promises as fs } from 'fs';
import chokidar from 'chokidar';
import { ProjectScanner } from '../core/projectScanner';
import { StringExtractor } from '../core/stringExtractor';
import { I18nGenerator } from '../core/i18nGenerator';

export async function watchI18nCommand(): Promise<void> {
  console.log(chalk.cyan('👁️  Starting i18n file watcher...'));
  console.log(chalk.gray('📁 Monitoring: ./i18n/en.json'));
  console.log(chalk.gray('🔄 Auto-translating on changes...\n'));

  // Ensure i18n directory exists
  try {
    await fs.mkdir('./i18n', { recursive: true });
  } catch {
    // Directory already exists
  }

  // Initial translation if en.json exists
  try {
    const enContent = await fs.readFile('./i18n/en.json', 'utf-8');
    const translations = JSON.parse(enContent);
    const keys = Object.keys(translations);
    
    if (keys.length > 0) {
      console.log(chalk.yellow('📝 Found existing translations, running initial translation...'));
      await runTranslation();
    }
  } catch {
    console.log(chalk.yellow('📝 No existing en.json found, waiting for file creation...'));
  }

  // Watch for changes in en.json
  const watcher = chokidar.watch('./i18n/en.json', {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('change', async () => {
    console.log(chalk.cyan('\n🔄 File changed: ./i18n/en.json'));
    console.log(chalk.yellow('🌐 Running auto-translation...'));
    
    try {
      await runTranslation();
      console.log(chalk.green('✅ Auto-translation completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Auto-translation failed:'), error);
    }
  });

  watcher.on('add', async () => {
    console.log(chalk.cyan('\n📁 File created: ./i18n/en.json'));
    console.log(chalk.yellow('🌐 Running initial translation...'));
    
    try {
      await runTranslation();
      console.log(chalk.green('✅ Initial translation completed!'));
    } catch (error) {
      console.error(chalk.red('❌ Initial translation failed:'), error);
    }
  });

  console.log(chalk.green('🎉 Watcher started successfully!'));
  console.log(chalk.gray('💡 Add new keys to ./i18n/en.json and they will be auto-translated'));
  console.log(chalk.gray('⏹️  Press Ctrl+C to stop watching\n'));
}

async function runTranslation() {
  const generator = new I18nGenerator();
  
  // Generate lingo.dev config for root/i18n
  await generator.generateLingoDevConfig();
  
  // Run lingo.dev translation
  await generator.runLingoDev();
}
