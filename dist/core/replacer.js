"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReplacer = void 0;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const generator_1 = require("@babel/generator");
const fs_1 = require("fs");
class TextReplacer {
    constructor() {
        this.defaultConfig = {
            importPath: './i18n/constants',
            importName: 'TEXT',
            functionName: 't'
        };
    }
    async replaceInFiles(strings, config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config };
        // Group strings by file
        const stringsByFile = new Map();
        for (const str of strings) {
            if (!stringsByFile.has(str.filePath)) {
                stringsByFile.set(str.filePath, []);
            }
            stringsByFile.get(str.filePath).push(str);
        }
        // Process each file
        for (const [filePath, fileStrings] of stringsByFile) {
            await this.replaceInFile(filePath, fileStrings, finalConfig);
        }
    }
    async replaceInFile(filePath, strings, config) {
        try {
            const content = await fs_1.promises.readFile(filePath, 'utf-8');
            const ast = (0, parser_1.parse)(content, {
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
            (0, traverse_1.default)(ast, {
                JSXText: (path) => {
                    const text = path.node.value.trim();
                    const matchingString = strings.find(s => s.text === text && s.type === 'jsx');
                    if (matchingString) {
                        const key = matchingString.key.toUpperCase();
                        const callExpression = t.jsxExpressionContainer(t.callExpression(t.identifier(config.functionName), [t.memberExpression(t.identifier(config.importName), t.identifier(key))]));
                        path.replaceWith(callExpression);
                        hasChanges = true;
                        needsImport = true;
                    }
                },
                StringLiteral: (path) => {
                    const text = path.node.value;
                    const matchingString = strings.find(s => s.text === text && s.type === 'string');
                    if (matchingString && this.isUIText(path)) {
                        const key = matchingString.key.toUpperCase();
                        const callExpression = t.callExpression(t.identifier(config.functionName), [t.memberExpression(t.identifier(config.importName), t.identifier(key))]);
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
                const result = (0, generator_1.generate)(ast, {
                    retainLines: false,
                    compact: false
                });
                await fs_1.promises.writeFile(filePath, result.code, 'utf-8');
                console.log(`✅ Updated ${filePath}`);
            }
        }
        catch (error) {
            console.warn(`Warning: Could not process file ${filePath}:`, error);
        }
    }
    addImport(ast, config) {
        const textImport = t.importDeclaration([t.importSpecifier(t.identifier(config.importName), t.identifier(config.importName))], t.stringLiteral(config.importPath));
        const functionImport = t.importDeclaration([t.importSpecifier(t.identifier('t'), t.identifier('t'))], t.stringLiteral(config.importPath.replace('/constants', '')));
        // Find the first import statement or the top of the file
        let insertIndex = 0;
        (0, traverse_1.default)(ast, {
            Program: (path) => {
                for (let i = 0; i < path.node.body.length; i++) {
                    if (t.isImportDeclaration(path.node.body[i])) {
                        insertIndex = i + 1;
                    }
                    else {
                        break;
                    }
                }
                path.node.body.splice(insertIndex, 0, textImport);
                path.node.body.splice(insertIndex + 1, 0, functionImport);
            }
        });
    }
    isUIText(path) {
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
    isTechnicalString(text) {
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
exports.TextReplacer = TextReplacer;
//# sourceMappingURL=replacer.js.map