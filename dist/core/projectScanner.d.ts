export interface FileInfo {
    path: string;
    content: string;
    size: number;
}
export declare class ProjectScanner {
    private readonly extensions;
    private readonly excludePatterns;
    scanProject(rootPath?: string): Promise<FileInfo[]>;
    getProjectStructure(rootPath?: string): Promise<string[]>;
}
//# sourceMappingURL=projectScanner.d.ts.map