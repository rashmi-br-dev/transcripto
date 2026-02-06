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

    // Check if it's likely UI text (contains letters)
    if (!/[a-zA-Z]/.test(text)) {
      return false;
    }

    // Check exclude patterns
    for (const pattern of this.excludePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }

    // Exclude very technical strings
    if (text.includes('=>') || text.includes('function') || text.includes('const ')) {
      return false;
    }

    return true;
  }

  private isUIText(path: any): boolean {
    const parent = path.parent;
    
    // Exclude keys in objects
    if (t.isObjectProperty(parent) && parent.key === path.node) {
      return false;
    }

    // Exclude import statements
    if (t.isImportDeclaration(parent)) {
      return false;
    }

    // Exclude require calls
    if (t.isCallExpression(parent) && 
        t.isIdentifier(parent.callee) && 
        parent.callee.name === 'require') {
      return false;
    }

    // Exclude variable declarations that look like constants
    if (t.isVariableDeclarator(parent) && 
        t.isIdentifier(parent.id) && 
        /^[A-Z_]+$/.test(parent.id.name)) {
      return false;
    }

    return true;
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
