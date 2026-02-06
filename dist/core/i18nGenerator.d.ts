import { ExtractedString } from './stringExtractor';
export interface I18nConfig {
    outputDir: string;
    languages: string[];
    constantsFile: string;
    keyPrefix: string;
}
export declare class I18nGenerator {
    private readonly defaultConfig;
    generateI18nFiles(strings: ExtractedString[], config?: Partial<I18nConfig>): Promise<void>;
    private generateConstantsFile;
    private generateTranslationFile;
    generateLingoDevConfig(): Promise<void>;
    runLingoDev(): Promise<void>;
}
//# sourceMappingURL=i18nGenerator.d.ts.map