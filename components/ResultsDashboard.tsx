import React from 'react';
import { AnalysisResult } from '../types';
import { Card } from './ui/Card';
import { AnalysisChart } from './AnalysisChart';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Zap, 
  Terminal, 
  AlertTriangle,
  FileCode,
  Layers,
  Search
} from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  const securityIssuesCount = result.open_passwords.length + result.open_keys.length;
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium">Language detected</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-800">{result.language}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium">Framework</span>
          <div className="mt-2 text-2xl font-bold text-slate-800">
             {result.framework !== 'Unknown' ? result.framework : <span className="text-slate-400 font-normal text-lg">None detected</span>}
          </div>
        </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium">Lines of Code</span>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {result.overview ? result.overview.split('\n').length : 'N/A'} 
            <span className="text-sm font-normal text-slate-400 ml-1">(approx sample)</span>
          </div>
        </div>
        <div className={`p-6 rounded-xl border shadow-sm flex flex-col ${securityIssuesCount > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <span className={`${securityIssuesCount > 0 ? 'text-red-600' : 'text-emerald-600'} text-sm font-medium`}>Security Status</span>
          <div className={`mt-2 text-2xl font-bold ${securityIssuesCount > 0 ? 'text-red-700' : 'text-emerald-700'} flex items-center gap-2`}>
             {securityIssuesCount > 0 ? (
               <><ShieldAlert size={28}/> {securityIssuesCount} Issues</>
             ) : (
               <><CheckCircle2 size={28}/> Secure</>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visuals & Overview */}
        <div className="lg:col-span-1 space-y-6">
           <Card title="Analysis Overview" icon={<Search className="text-indigo-500"/>}>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 font-mono leading-relaxed border border-slate-100">
                  {result.overview || "No overview available."}
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-500 mb-4">Issue Distribution</h4>
                    <AnalysisChart data={result} />
                 </div>
              </div>
           </Card>

           <Card title="Naming & Formatting" icon={<Terminal className="text-slate-500"/>}>
             <div className="space-y-4">
               <div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Naming Conventions</span>
                 <div className={`mt-1 text-sm ${result.naming_conventions.startsWith('Fail') ? 'text-red-600' : 'text-emerald-600 font-medium'}`}>
                   {result.naming_conventions}
                 </div>
               </div>
               <div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indentation</span>
                 <div className="mt-1 text-sm text-slate-700">
                   {result.indentation}
                 </div>
               </div>
             </div>
           </Card>
        </div>

        {/* Right Column: Detailed Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security Section - Conditionally Rendered if issues exist */}
          {securityIssuesCount > 0 && (
            <Card 
              title="Security Vulnerabilities" 
              icon={<ShieldAlert className="text-red-500"/>}
              variant="danger"
            >
               <div className="space-y-4">
                 {result.open_passwords.length > 0 && (
                   <div>
                      <h4 className="text-red-800 font-medium text-sm flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Exposed Passwords
                      </h4>
                      <div className="space-y-2">
                        {result.open_passwords.map(([key, val], idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-100/50 rounded border border-red-200 text-sm">
                            <span className="font-mono text-red-900 font-semibold">{key}</span>
                            <span className="font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">Value: {val}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
                 
                 {result.open_keys.length > 0 && (
                    <div className={result.open_passwords.length > 0 ? "pt-4 border-t border-red-200" : ""}>
                      <h4 className="text-red-800 font-medium text-sm flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Exposed API Keys
                      </h4>
                      <div className="space-y-2">
                        {result.open_keys.map((keyMatch, idx) => (
                          <div key={idx} className="p-3 bg-red-100/50 rounded border border-red-200 text-sm font-mono text-red-800 break-all">
                            {keyMatch}
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
               </div>
            </Card>
          )}

          {/* Code Quality & Linting */}
          <Card title="Code Quality & Linting" icon={<AlertTriangle className="text-amber-500"/>} variant="warning">
             {result.lint_issues.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                 <CheckCircle2 size={32} className="text-emerald-400 mb-2"/>
                 <p>No linting issues detected.</p>
               </div>
             ) : (
               <ul className="space-y-2">
                 {result.lint_issues.map((issue, idx) => (
                   <li key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-amber-50/50 transition-colors">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                      <span className="text-sm text-slate-700">{issue}</span>
                   </li>
                 ))}
               </ul>
             )}
          </Card>

          {/* Optimization Suggestions */}
          <Card title="Optimization & Best Practices" icon={<Zap className="text-blue-500"/>}>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.optimization.map((opt, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded border border-blue-100">
                  <span className="mt-0.5 text-blue-500"><Zap size={14} fill="currentColor"/></span>
                  <span className="text-sm text-slate-700">{opt}</span>
                </li>
              ))}
              {result.optimization.length === 0 && (
                <li className="col-span-2 text-slate-400 text-sm text-center py-4">No specific optimizations found.</li>
              )}
            </ul>
          </Card>

          {/* Code Duplication */}
          <Card title="Duplicate Detection" icon={<Layers className="text-violet-500"/>}>
             <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex justify-between">
                    Exact Duplicates
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-normal">
                      {result.duplicate_code.exact_duplicates.length} found
                    </span>
                  </h4>
                  {result.duplicate_code.exact_duplicates.length > 0 ? (
                    <div className="space-y-3">
                      {result.duplicate_code.exact_duplicates.map((dup, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 flex justify-between border-b border-slate-200">
                            <span>Repeated {dup.count} times</span>
                            <FileCode size={14}/>
                          </div>
                          <pre className="p-3 bg-slate-900 text-slate-50 text-xs overflow-x-auto font-mono">
                            {dup.example}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No exact duplicates found.</p>
                  )}
                </div>

                {result.duplicate_code.similar_blocks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex justify-between">
                      Similar Blocks
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-normal">
                        {result.duplicate_code.similar_blocks.length} pairs found
                      </span>
                    </h4>
                    <div className="space-y-4">
                      {result.duplicate_code.similar_blocks.map((sim, idx) => (
                        <div key={idx} className="border border-violet-100 rounded-lg overflow-hidden">
                           <div className="bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 border-b border-violet-100">
                             Similarity Match: {(sim.similarity * 100).toFixed(1)}%
                           </div>
                           <div className="grid grid-cols-2 divide-x divide-slate-700 bg-slate-900">
                              <pre className="p-3 text-slate-50 text-[10px] overflow-x-auto font-mono opacity-80">{sim.block1}</pre>
                              <pre className="p-3 text-slate-50 text-[10px] overflow-x-auto font-mono opacity-80">{sim.block2}</pre>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
};