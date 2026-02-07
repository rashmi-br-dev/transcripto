# 🌐 DevLingo - Automated Localization CLI

**Intelligent React localization automation that scans projects, extracts UI text, and generates translations using AI.**

## 📋 Table of Contents

- [🎯 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔧 Commands](#-commands)
- [📁 Project Structure](#-project-structure)
- [⚡ Workflow](#-workflow)
- [🎯 Usage Examples](#-usage-examples)
- [⚙️ Configuration](#️-configuration)
- [🔍 Advanced Features](#-advanced-features)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🎯 Features

### ✨ **Core Capabilities**
- **🔍 Smart String Extraction** - Automatically scans React projects for UI text
- **🧠 Technical String Filtering** - Ignores code, CSS classes, file paths
- **📝 JSON-Only Mode** - Clean translation files without constants clutter
- **🌐 AI Translation** - Integrates with lingo.dev for automatic translations
- **👁️ Real-time Watching** - Auto-translates when files change
- **📁 Root i18n Folder** - Clean project organization

### 🚀 **Automation Features**
- **Zero Configuration** - Works out of the box
- **Non-Interactive Mode** - Perfect for CI/CD pipelines
- **Automatic Language Selection** - AI chooses optimal target languages
- **File Monitoring** - Real-time translation updates
- **Clean Output** - Professional project structure

---

## 🚀 Quick Start

### ⚡ **5-Minute Setup**

```bash
# 1. Install DevLingo
npm install -g devlingo@latest

# 2. Go to your React project
cd my-react-app

# 3. Generate initial translations
devlingo generate

# 4. Start auto-watcher (optional)
devlingo watch-i18n
```

### 🎉 **You're done!**
- ✅ Translation files created in `i18n/` folder
- ✅ AI translations generated automatically
- ✅ Real-time updates enabled
- ✅ Ready for production

---

## 📦 Installation

### 🌍 **Global Installation**
```bash
npm install -g devlingo@latest
```

### ✅ **Verify Installation**
```bash
devlingo --version
# Expected: 1.1.16+
```

### 🔧 **System Requirements**
- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- **React** project (for extraction)
- **lingo.dev** account (for translations)

---

## 🔧 Commands

### 📝 **generate** - Generate translation files
```bash
devlingo generate
```
**What it does:**
- 🔍 Scans project for UI text strings
- 🧠 Filters out technical strings
- 📁 Creates `i18n/en.json` with extracted text
- 🌐 Runs lingo.dev for AI translations
- ✅ Generates all language files

### 👁️ **watch-i18n** - Monitor & auto-translate
```bash
devlingo watch-i18n
```
**What it does:**
- 👁️ Watches `i18n/en.json` for changes
- 🔄 Auto-runs translation when file changes
- ⚡ Real-time translation updates
- 🎨 Perfect for development workflow

### 🔍 **scan** - Scan project only
```bash
devlingo scan
```
**What it does:**
- 🔍 Scans project for UI text
- 📊 Shows extraction report
- 📝 Saves to `.devlingo/extracted-strings.json`

### 📊 **report** - Show coverage report
```bash
devlingo report
```
**What it does:**
- 📊 Shows localization coverage
- 📈 Lists found strings
- 🎯 Identifies missing translations

### 🚀 **init** - Initialize project
```bash
devlingo init
```
**What it does:**
- 📁 Creates `.devlingo/` config folder
- ⚙️ Sets up default configuration
- 🎯 Prepares project for localization

---

## 📁 Project Structure

### 📂 **After Running DevLingo**
```
my-project/
├── i18n/                    # 🌐 Translation files
│   ├── en.json            # English source
│   ├── hi.json            # Hindi translations
│   ├── es.json            # Spanish translations
│   └── fr.json            # French translations
├── src/
│   ├── components/
│   │   └── LanguageDropdown.tsx  # Auto-generated
│   └── App.tsx
├── .devlingo/               # 🔧 DevLingo config
│   └── extracted-strings.json
├── .lingodev.json           # 🤖 lingo.dev config
└── package.json
```

### 📝 **Translation File Format**
```json
// i18n/en.json
{
  "welcome_message": "Welcome to our app",
  "get_started": "Get Started",
  "learn_react": "Learn React",
  "hello_world": "Hello world"
}

// i18n/hi.json (Auto-translated)
{
  "welcome_message": "हमार ऐप में आपका स्वागत है",
  "get_started": "शुरू करें",
  "learn_react": "React सीखें",
  "hello_world": "हैलो वर्ल्ड"
}
```

---

## ⚡ Workflow

### 🔄 **Development Workflow**

#### **Step 1: Initial Setup**
```bash
# Navigate to React project
cd my-react-app

# Generate initial translations
devlingo generate
```

**Output:**
```
🔍 Scanning project for UI text strings...
✅ Found 8 UI text strings
✅ Generated i18n files for 8 strings
📁 Translations: ./i18n/
🌍 Languages: en
🌐 Running lingo.dev for translations...
✅ lingo.dev translations completed successfully!
🎨 Created LanguageDropdown.tsx component
```

#### **Step 2: Start Auto-Watcher**
```bash
# Start real-time monitoring
devlingo watch-i18n
```

**Output:**
```
👁️  Starting i18n file watcher...
📁 Monitoring: ./i18n/en.json
🔄 Auto-translating on changes...
🎉 Watcher started successfully!
💡 Add new keys to ./i18n/en.json and they will be auto-translated
⏹️  Press Ctrl+C to stop watching
```

#### **Step 3: Add New Translations**
```bash
# Edit the English source file
vim i18n/en.json

# Add new keys:
{
  "new_feature": "New Feature",
  "settings_page": "Settings",
  "save_button": "Save Changes"
}
```

**Auto-translation happens instantly:**
```
🔄 File changed: ./i18n/en.json
🌐 Running auto-translation...
✅ Auto-translation completed!
```

### 🔄 **Production Workflow**

#### **Step 1: Build Translations**
```bash
# Generate final translations
devlingo generate

# Verify all languages
ls i18n/
# en.json  hi.json  es.json  fr.json
```

#### **Step 2: Integration**
```typescript
// Import translations in React
import enTranslations from './i18n/en.json';
import hiTranslations from './i18n/hi.json';

// Create translation function
const translations = {
  en: enTranslations,
  hi: hiTranslations
};

function t(key: string, language: string = 'en') {
  return translations[language]?.[key] || key;
}

// Use in components
function App() {
  const [language, setLanguage] = useState('en');
  
  return (
    <div>
      <h1>{t('welcome_message', language)}</h1>
      <button onClick={() => setLanguage('hi')}>
        Switch to Hindi
      </button>
    </div>
  );
}
```

---

## 🎯 Usage Examples

### 📱 **Basic React Integration**
```typescript
// src/i18n/index.ts
import enTranslations from './en.json';
import hiTranslations from './hi.json';
import esTranslations from './es.json';
import frTranslations from './fr.json';

export const translations = {
  en: enTranslations,
  hi: hiTranslations,
  es: esTranslations,
  fr: frTranslations
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof enTranslations;

export function t(key: TranslationKey, language: Language = 'en'): string {
  return translations[language]?.[key] || key;
}

// Language switcher component
export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

### 🎨 **Using Auto-Generated Components**
```typescript
// Import the auto-generated language dropdown
import LanguageDropdown from './components/LanguageDropdown';

function App() {
  return (
    <div>
      <LanguageDropdown />
      <h1>Welcome to our app!</h1>
    </div>
  );
}
```

### ⚡ **Real-time Development**
```bash
# Terminal 1: Start watcher
devlingo watch-i18n

# Terminal 2: Edit translations
echo '{"new_string": "Brand new text"}' >> i18n/en.json

# Instant auto-translation!
🔄 File changed: ./i18n/en.json
🌐 Running auto-translation...
✅ Auto-translation completed!
```

---

## ⚙️ Configuration

### 📝 **Default Settings**
DevLingo works out of the box with smart defaults:

```json
{
  "outputDir": "./i18n",
  "languages": ["en"],
  "keyPrefix": "",
  "constantsFile": ""
}
```

### 🤖 **lingo.dev Integration**
```json
// .lingodev.json (auto-generated)
{
  "source": "./i18n/en.json",
  "output": "./i18n",
  "format": "json"
}
```

### 🔧 **Custom Configuration**
```typescript
// Create custom config
const config = {
  outputDir: './translations',    // Custom folder
  languages: ['en', 'de', 'ja'], // Custom languages
  keyPrefix: 'APP_'           // Custom prefix
};

// Use with DevLingo API
import { I18nGenerator } from 'devlingo';

const generator = new I18nGenerator();
await generator.generateI18nFiles(strings, config);
```

---

## 🔍 Advanced Features

### 🧠 **Smart String Filtering**
DevLingo automatically excludes:

**🚫 Technical Strings:**
- CSS class names (`.app-header`, `.btn-primary`)
- File paths (`src/App.tsx`, `components/Header`)
- React component names (`App`, `Header`, `Footer`)
- DOM IDs (`main-content`, `root-element`)
- Package names (`react`, `lodash`, `axios`)

**✅ Includes Only:**
- User-facing text (`"Welcome to our app"`)
- UI labels (`"Save Changes"`, `"Cancel"`)
- Messages (`"Error occurred"`, `"Success!"`)
- Content (`"Learn React"`, `"Getting started"`)

### 🌐 **AI Language Selection**
lingo.dev automatically chooses target languages based on:

- **Content Analysis** - Analyzes extracted text
- **User Preferences** - Your lingo.dev settings
- **Project Type** - Web app, mobile app, etc.
- **Market Context** - Target audience analysis

### 👁️ **Real-time File Watching**
Uses chokidar for efficient file monitoring:

- **Instant Detection** - File changes detected immediately
- **Debounced Updates** - Prevents excessive API calls
- **Error Recovery** - Handles translation failures gracefully
- **Background Processing** - Non-blocking translation workflow

---

## 🐛 Troubleshooting

### ❌ **Common Issues**

#### **"No strings found"**
```bash
# Problem
devlingo generate
⚠️  No strings found

# Solutions
# 1. Check if you're in a React project
ls src/
# Should see App.tsx, components/, etc.

# 2. Verify file extensions
# DevLingo scans: .ts, .tsx, .js, .jsx

# 3. Check for text content
# Ensure you have actual UI text strings
```

#### **"lingo.dev failed"**
```bash
# Problem
🌐 Running lingo.dev for translations...
❌ lingo.dev failed

# Solutions
# 1. Check API key
lingo.dev login

# 2. Verify internet connection
ping lingo.dev

# 3. Check lingo.dev status
curl https://api.lingo.dev/status
```

#### **"Auto-watcher not working"**
```bash
# Problem
devlingo watch-i18n
📁 Monitoring: ./i18n/en.json
# No response to file changes

# Solutions
# 1. Check file permissions
ls -la i18n/en.json

# 2. Verify file path
pwd  # Should be project root

# 3. Test manually
echo '{"test": "test"}' > i18n/en.json
# Should trigger auto-translation
```

### 🔧 **Debug Mode**
```bash
# Enable verbose logging
DEBUG=devlingo devlingo generate

# Check extraction details
cat .devlingo/extracted-strings.json

# Verify lingo.dev config
cat .lingodev.json
```

---

## 📞 **Support & Contributing**

### 🆘 **Getting Help**
```bash
# Show all commands
devlingo --help

# Get help for specific command
devlingo generate --help
devlingo watch-i18n --help
```

### 🐛 **Reporting Issues**
- **GitHub Issues**: [github.com/your-repo/devlingo/issues]
- **Bug Reports**: Include `devlingo --version` and error logs
- **Feature Requests**: Welcome in discussions tab

### 🔧 **Contributing**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code style guidelines

---

## 📄 **License & Credits**

### 📜 **License**
MIT License - Free for commercial and personal use

### 👥 **Credits**
- **Created by**: DevLingo Team
- **AI Translation**: lingo.dev integration
- **File Watching**: chokidar library
- **CLI Framework**: Commander.js

---

## 🎉 **Quick Reference

### 🚀 **One-Command Setup**
```bash
npm install -g devlingo@latest && devlingo generate
```

### 🔄 **Development Loop**
```bash
# Start watcher
devlingo watch-i18n

# Edit translations (in another terminal)
vim i18n/en.json

# Auto-translates instantly!
```

### 📦 **Production Build**
```bash
# Final translations
devlingo generate

# Deploy with confidence
# All i18n/ files ready for production
```

---

**🌐 DevLingo - Intelligent Localization Automation**

*Transform your React app for global audiences in minutes, not hours.*

**Install today:** `npm install -g devlingo@latest`
