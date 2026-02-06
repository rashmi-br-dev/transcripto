"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectScanner = void 0;
const glob_1 = require("glob");
const fs_1 = require("fs");
class ProjectScanner {
    constructor() {
        this.extensions = ['.ts', '.tsx', '.js', '.jsx', '.html'];
        this.excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.git/**',
            '**/coverage/**'
        ];
    }
    async scanProject(rootPath = process.cwd()) {
        const pattern = `**/*.{${this.extensions.map(ext => ext.slice(1)).join(',')}}`;
        const files = await (0, glob_1.glob)(pattern, {
            cwd: rootPath,
            ignore: this.excludePatterns,
            absolute: true
        });
        const fileInfos = [];
        for (const filePath of files) {
            try {
                const content = await fs_1.promises.readFile(filePath, 'utf-8');
                const stats = await fs_1.promises.stat(filePath);
                fileInfos.push({
                    path: filePath,
                    content,
                    size: stats.size
                });
            }
            catch (error) {
                console.warn(`Warning: Could not read file ${filePath}:`, error);
            }
        }
        return fileInfos;
    }
    async getProjectStructure(rootPath = process.cwd()) {
        const pattern = '**/*';
        const files = await (0, glob_1.glob)(pattern, {
            cwd: rootPath,
            ignore: this.excludePatterns,
            absolute: false,
            nodir: true
        });
        return files.sort();
    }
}
exports.ProjectScanner = ProjectScanner;
//# sourceMappingURL=projectScanner.js.map