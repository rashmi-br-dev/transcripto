import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { FileInfo } from './projectScanner';

export interface ExtractedString {
  text: string;
  key: string;
  filePath: string;
  line: number;
  column: number;
  type: 'jsx' | 'string' | 'template';
}

export class StringExtractor {
  private readonly minStringLength = 2;
  private readonly excludePatterns = [
    /^[a-zA-Z]+\.[a-zA-Z]+$/, // property access
    /^[{}()\[\]]$/, // single brackets
    /^\d+$/, // numbers only
    /^[a-zA-Z]$/, // single letters
  ];

  async extractStrings(files: FileInfo[]): Promise<ExtractedString[]> {
    const extractedStrings: ExtractedString[] = [];

    for (const file of files) {
      const strings = await this.extractFromFile(file);
      extractedStrings.push(...strings);
    }

    return this.deduplicateStrings(extractedStrings);
  }

  private async extractFromFile(file: FileInfo): Promise<ExtractedString[]> {
    const strings: ExtractedString[] = [];
    
    try {
      const ast = parse(file.content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining'
        ]
      });

      const lines = file.content.split('\n');

      traverse(ast, {
        // JSX text content
        JSXText: (path: any) => {
          const text = path.node.value.trim();
          if (this.isValidString(text)) {
            const loc = path.node.loc;
            if (loc) {
              strings.push({
                text,
                key: this.generateKey(text),
                filePath: file.path,
                line: loc.start.line,
                column: loc.start.column,
                type: 'jsx'
              });
            }
          }
        },

        // String literals
        StringLiteral: (path: any) => {
          const text = path.node.value;
          if (this.isValidString(text) && this.isUIText(path)) {
            const loc = path.node.loc;
            if (loc) {
              strings.push({
                text,
                key: this.generateKey(text),
                filePath: file.path,
                line: loc.start.line,
                column: loc.start.column,
                type: 'string'
              });
            }
          }
        },

        // Template literals
        TemplateLiteral: (path: any) => {
          if (path.node.expressions.length === 0) {
            const text = path.node.quasis[0]?.value.raw;
            if (text && this.isValidString(text)) {
              const loc = path.node.loc;
              if (loc) {
                strings.push({
                  text,
                  key: this.generateKey(text),
                  filePath: file.path,
                  line: loc.start.line,
                  column: loc.start.column,
                  type: 'template'
                });
              }
            }
          }
        }
      });

    } catch (error) {
      console.warn(`Warning: Could not parse file ${file.path}:`, error);
    }

    return strings;
  }

  private isValidString(text: string): boolean {
    if (!text || text.length < this.minStringLength) {
      return false;
    }

    // Check if it's likely UI text (contains letters and spaces)
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasSpaces = /\s/.test(text);
    const isSentence = /[.!?]$/.test(text);
    const isPhrase = text.split(' ').length >= 2;
    
    // Must have letters and either spaces or be a complete sentence
    if (!hasLetters) {
      return false;
    }
    
    // Accept if it has spaces (likely a phrase) or is a complete sentence
    if (hasSpaces || isSentence || isPhrase) {
      return true;
    }
    
    // For single words, only accept if they're longer and look like UI text
    if (text.length >= 4 && /^[A-Z][a-z]+$/.test(text)) {
      return true;
    }
    
    // Reject technical strings, single words, or very short strings
    return false;
  }

  private isUIText(path: any): boolean {
    const parent = path.parent;
    const text = path.node.value;
    
    // Exclude technical strings that should never be localized
    if (this.isTechnicalString(text)) {
      return false;
    }
    
    // Exclude keys in objects
    if (t.isObjectProperty(parent) && parent.key === path.node) {
      return false;
    }

    // Exclude import statements
    if (t.isImportDeclaration(parent)) {
      return false;
    }

    // Exclude import() calls (dynamic imports)
    if (t.isCallExpression(parent) && 
        parent.callee.type === 'Import') {
      return false;
    }

    // Exclude require calls
    if (t.isCallExpression(parent) && 
        t.isIdentifier(parent.callee) && 
        parent.callee.name === 'require') {
      return false;
    }

    // Exclude document.getElementById calls
    if (t.isCallExpression(parent) && 
        t.isMemberExpression(parent.callee) &&
        t.isIdentifier(parent.callee.object) &&
        parent.callee.object.name === 'document' &&
        t.isIdentifier(parent.callee.property) &&
        parent.callee.property.name === 'getElementById') {
      return false;
    }

    // Exclude variable declarations that look like constants
    if (t.isVariableDeclarator(parent) && 
        t.isIdentifier(parent.id) && 
        /^[A-Z_]+$/.test(parent.id.name)) {
      return false;
    }

    // Exclude test function names
    if (t.isCallExpression(parent) && 
        t.isIdentifier(parent.callee) && 
        parent.callee.name === 'test') {
      return false;
    }

    return true;
  }

  private isTechnicalString(text: string): boolean {
    // DOM IDs that should never be localized
    const domIds = ['root', 'app', 'main', 'header', 'footer', 'nav', 'sidebar', 'content'];
    
    // Package names that should never be localized
    const packageNames = ['web-vitals', 'react', 'react-dom', 'react-scripts'];
    
    // File extensions and paths
    const filePatterns = /\.(js|ts|tsx|jsx|json|css|html|svg|png|jpg|jpeg|gif|ico)$/;
    
    // URLs and protocols
    const urlPatterns = /^(https?:\/\/|ftp:\/\/|mailto:|tel:)/;
    
    // Environment variables and config keys
    const envPatterns = /^[A-Z_]+$/;
    
    // Technical identifiers (short, lowercase with underscores/hyphens)
    const technicalPatterns = /^[a-z][a-z0-9_-]*$/;
    
    // Additional patterns for React-specific technical strings
    const reactPatterns = /^(app|src|component|element|container|wrapper|header|footer|nav|sidebar|content|main|root)([A-Z][a-z0-9]*)*$/;
    
    // Check if it's a CSS class or ID pattern
    const cssPatterns = /^[a-z][a-z0-9-]*-[a-z][a-z0-9-]*$/;
    
    // Check if it's a file path or component name
    const filePathPatterns = /^[a-z][a-z0-9]*\.[a-z]+$/;
    
    // Check against all patterns
    return domIds.includes(text) ||
           packageNames.includes(text) ||
           filePatterns.test(text) ||
           urlPatterns.test(text) ||
           envPatterns.test(text) ||
           (technicalPatterns.test(text) && text.length < 20) ||
           reactPatterns.test(text) ||
           cssPatterns.test(text) ||
           filePathPatterns.test(text) ||
           text.includes('.') && text.includes('/') ||
           text.includes('_') && text.length < 15;
  }

  private generateKey(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^[^a-z]/, '')
      .substring(0, 50);
  }

  private deduplicateStrings(strings: ExtractedString[]): ExtractedString[] {
    const seen = new Map<string, ExtractedString>();
    
    for (const str of strings) {
      const existing = seen.get(str.text);
      if (!existing || str.type === 'jsx') {
        seen.set(str.text, str);
      }
    }
    
    return Array.from(seen.values());
  }
}
