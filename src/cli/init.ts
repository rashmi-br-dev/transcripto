import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

export async function initCommand(options: any = {}): Promise<void> {
  console.log(chalk.blue('🚀 Initializing Transcripto in your project...'));
  
  const yes = options.yes || false;
  
  if (yes) {
    console.log(chalk.yellow('🤖 Running in non-interactive mode (--yes)'));
  }

  try {
    // Create .transcripto directory
    await fs.mkdir('.transcripto', { recursive: true });

    // Create config file
    const config = {
      version: '1.1.5',
      scan: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.html'],
        exclude: ['node_modules', 'dist', 'build', '.git', 'coverage', 'src/i18n'],
        minStringLength: 2
      },
      i18n: {
        outputDir: './src/i18n',
        languages: ['en', 'hi', 'es', 'fr'],
        constantsFile: './src/i18n/constants.ts',
        keyPrefix: ''
      },
      replacement: {
        importPath: './i18n/constants',
        importName: 'TEXT',
        functionName: 't'
      }
    };

    await fs.writeFile(
      '.transcripto/config.json', 
      JSON.stringify(config, null, 2), 
      'utf-8'
    );

    // Create i18n directory structure
    await fs.mkdir('./src/i18n', { recursive: true });

    // Create initial i18n helper
    const helperContent = `// Transcripto i18n helper
import { TEXT } from './constants';

export function t(key: keyof typeof TEXT): string {
  // In a real app, you would use the current locale
  // For now, return English text
  return TEXT[key] as string;
}

export function setLocale(locale: string): void {
  // TODO: Implement locale switching
  console.log(\`Locale set to: \${locale}\`);
}
`;

    await fs.writeFile('./src/i18n/index.ts', helperContent, 'utf-8');

    // Create empty constants file
    const constantsContent = `// Auto-generated localization constants
export const TEXT = {};

export type TextKey = keyof typeof TEXT;
`;

    await fs.writeFile('./src/i18n/constants.ts', constantsContent, 'utf-8');

    // Create empty translation files
    for (const lang of config.i18n.languages) {
      await fs.writeFile(
        `./src/i18n/${lang}.json`, 
        JSON.stringify({}, null, 2), 
        'utf-8'
      );
    }

    console.log(chalk.green('✅ Transcripto initialized successfully!'));
    console.log(chalk.gray('📁 Created .transcripto/config.json'));
    console.log(chalk.gray('📁 Created src/i18n/ directory structure'));
    console.log(chalk.yellow('\n🎯 Next steps:'));
    console.log(chalk.white('  transcripto scan     - Scan for UI text strings'));
    console.log(chalk.white('  transcripto generate - Generate i18n files'));
    console.log(chalk.white('  transcripto replace  - Replace inline text with constants'));

  } catch (error) {
    console.error(chalk.red('❌ Initialization failed:'), error);
    process.exit(1);
  }
}
