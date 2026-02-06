# DevLingo 🌐

Automated localization CLI that scans projects and generates i18n files with lingo.dev integration.

## 🚀 Features

- **Project Scanning** - Automatically finds UI text strings in your codebase
- **Smart Extraction** - Uses AST parsing to safely extract JSX and JavaScript strings
- **i18n Generation** - Creates constants files and translation JSON files
- **Auto Replacement** - Replaces inline text with localization functions
- **Lingo.dev Integration** - Automatically runs lingo.dev for translations
- **Cross-platform** - Works on Windows, Mac, and Linux

## 📦 Installation

```bash
npm install -g devlingo
```

Or use directly with npx:

```bash
npx devlingo init
```

## 🎯 Quick Start

### 1. Initialize DevLingo in your project

```bash
devlingo init
```

This creates:
- `.devlingo/config.json` - Configuration file
- `src/i18n/` - Directory for localization files
- Initial constants and helper files

### 2. Scan for UI text strings

```bash
devlingo scan
```

Scans your project for:
- JSX text content
- String literals
- Template literals

### 3. Generate i18n files

```bash
devlingo generate
```

Creates:
- `src/i18n/constants.ts` - Text constants
- `src/i18n/en.json` - English translations
- `src/i18n/hi.json` - Hindi translations
- `src/i18n/kn.json` - Kannada translations
- `.lingodev.json` - Lingo.dev configuration

### 4. Replace inline text

```bash
devlingo replace
```

Transforms:
```jsx
<button>Submit</button>
```

Into:
```jsx
<button>{t(TEXT.SUBMIT)}</button>
```

### 5. View localization report

```bash
devlingo report
```

Shows:
- Total strings found
- Translation coverage
- Missing translations
- Strings by file

## 🔧 Configuration

Edit `.devlingo/config.json`:

```json
{
  "version": "1.0.0",
  "scan": {
    "extensions": [".ts", ".tsx", ".js", ".jsx", ".html"],
    "exclude": ["node_modules", "dist", "build", ".git", "coverage"],
    "minStringLength": 2
  },
  "i18n": {
    "outputDir": "./src/i18n",
    "languages": ["en", "hi", "kn"],
    "constantsFile": "./src/i18n/constants.ts",
    "keyPrefix": ""
  },
  "replacement": {
    "importPath": "./i18n/constants",
    "importName": "TEXT",
    "functionName": "t"
  }
}
```

## 📝 Example Workflow

### Before DevLingo

```jsx
// src/components/LoginButton.tsx
export function LoginButton() {
  return (
    <div>
      <h1>Welcome Back</h1>
      <p>Please enter your credentials to continue</p>
      <button>Login</button>
      <button>Forgot Password?</button>
    </div>
  );
}
```

### After DevLingo

```jsx
// src/components/LoginButton.tsx
import { TEXT, t } from '../i18n/constants';

export function LoginButton() {
  return (
    <div>
      <h1>{t(TEXT.WELCOME_BACK)}</h1>
      <p>{t(TEXT.PLEASE_ENTER_YOUR_CREDENTIALS_TO_CONTINUE)}</p>
      <button>{t(TEXT.LOGIN)}</button>
      <button>{t(TEXT.FORGOT_PASSWORD)}</button>
    </div>
  );
}
```

### Generated Files

```typescript
// src/i18n/constants.ts
export const TEXT = {
  WELCOME_BACK: "welcome_back",
  PLEASE_ENTER_YOUR_CREDENTIALS_TO_CONTINUE: "please_enter_your_credentials_to_continue",
  LOGIN: "login",
  FORGOT_PASSWORD: "forgot_password"
};
```

```json
// src/i18n/en.json
{
  "welcome_back": "Welcome Back",
  "please_enter_your_credentials_to_continue": "Please enter your credentials to continue",
  "login": "Login",
  "forgot_password": "Forgot Password?"
}
```

```json
// src/i18n/hi.json
{
  "welcome_back": "वापसी पर स्वागत है",
  "please_enter_your_credentials_to_continue": "जारी रखने के लिए कृपया अपना क्रेडेंशियल दर्ज करें",
  "login": "लॉगिन",
  "forgot_password": "पासवर्ड भूल गए?"
}
```

## 🌍 Lingo.dev Integration

DevLingo automatically integrates with lingo.dev for professional translations:

1. Generates `.lingodev.json` configuration
2. Runs `npx lingo.dev@latest run` automatically
3. Updates all translation files

## 📊 Commands

| Command | Description |
|---------|-------------|
| `devlingo init` | Initialize DevLingo in your project |
| `devlingo scan` | Scan project for UI text strings |
| `devlingo generate` | Generate i18n translation files |
| `devlingo replace` | Replace inline UI text with constants |
| `devlingo report` | Show localization coverage report |

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/brrashmi408-sys/devlingo-npm
cd devlingo

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Test the CLI
npm start -- init
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/devlingo/issues) page
2. Create a new issue with details
3. Join our Discord community

---

**DevLingo** - Making localization automatic and painless! 🚀
