const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface SetupRequest {
  email: string;
  apiKey: string;
  projectPath: string;
}

export interface ScanRequest {
  projectPath: string;
}

export interface GenerateRequest {
  projectPath: string;
  sourceLanguage: string;
  targetLanguages: string[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  output?: string;
}

export interface FilesResponse {
  success: boolean;
  files?: Record<string, any>;
  error?: string;
}

// API Functions
export const api = {
  // Setup lingo.dev configuration
  async setup(data: SetupRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Scan project for text strings
  async scan(data: ScanRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Generate i18n files and translate
  async generate(data: GenerateRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get generated files
  async getFiles(projectPath: string = ''): Promise<FilesResponse> {
    const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(projectPath)}`);
    return response.json();
  },

  // Download files
  async downloadFiles(projectPath: string = ''): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/download/${encodeURIComponent(projectPath)}`);
    return response.json();
  },
};
