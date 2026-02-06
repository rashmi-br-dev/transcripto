import { promises as fs } from 'fs';
import chalk from 'chalk';
import { ExtractedString } from '../core/stringExtractor';

interface ReportData {
  totalStrings: number;
  filesScanned: number;
  languages: string[];
  coverage: number;
  missingTranslations: string[];
  stringsByFile: Record<string, number>;
}

export async function reportCommand(): Promise<void> {
  console.log(chalk.blue('📊 Generating localization report...'));

  try {
    const report = await generateReport();
    displayReport(report);

  } catch (error) {
    console.error(chalk.red('❌ Report generation failed:'), error);
    process.exit(1);
  }
}

async function generateReport(): Promise<ReportData> {
  // Load extracted strings
  const strings = await loadExtractedStrings();
  
  // Load config
  const config = await loadConfig();
  
  // Load existing translations
  const translations = await loadTranslations(config.i18n.languages);
  
  // Calculate metrics
  const filesScanned = new Set(strings.map(s => s.filePath)).size;
  const stringsByFile: Record<string, number> = {};
  
  strings.forEach(str => {
    const fileName = str.filePath.split('/').pop() || str.filePath;
    stringsByFile[fileName] = (stringsByFile[fileName] || 0) + 1;
  });

  // Check missing translations
  const missingTranslations: string[] = [];
  for (const lang of config.i18n.languages) {
    if (lang !== 'en' && (!translations[lang] || Object.keys(translations[lang]).length < strings.length)) {
      missingTranslations.push(lang);
    }
  }

  const coverage = strings.length > 0 
    ? Math.round((translations.en ? Object.keys(translations.en).length : 0) / strings.length * 100)
    : 0;

  return {
    totalStrings: strings.length,
    filesScanned,
    languages: config.i18n.languages,
    coverage,
    missingTranslations,
    stringsByFile
  };
}

function displayReport(report: ReportData): void {
  console.log(chalk.green('\n📈 DevLingo Localization Report'));
  console.log(chalk.gray('='.repeat(40)));
  
  console.log(chalk.white(`\n📝 Total Strings: ${report.totalStrings}`));
  console.log(chalk.white(`📁 Files Scanned: ${report.filesScanned}`));
  console.log(chalk.white(`🌐 Languages: ${report.languages.join(', ')}`));
  
  // Coverage with color coding
  let coverageColor = chalk.red;
  if (report.coverage >= 80) coverageColor = chalk.green;
  else if (report.coverage >= 50) coverageColor = chalk.yellow;
  
  console.log(coverageColor(`📊 Coverage: ${report.coverage}%`));
  
  // Missing translations
  if (report.missingTranslations.length > 0) {
    console.log(chalk.red(`\n⚠️  Missing Translations: ${report.missingTranslations.join(', ')}`));
  } else {
    console.log(chalk.green('\n✅ All languages have complete translations'));
  }
  
  // Strings by file
  if (Object.keys(report.stringsByFile).length > 0) {
    console.log(chalk.white('\n📋 Strings by File:'));
    const sortedFiles = Object.entries(report.stringsByFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedFiles.forEach(([file, count]) => {
      console.log(chalk.gray(`  ${file}: ${count} strings`));
    });
    
    if (Object.keys(report.stringsByFile).length > 10) {
      console.log(chalk.gray(`  ... and ${Object.keys(report.stringsByFile).length - 10} more files`));
    }
  }
  
  // Recommendations
  console.log(chalk.white('\n💡 Recommendations:'));
  
  if (report.totalStrings === 0) {
    console.log(chalk.yellow('  • Run "devlingo scan" to extract UI strings'));
  } else if (report.coverage < 100) {
    console.log(chalk.yellow('  • Run "devlingo generate" to update translation files'));
  }
  
  if (report.missingTranslations.length > 0) {
    console.log(chalk.yellow('  • Run "npx lingo.dev@latest run" to generate missing translations'));
  }
  
  if (report.totalStrings > 0 && report.coverage === 100) {
    console.log(chalk.green('  • Localization is complete! 🎉'));
  }
}

async function loadExtractedStrings(): Promise<ExtractedString[]> {
  try {
    const content = await fs.readFile('.devlingo/extracted-strings.json', 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function loadConfig() {
  try {
    const configContent = await fs.readFile('.devlingo/config.json', 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    return {
      i18n: {
        languages: ['en', 'hi', 'kn'],
        outputDir: './src/i18n'
      }
    };
  }
}

async function loadTranslations(languages: string[]): Promise<Record<string, Record<string, string>>> {
  const translations: Record<string, Record<string, string>> = {};
  
  for (const lang of languages) {
    try {
      const content = await fs.readFile(`./src/i18n/${lang}.json`, 'utf-8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      translations[lang] = {};
    }
  }
  
  return translations;
}
