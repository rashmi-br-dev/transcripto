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
exports.StringExtractor = void 0;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
class StringExtractor {
    constructor() {
        this.minStringLength = 2;
        this.excludePatterns = [
            /^[a-zA-Z]+\.[a-zA-Z]+$/, // property access
            /^[{}()\[\]]$/, // single brackets
            /^\d+$/, // numbers only
            /^[a-zA-Z]$/, // single letters
        ];
    }
    async extractStrings(files) {
        const extractedStrings = [];
        for (const file of files) {
            const strings = await this.extractFromFile(file);
            extractedStrings.push(...strings);
        }
        return this.deduplicateStrings(extractedStrings);
    }
    async extractFromFile(file) {
        const strings = [];
        try {
            const ast = (0, parser_1.parse)(file.content, {
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
            (0, traverse_1.default)(ast, {
                // JSX text content
                JSXText: (path) => {
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
                StringLiteral: (path) => {
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
                TemplateLiteral: (path) => {
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
        }
        catch (error) {
            console.warn(`Warning: Could not parse file ${file.path}:`, error);
        }
        return strings;
    }
    isValidString(text) {
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
    isUIText(path) {
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
    generateKey(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/^[^a-z]/, '')
            .substring(0, 50);
    }
    deduplicateStrings(strings) {
        const seen = new Map();
        for (const str of strings) {
            const existing = seen.get(str.text);
            if (!existing || str.type === 'jsx') {
                seen.set(str.text, str);
            }
        }
        return Array.from(seen.values());
    }
}
exports.StringExtractor = StringExtractor;
//# sourceMappingURL=stringExtractor.js.map