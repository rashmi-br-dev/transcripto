import { FileInfo } from './projectScanner';
export interface ExtractedString {
    text: string;
    key: string;
    filePath: string;
    line: number;
    column: number;
    type: 'jsx' | 'string' | 'template';
}
export declare class StringExtractor {
    private readonly minStringLength;
    private readonly excludePatterns;
    extractStrings(files: FileInfo[]): Promise<ExtractedString[]>;
    private extractFromFile;
    private isValidString;
    private isUIText;
    private isTechnicalString;
    private generateKey;
    private deduplicateStrings;
}
//# sourceMappingURL=stringExtractor.d.ts.map