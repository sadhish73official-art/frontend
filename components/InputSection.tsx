import React, { useState, useRef } from 'react';
import { Upload, FileText, Code2, X } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (code?: string, file?: File) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [code, setCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'paste') {
      if (!code.trim()) return;
      onAnalyze(code, undefined);
    } else {
      if (!file) return;
      onAnalyze(undefined, file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'paste'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Code2 size={18} />
          Paste Code
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'paste' ? (
          <div className="space-y-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your source code here..."
              className="w-full h-64 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400"
              spellCheck={false}
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Supports Python, JS, TS, Java, C++, etc.</span>
              <span>{code.length} chars</span>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            {!file ? (
              <>
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Select a file to analyze</h3>
                <p className="text-slate-500 mt-2 mb-6 text-sm">Supported formats: .py, .js, .java, .cpp, .ts</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                  Browse Files
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center p-8 w-full max-w-sm">
                 <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                  <FileText size={32} />
                </div>
                <p className="font-medium text-slate-900 truncate w-full text-center">{file.name}</p>
                <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
                  className="mt-6 flex items-center gap-2 text-red-500 text-sm hover:text-red-700 font-medium"
                >
                  <X size={16} /> Remove File
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || (activeTab === 'paste' ? !code.trim() : !file)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};