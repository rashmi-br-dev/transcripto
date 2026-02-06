const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// File upload for project path
const upload = multer({ dest: 'uploads/' });

// API Routes

// Setup lingo.dev configuration
app.post('/api/setup', async (req, res) => {
  try {
    const { email, apiKey, projectPath } = req.body;
    
    // Create .env file
    const envContent = `# DevLingo Configuration
LINGO_DEV_EMAIL=${email}
LINGO_DEV_API_KEY=${apiKey}
LINGO_DEV_TARGET_LANGUAGES=
PROJECT_PATH=${projectPath || './'}
`;

    await fs.writeFile('.env', envContent);
    
    res.json({ 
      success: true, 
      message: 'Configuration saved successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Scan project for text strings
app.post('/api/scan', async (req, res) => {
  try {
    const { projectPath } = req.body;
    
    // Run devlingo scan command
    const scanProcess = spawn('npx', ['devlingo', 'scan'], {
      cwd: projectPath || './',
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    scanProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    scanProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    scanProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          success: true, 
          message: 'Scanning completed',
          output 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: error || 'Scanning failed' 
        });
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate i18n files and translate
app.post('/api/generate', async (req, res) => {
  try {
    const { projectPath, sourceLanguage, targetLanguages } = req.body;
    
    // Update .env with target languages
    const envContent = `# DevLingo Configuration
LINGO_DEV_EMAIL=${process.env.LINGO_DEV_EMAIL}
LINGO_DEV_API_KEY=${process.env.LINGO_DEV_API_KEY}
LINGO_DEV_TARGET_LANGUAGES=${targetLanguages.join(',')}
PROJECT_PATH=${projectPath || './'}
`;
    await fs.writeFile('.env', envContent);

    // Run devlingo generate command
    const generateProcess = spawn('npx', ['devlingo', 'generate'], {
      cwd: projectPath || './',
      stdio: 'pipe',
      env: {
        ...process.env,
        LINGO_DEV_TARGET_LANGUAGES: targetLanguages.join(',')
      }
    });

    let output = '';
    let error = '';

    generateProcess.stdout.on('data', (data) => {
      output += data.toString();
      // Send progress updates via WebSocket or SSE
      if (output.includes('✅') || output.includes('100%')) {
        // Send progress update
      }
    });

    generateProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    generateProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          success: true, 
          message: 'Generation completed',
          output 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: error || 'Generation failed' 
        });
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get project files
app.get('/api/files/:projectPath(*)', async (req, res) => {
  try {
    const projectPath = req.params.projectPath || './';
    const i18nPath = path.join(projectPath, 'src/i18n');
    
    const files = await fs.readdir(i18nPath);
    const fileContents = {};
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(i18nPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        fileContents[file] = JSON.parse(content);
      }
    }
    
    res.json({ 
      success: true, 
      files: fileContents 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Download generated files
app.get('/api/download/:projectPath(*)', async (req, res) => {
  try {
    const projectPath = req.params.projectPath || './';
    const i18nPath = path.join(projectPath, 'src/i18n');
    
    // Create zip file (simplified - in production use archiver)
    res.json({ 
      success: true, 
      message: 'Download functionality would create zip file here',
      path: i18nPath 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 DevLingo Web UI Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to start`);
});
