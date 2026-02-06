import { ExtractedString } from './stringExtractor';
export interface ReplacementConfig {
    importPath: string;
    importName: string;
    functionName: string;
}
export declare class TextReplacer {
    private readonly defaultConfig;
    replaceInFiles(strings: ExtractedString[], config?: Partial<ReplacementConfig>): Promise<void>;
    private replaceInFile;
    private addImport;
    private isUIText;
}
//# sourceMappingURL=replacer.d.ts.map