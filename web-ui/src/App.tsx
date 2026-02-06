import React, { useState } from 'react';
import { Globe, Mail, Key, Languages, Zap, CheckCircle, AlertCircle, Settings, ArrowRight, Download, Play, FolderOpen } from 'lucide-react';
import { api } from './services/api';
import './App.css';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

function App() {
  const [step, setStep] = useState<'setup' | 'languages' | 'scanning' | 'translating' | 'complete'>('setup');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['hi', 'kn']);
  const [isScanning, setIsScanning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [projectPath, setProjectPath] = useState('');
  const [error, setError] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, any>>({});

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !apiKey) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const response = await api.setup({ email, apiKey, projectPath });
      if (response.success) {
        setStep('languages');
        setError('');
      } else {
        setError(response.error || 'Setup failed');
      }
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  const handleLanguageSelection = async () => {
    if (targetLanguages.length === 0) {
      setError('Please select at least one target language');
      return;
    }
    setStep('scanning');
    setError('');
    await startScanning();
  };

  const startScanning = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Simulate progress while scanning
      const progressInterval = setInterval(() => {
        setScanProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.scan({ projectPath });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setIsScanning(false);
      
      if (response.success) {
        setStep('translating');
        setTimeout(() => startTranslating(), 1000);
      } else {
        setError(response.error || 'Scanning failed');
        setStep('languages');
      }
    } catch (err) {
      setError('Scanning failed');
      setStep('languages');
    }
  };

  const startTranslating = async () => {
    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      // Simulate progress while translating
      const progressInterval = setInterval(() => {
        setTranslationProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 300);

      const response = await api.generate({ 
        projectPath, 
        sourceLanguage, 
        targetLanguages 
      });
      
      clearInterval(progressInterval);
      setTranslationProgress(100);
      setIsTranslating(false);
      
      if (response.success) {
        // Load generated files
        const filesResponse = await api.getFiles(projectPath);
        if (filesResponse.success && filesResponse.files) {
          setGeneratedFiles(filesResponse.files);
        }
        setStep('complete');
      } else {
        setError(response.error || 'Translation failed');
        setStep('languages');
      }
    } catch (err) {
      setError('Translation failed');
      setStep('languages');
    }
  };

  const toggleLanguage = (langCode: string) => {
    setTargetLanguages((prev: string[]) => 
      prev.includes(langCode) 
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  const renderSetup = () => (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Globe className="w-16 h-16 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DevLingo Setup</h1>
          <p className="text-gray-600">Configure your lingo.dev integration</p>
        </div>

        <form onSubmit={handleSetupSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="inline w-4 h-4 mr-2" />
              Lingo.dev API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-field"
              placeholder="Get your API key from lingo.dev/dashboard"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Don't have an API key?{' '}
              <a href="https://lingo.dev/dashboard" target="_blank" rel="noopener noreferrer" 
                 className="text-purple-600 hover:text-purple-700 underline">
                Get one here
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FolderOpen className="inline w-4 h-4 mr-2" />
              Project Path (optional)
            </label>
            <input
              type="text"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              className="input-field"
              placeholder="./my-project"
            />
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            Continue to Language Selection
            <ArrowRight className="inline w-4 h-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );

  const renderLanguageSelection = () => (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-8">
          <Languages className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Languages</h1>
          <p className="text-gray-600">Choose source and target languages for translation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Source Language</label>
            <select 
              value={sourceLanguage} 
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="dropdown-field"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Target Languages ({targetLanguages.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {languages.filter(lang => lang.code !== sourceLanguage).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                    targetLanguages.includes(lang.code)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                  {targetLanguages.includes(lang.code) && (
                    <CheckCircle className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-600 text-sm mb-6">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button onClick={() => setStep('setup')} className="btn-secondary">
            Back
          </button>
          <button onClick={handleLanguageSelection} className="btn-primary flex-1">
            <Play className="inline w-4 h-4 mr-2" />
            Start Localization
          </button>
        </div>
      </div>
    </div>
  );

  const renderScanning = () => (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 max-w-md w-full text-center">
        <Zap className="w-16 h-16 text-purple-600 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Scanning Project</h2>
        <p className="text-gray-600 mb-6">Finding all text strings in your project...</p>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">{scanProgress}% Complete</p>
      </div>
    </div>
  );

  const renderTranslating = () => (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 max-w-md w-full text-center">
        <Globe className="w-16 h-16 text-purple-600 mx-auto mb-6 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translating with Lingo.dev</h2>
        <p className="text-gray-600 mb-6">AI-powered translation in progress...</p>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${translationProgress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">{translationProgress}% Complete</p>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 max-w-2xl w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Localization Complete!</h2>
        <p className="text-gray-600 mb-6">
          Your project has been successfully localized to {targetLanguages.length} languages
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Translation files generated</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Constants created</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Ready for deployment</span>
          </div>
        </div>

        {/* Show generated files preview */}
        {Object.keys(generatedFiles).length > 0 && (
          <div className="mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Generated Files:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(generatedFiles).map(([filename, content]) => (
                <div key={filename} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">{filename}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.keys(content).length} translations
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button onClick={() => api.downloadFiles(projectPath)} className="btn-secondary">
            <Download className="inline w-4 h-4 mr-2" />
            Download Files
          </button>
          <button onClick={() => setStep('setup')} className="btn-primary">
            <Play className="inline w-4 h-4 mr-2" />
            Start New Project
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {step === 'setup' && renderSetup()}
      {step === 'languages' && renderLanguageSelection()}
      {step === 'scanning' && renderScanning()}
      {step === 'translating' && renderTranslating()}
      {step === 'complete' && renderComplete()}
    </div>
  );
}

export default App;
