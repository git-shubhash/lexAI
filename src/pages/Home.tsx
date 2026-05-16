import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Shield, GitCompare,
  MessageSquare, ArrowRight, CheckCircle, Zap
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getHistory } from '../services/storage';

const features = [
  { icon: Upload, title: 'Smart Document Upload', desc: 'Securely upload PDFs, Word documents, or scanned images with built-in OCR.' },
  { icon: Zap, title: 'Instant AI Summaries', desc: 'Get clear, concise summaries of dense legal language in seconds.' },
  { icon: Shield, title: 'Automated Risk Detection', desc: 'Identify liabilities, missing clauses, and unfavorable terms instantly.' },
  { icon: GitCompare, title: 'Contract Comparison', desc: 'View side-by-side differences between draft revisions or templates.' },
  { icon: MessageSquare, title: 'Conversational AI', desc: 'Ask specific questions about the document in plain English.' },
  { icon: FileText, title: 'Export Ready', desc: 'Download your analysis in PDF or DOCX formats for your team.' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentDocument } = useApp();
  const history = getHistory();

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-slide-up px-4 md:px-0">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 py-6 md:py-8">
        <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            Legal analysis,<br />
            <span style={{ color: 'var(--brand-main)' }}>simplified.</span>
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed max-w-lg mx-auto md:mx-0" style={{ color: 'var(--text-muted)' }}>
            Upload any contract. We automatically extract key clauses, detect risks, and explain complex legal jargon in plain English.
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary px-6 md:px-8 py-3 md:py-4 text-base md:text-lg flex items-center gap-3"
            >
              <Upload size={20} />
              Upload Document
            </button>
            {currentDocument && (
              <button
                onClick={() => navigate('/analysis')}
                className="btn-secondary px-6 md:px-8 py-3 md:py-4 text-base md:text-lg flex items-center gap-3"
              >
                View Current Analysis <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-lg">
           <div className="premium-card p-5 md:p-8 space-y-4 md:space-y-6 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4 border-b pb-4 md:pb-6" style={{ borderColor: 'var(--border-subtle)' }}>
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-light)', color: 'var(--brand-main)' }}>
                    <FileText size={20} className="md:w-6 md:h-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-base md:text-lg font-bold truncate max-w-[180px] md:max-w-none" style={{ color: 'var(--text-main)' }}>Service_Agreement_v2.pdf</p>
                    <p className="text-xs md:text-sm font-medium text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Analysis Complete</p>
                 </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                 <div className="h-2 md:h-3 rounded w-full" style={{ background: 'var(--border-subtle)' }} />
                 <div className="h-2 md:h-3 rounded w-4/5" style={{ background: 'var(--border-subtle)' }} />
                 <div className="h-2 md:h-3 rounded w-5/6" style={{ background: 'var(--border-subtle)' }} />
              </div>
              <div className="pt-2 text-left">
                 <span className="badge-high px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-sm font-bold inline-flex items-center gap-2">
                    <Shield size={14} className="md:w-4 md:h-4" /> Critical Risk: Indemnification Clause
                 </span>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 md:py-12 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
         <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4" style={{ color: 'var(--text-main)' }}>Everything you need to review contracts faster</h2>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-muted)' }}>Professional-grade tools built for accuracy and speed.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feat, idx) => {
               const Icon = feat.icon;
               return (
                 <div key={idx} className="premium-card p-5 md:p-6 flex flex-col group hover:cursor-pointer" onClick={() => navigate('/upload')}>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6 transition-colors" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                       <Icon size={20} className="md:w-6 md:h-6 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{ color: 'var(--text-main)' }}>{feat.title}</h3>
                    <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
                 </div>
               )
            })}
         </div>
      </section>

      {/* History */}
      {history.length > 0 && (
         <section className="py-8 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Recent Analyses</h2>
               <button onClick={() => navigate('/history')} className="text-sm font-semibold hover:underline" style={{ color: 'var(--brand-main)' }}>
                  View All History &rarr;
               </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
               {history.slice(0,3).map(h => (
                  <div key={h.id} className="premium-card p-5 cursor-pointer flex gap-4" onClick={() => navigate('/analysis')}>
                     <FileText size={24} style={{ color: 'var(--text-light)' }} />
                     <div className="overflow-hidden">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{h.filename}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(h.uploadedAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      )}
    </div>
  );
};

export default Home;
