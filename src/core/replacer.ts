import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import { promises as fs } from 'fs';
import { ExtractedString } from './stringExtractor';

export interface ReplacementConfig {
  importPath: string;
  importName: string;
  functionName: string;
}

export class TextReplacer {
  private readonly defaultConfig: ReplacementConfig = {
    importPath: './i18n/constants',
    importName: 'TEXT',
    functionName: 't'
  };

  async replaceInFiles(
    strings: ExtractedString[], 
    config: Partial<ReplacementConfig> = {}
  ): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Group strings by file
    const stringsByFile = new Map<string, ExtractedString[]>();
    
    for (const str of strings) {
      if (!stringsByFile.has(str.filePath)) {
        stringsByFile.set(str.filePath, []);
      }
      stringsByFile.get(str.filePath)!.push(str);
    }

    // Process each file
    for (const [filePath, fileStrings] of stringsByFile) {
      await this.replaceInFile(filePath, fileStrings, finalConfig);
    }
  }

  private async replaceInFile(
    filePath: string, 
    strings: ExtractedString[], 
    config: ReplacementConfig
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ast = parse(content, {
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

      let hasChanges = false;
      let needsImport = false;

      // Replace strings in the AST
      traverse(ast, {
        JSXText: (path: any) => {
          const text = path.node.value.trim();
          const matchingString = strings.find(s => s.text === text && s.type === 'jsx');
          
          if (matchingString) {
            const key = matchingString.key.toUpperCase();
            const callExpression = t.jsxExpressionContainer(
              t.callExpression(
                t.identifier(config.functionName),
                [t.memberExpression(
                  t.identifier(config.importName),
                  t.identifier(key)
                )]
              )
            );

            path.replaceWith(callExpression);
            hasChanges = true;
            needsImport = true;
          }
        },

        StringLiteral: (path: any) => {
          const text = path.node.value;
          const matchingString = strings.find(s => s.text === text && s.type === 'string');
          
          if (matchingString && this.isUIText(path)) {
            const key = matchingString.key.toUpperCase();
            const callExpression = t.callExpression(
              t.identifier(config.functionName),
              [t.memberExpression(
                t.identifier(config.importName),
                t.identifier(key)
              )]
            );

            path.replaceWith(callExpression);
            hasChanges = true;
            needsImport = true;
          }
        }
      });

      if (hasChanges) {
        // Add import if needed
        if (needsImport) {
          this.addImport(ast, config);
        }

        // Generate new code
        const result = generate(ast, {
          retainLines: false,
          compact: false
        });

        await fs.writeFile(filePath, result.code, 'utf-8');
        console.log(`✅ Updated ${filePath}`);
      }

    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}:`, error);
    }
  }

  private addImport(ast: any, config: ReplacementConfig): void {
    const textImport = t.importDeclaration(
      [t.importSpecifier(
        t.identifier(config.importName),
        t.identifier(config.importName)
      )],
      t.stringLiteral(config.importPath)
    );

    const functionImport = t.importDeclaration(
      [t.importSpecifier(
        t.identifier('t'),
        t.identifier('t')
      )],
      t.stringLiteral(config.importPath.replace('/constants', ''))
    );

    // Find the first import statement or the top of the file
    let insertIndex = 0;
    
    traverse(ast, {
      Program: (path: any) => {
        for (let i = 0; i < path.node.body.length; i++) {
          if (t.isImportDeclaration(path.node.body[i])) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        path.node.body.splice(insertIndex, 0, textImport);
        path.node.body.splice(insertIndex + 1, 0, functionImport);
      }
    });
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
    
    // Technical identifiers
    const technicalPatterns = /^[a-z][a-z0-9_-]*$/;
    
    // Check against all patterns
    return domIds.includes(text) ||
           packageNames.includes(text) ||
           filePatterns.test(text) ||
           urlPatterns.test(text) ||
           envPatterns.test(text) ||
           (technicalPatterns.test(text) && text.length < 20);
  }
}
