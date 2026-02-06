import { glob } from 'glob';
import { promises as fs } from 'fs';
import path from 'path';

export interface FileInfo {
  path: string;
  content: string;
  size: number;
}

export class ProjectScanner {
  private readonly extensions = ['.ts', '.tsx', '.js', '.jsx', '.html'];
  private readonly excludePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**'
  ];

  async scanProject(rootPath: string = process.cwd()): Promise<FileInfo[]> {
    const pattern = `**/*.{${this.extensions.map(ext => ext.slice(1)).join(',')}}`;
    
    const files = await glob(pattern, {
      cwd: rootPath,
      ignore: this.excludePatterns,
      absolute: true
    });

    const fileInfos: FileInfo[] = [];

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        fileInfos.push({
          path: filePath,
          content,
          size: stats.size
        });
      } catch (error) {
        console.warn(`Warning: Could not read file ${filePath}:`, error);
      }
    }

    return fileInfos;
  }

  async getProjectStructure(rootPath: string = process.cwd()): Promise<string[]> {
    const pattern = '**/*';
    
    const files = await glob(pattern, {
      cwd: rootPath,
      ignore: this.excludePatterns,
      absolute: false,
      nodir: true
    });

    return files.sort();
  }
}
