# 🎯 Complete Guide: Create React App with DevLingo Integration

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create New React Project](#step-1-create-new-react-project)
3. [Step 2: Set Up Project Structure](#step-2-set-up-project-structure)
4. [Step 3: Create Sample Content](#step-3-create-sample-content)
5. [Step 4: Install DevLingo](#step-4-install-devlingo)
6. [Step 5: Initialize DevLingo](#step-5-initialize-devlingo)
7. [Step 6: Scan for Text Strings](#step-6-scan-for-text-strings)
8. [Step 7: Generate i18n Files](#step-7-generate-i18n-files)
9. [Step 8: Replace Text with Constants](#step-8-replace-text-with-constants)
10. [Step 9: Create Language Dropdown](#step-9-create-language-dropdown)
11. [Step 10: Test Language Switching](#step-10-test-language-switching)
12. [Step 11: Final Integration](#step-11-final-integration)

---

## 📚 Prerequisites

Before you start, make sure you have:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **DevLingo CLI** installed globally:
  ```bash
  npm install -g devlingo@latest
  ```

---

## Step 1: Create New React Project

Create a new directory for your React app:

```bash
# Create project directory
mkdir my-localized-app
cd my-localized-app

# Initialize React project
npx create-react-app . --template typescript
```

This will create a standard React TypeScript project with the following structure:
```
my-localized-app/
├── public/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

---

## Step 2: Set Up Project Structure

Navigate to your project and install additional dependencies:

```bash
cd my-localized-app

# Install DevLingo as local dependency (optional but recommended)
npm install devlingo

# Install additional UI libraries for better experience
npm install lucide-react
```

---

## Step 3: Create Sample Content

Replace the default `src/App.tsx` with content that needs localization:

```tsx
// src/App.tsx
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Application</h1>
        <p>Please login to continue</p>
        <button>Login</button>
        <button>Forgot Password?</button>
        <div>
          <h2>Dashboard</h2>
          <p>Your profile information</p>
          <span>User Settings</span>
        </div>
      </header>
    </div>
  );
}

export default App;
```

Update `src/App.css` with basic styling:

```css
/* src/App.css */
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-header h1 {
  font-size: 2em;
  margin-bottom: 1em;
}

.App-header p {
  font-size: 1.2em;
  margin-bottom: 2em;
}

.App-header button {
  font-size: 1em;
  margin: 0.5em;
  padding: 0.5em 1em;
}
```

---

## Step 4: Install DevLingo

Install DevLingo CLI in your project:

```bash
# Option 1: Install globally (recommended)
npm install -g devlingo@latest

# Option 2: Install as local dependency
npm install --save-dev devlingo
```

---

## Step 5: Initialize DevLingo

Initialize DevLingo in your React project:

```bash
# Using global installation
devlingo init

# Using local installation
npx devlingo init
```

This will create:
- `.devlingo/` directory with configuration
- Default settings for your project

---

## Step 6: Scan for Text Strings

Scan your React project for text strings:

```bash
devlingo scan
```

Expected output:
```
🔍 Scanning project for UI text strings...
📁 Found X files to scan
✅ Extracted Y UI text strings

📝 Sample extracted strings:
  1. "Welcome to My Application" → welcome_to_my_application
  2. "Please login to continue" → please_login_to_continue
  ... and more

🎯 Next steps:
  devlingo generate - Generate i18n files from extracted strings
  devlingo replace - Replace inline text with constants
```

---

## Step 7: Generate i18n Files

Generate translation files with interactive language selection:

```bash
devlingo generate
```

DevLingo will now:
1. **Check for lingo.dev configuration**
2. **Ask for API key** if not configured
3. **Prompt for language selection**:
   - Source language (default: English)
   - Target languages (choose from 20+ options)
4. **Generate translation files**
5. **Create welcome.md** with extracted text summary
6. **Create LanguageDropdown.tsx** component

Example interaction:
```
🌐 Lingo.dev Setup Required
Setting up lingo.dev for AI translations...

🔑 Lingo.dev API Setup
Do you have a lingo.dev API key? (Y/n): Y
Enter your lingo.dev API key: your_api_key_here
✅ API key saved!

🌍 Language Configuration
Source language (text will be extracted from this language): (en): 
Available language codes:
  en - English
  hi - Hindi
  kn - Kannada
  es - Spanish
  fr - French
  ... and more!

Enter target languages (comma-separated, e.g., hi,kn,es,fr): hi,kn,es

📝 Generating i18n files...
✅ Generated i18n files for 10 strings
📁 Constants: ./src/i18n/constants.ts
📁 Translations: ./src/i18n/
🌍 Languages: en, hi, kn, es, fr

🌐 Running lingo.dev for translations...
✅ lingo.dev translations completed!

Create language dropdown component for your project? (Y/n): Y
🎨 Created LanguageDropdown.tsx component
```

---

## Step 8: Replace Text with Constants

Replace hardcoded text with localization constants:

```bash
devlingo replace
```

This will update your `src/App.tsx` to use DevLingo constants:

```tsx
// After replacement
import React from 'react';
import { LanguageDropdown } from './components/LanguageDropdown';
import { TEXT } from './i18n/constants';
import { t } from './i18n';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Language Dropdown */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <LanguageDropdown />
        </div>
        
        <h1>{t(TEXT.WELCOME_TO_MY_APPLICATION)}</h1>
        <p>{t(TEXT.PLEASE_LOGIN_TO_CONTINUE)}</p>
        <button>{t(TEXT.LOGIN)}</button>
        <button>{t(TEXT.FORGOT_PASSWORD)}</button>
        <div>
          <h2>{t(TEXT.DASHBOARD)}</h2>
          <p>{t(TEXT.YOUR_PROFILE_INFORMATION)}</p>
          <span>{t(TEXT.USER_SETTINGS)}</span>
        </div>
      </header>
    </div>
  );
}

export default App;
```

---

## Step 9: Create Language Dropdown

Create the language dropdown component:

```bash
# Create components directory
mkdir src/components

# Create LanguageDropdown.tsx
# (DevLingo generates this automatically, but you can customize)
```

The generated component will include:
- React hooks for state management
- localStorage for language persistence
- Visual language selection with flags
- Automatic page reload on language change

---

## Step 10: Test Language Switching

Start your React app and test the language switching:

```bash
npm start
```

Test the functionality:
1. **Open browser** to `http://localhost:3000`
2. **Click language dropdown** in top-right corner
3. **Select different languages** - should see instant text changes
4. **Verify persistence** - language choice should be remembered
5. **Check translations** - ensure all languages display correctly

---

## Step 11: Final Integration

Your React app is now fully localized! Here's what you have:

### 📁 Generated Files Structure
```
my-localized-app/
├── public/
├── src/
│   ├── components/
│   │   └── LanguageDropdown.tsx
│   ├── i18n/
│   │   ├── constants.ts
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── kn.json
│   │   ├── es.json
│   │   └── fr.json
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── .devlingo/
└── welcome.md
```

### 🌍 Key Features Implemented

1. **Automatic Text Detection** - DevLingo finds all UI strings
2. **Multi-language Support** - 20+ languages available
3. **AI Translation** - lingo.dev integration for professional translations
4. **Interactive CLI** - User-friendly prompts and guidance
5. **React Integration** - Seamless language switching component
6. **Documentation** - Auto-generated welcome.md with project summary

### 🚀 Next Steps

1. **Customize Styling** - Update CSS to match your design
2. **Add More Content** - Create additional components with text
3. **Re-run Workflow** - Use `devlingo scan` and `devlingo generate` for new content
4. **Deploy** - Your app is ready for multi-language deployment

---

## 🎯 Pro Tips

### **Development Workflow**
```bash
# Development cycle
devlingo scan     # Extract new text
devlingo generate    # Generate translations  
devlingo replace    # Update React components
npm start          # Test changes
```

### **Production Build**
```bash
# Create production build
npm run build

# The build will include all translation files
# Ready for deployment to any hosting service
```

### **Language Management**
```bash
# Add new language to existing project
devlingo generate
# Choose additional target languages when prompted
# DevLingo handles the rest automatically
```

---

## 🛠️ Troubleshooting

### **Common Issues**

1. **DevLingo not found**:
   ```bash
   npm install -g devlingo@latest
   ```

2. **No strings extracted**:
   - Make sure your React components contain text strings
   - Check that files are saved before running `devlingo scan`

3. **Translation not working**:
   - Verify `src/i18n/index.ts` imports are correct
   - Check that translation files exist and contain content
   - Ensure LanguageDropdown component is properly integrated

4. **Build errors**:
   - Check TypeScript configuration in `tsconfig.json`
   - Ensure all imports are correctly typed

---

## 🎉 Congratulations!

You now have a fully functional React application with DevLingo integration! 

**Your app features:**
- ✅ **Multi-language support** with 20+ languages
- ✅ **Professional AI translations** via lingo.dev
- ✅ **Interactive language switching** with beautiful dropdown
- ✅ **Automatic text extraction** and constant generation
- ✅ **Production-ready** build system

**Start localizing your React apps like a pro!** 🌐✨

---

*For more detailed information, visit: https://github.com/brrashmi408-sys/devlingo-npm*
