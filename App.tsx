import React, { useState, useEffect } from 'react';
import { Activity, Settings, AlertCircle, ExternalLink, Save, CheckCircle2 } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeCode } from './services/api';
import { AnalysisResult, AnalysisStatus } from './types';

const STORAGE_KEY = 'code_analyzer_api_url';
// Updated to Render URL
const DEFAULT_API_URL = 'https://code-analyzer-1-ii0s.onrender.com/analyze';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize checks on mount
  useEffect(() => {
    // 1. Try to load from LocalStorage
    const savedUrl = localStorage.getItem(STORAGE_KEY);
    
    if (savedUrl) {
      setApiUrl(savedUrl);
    } else {
      // Use the hardcoded default provided by user
      setApiUrl(DEFAULT_API_URL);
      localStorage.setItem(STORAGE_KEY, DEFAULT_API_URL);
    }
  }, []);

  // Smart URL handling on change
  const handleUrlChange = (val: string) => {
    // Check if the user pasted a full ngrok log line like "Forwarding https://xxx -> http://xxx"
    // Regex matches http/https followed by non-whitespace
    const urlMatch = val.match(/(https?:\/\/[^\s]+)/);
    
    // If we found a URL and the input looks like a log line (contains -> or Forwarding)
    if (urlMatch && (val.includes('->') || val.includes('Forwarding'))) {
       const cleanUrl = urlMatch[1].replace(/['";>)]+$/, ''); // Clean trailing chars
       setApiUrl(cleanUrl);
       localStorage.setItem(STORAGE_KEY, cleanUrl);
    } else {
       setApiUrl(val);
       localStorage.setItem(STORAGE_KEY, val);
    }
  };

  const handleAnalysis = async (code?: string, file?: File) => {
    if (!apiUrl) {
      setIsSettingsOpen(true);
      setError("Please configure your Backend API Endpoint first.");
      return;
    }

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const data = await analyzeCode(apiUrl, code, file);
      setResult(data);
      setStatus('success');
      // Only close settings if they were open and analysis succeeded
      if (isSettingsOpen) setIsSettingsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis.');
      setStatus('error');
      
      // Auto-open settings if connection issue
      if (err.message && (err.message.includes('Connection') || err.message.includes('Security Block'))) {
        setIsSettingsOpen(true);
      }
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  const openTunnel = () => {
    if (!apiUrl) return;
    // Extract base URL without /analyze for the check
    const baseUrl = apiUrl.replace(/\/analyze\/?$/, '');
    window.open(baseUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Activity size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CodeProbe <span className="text-indigo-600">Analyzer</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-sm text-slate-500 hidden sm:block">
                  Static Analysis & Security Scanner
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-md transition-colors ${isSettingsOpen ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Backend Configuration"
                >
                  <Settings size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {isSettingsOpen && (
           <div className="bg-slate-50 border-b border-slate-200 animate-in fade-in slide-in-from-top-1 shadow-inner">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
               <div className="max-w-3xl mx-auto">
                 <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-800">Backend API Connection</label>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">Required</span>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                   <div className="relative flex-1">
                     <input 
                      type="text" 
                      value={apiUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className={`w-full bg-white border rounded-lg pl-3 pr-10 py-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono ${error ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-300'}`}
                      placeholder="e.g. https://code-analyzer-1-ii0s.onrender.com/analyze"
                     />
                     <div className="absolute right-3 top-3 text-slate-400">
                       <Activity size={16} />
                     </div>
                   </div>
                   {apiUrl && (
                      <button 
                        onClick={openTunnel}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm whitespace-nowrap"
                        title="Open URL in new tab to verify connection"
                      >
                        <ExternalLink size={18} />
                        Verify URL
                      </button>
                   )}
                 </div>
                 <p className="mt-2 text-xs text-slate-500">
                   <strong>Current Default:</strong> {DEFAULT_API_URL}
                 </p>

                 <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
                      <div className="text-sm space-y-3">
                        <p className="font-semibold">Backend Connection Guide:</p>
                        <ul className="list-disc pl-4 space-y-2 opacity-90">
                          <li>
                            <strong>Render (Production):</strong> Ensure the URL above matches your active Render deployment (e.g., <code>https://...onrender.com/analyze</code>). Note: Free tier instances may take 50s to wake up.
                          </li>
                          <li>
                            <strong>Ngrok (Local Dev):</strong> If developing locally, paste your ngrok URL here.
                          </li>
                        </ul>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {status === 'error' && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4 text-red-900 animate-in fade-in slide-in-from-top-2 shadow-sm">
            <div className="flex-shrink-0 mt-1">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-red-800">Connection Failed</h3>
              <div className="text-sm mt-1 whitespace-pre-wrap leading-relaxed text-red-700 break-words">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* View Switcher based on Status */}
        {status === 'idle' || status === 'loading' || status === 'error' ? (
          <div className="flex flex-col gap-8">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-3xl font-bold text-slate-900">Ensure your code is production-ready</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Upload your file or paste snippet to detect security vulnerabilities, 
                anti-patterns, and code duplication instantly.
              </p>
            </div>
            <InputSection onAnalyze={handleAnalysis} isLoading={status === 'loading'} />
            
            {/* Features Grid for Empty State */}
            {status === 'idle' && (
              <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center opacity-60">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-indigo-500 shadow-sm">
                    <Activity />
                  </div>
                  <h3 className="font-semibold text-slate-800">Static Analysis</h3>
                  <p className="text-sm text-slate-500">Detects languages and frameworks automatically.</p>
                </div>
                <div className="space-y-2">
                   <div className="mx-auto w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-red-500 shadow-sm">
                    <ExternalLink size={24} />
                  </div>
                  <h3 className="font-semibold text-slate-800">Security Check</h3>
                  <p className="text-sm text-slate-500">Finds hardcoded secrets, keys, and passwords.</p>
                </div>
                <div className="space-y-2">
                   <div className="mx-auto w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm">
                    <Activity />
                  </div>
                  <h3 className="font-semibold text-slate-800">Quality Metrics</h3>
                  <p className="text-sm text-slate-500">Identifies duplication and bad naming conventions.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          result && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <button 
                  onClick={handleReset}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 mb-4"
                 >
                   &larr; Analyze another file
                 </button>
                 <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Connected to Backend
                 </div>
               </div>
               <ResultsDashboard result={result} />
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;