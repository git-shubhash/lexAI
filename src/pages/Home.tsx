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
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-up">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center gap-12 py-8">
        <div className="flex-1 space-y-8">

          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            Legal analysis,<br />
            <span style={{ color: 'var(--brand-main)' }}>simplified.</span>
          </h1>
          
          <p className="text-xl leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
            Upload any contract. We automatically extract key clauses, detect risks, and explain complex legal jargon in plain English.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary px-8 py-4 text-lg flex items-center gap-3"
            >
              <Upload size={20} />
              Upload Document
            </button>
            {currentDocument && (
              <button
                onClick={() => navigate('/analysis')}
                className="btn-secondary px-8 py-4 text-lg flex items-center gap-3"
              >
                View Current Analysis <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-lg">
           <div className="premium-card p-6 md:p-8 space-y-6 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--border-subtle)' }}>
                 <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-light)', color: 'var(--brand-main)' }}>
                    <FileText size={24} />
                 </div>
                 <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Service_Agreement_v2.pdf</p>
                    <p className="text-sm font-medium text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Analysis Complete</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="h-3 rounded w-full" style={{ background: 'var(--border-subtle)' }} />
                 <div className="h-3 rounded w-4/5" style={{ background: 'var(--border-subtle)' }} />
                 <div className="h-3 rounded w-5/6" style={{ background: 'var(--border-subtle)' }} />
              </div>
              <div className="pt-2">
                 <span className="badge-high px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                    <Shield size={16} /> Critical Risk: Indemnification Clause
                 </span>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
         <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Everything you need to review contracts faster</h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Professional-grade tools built for accuracy and speed.</p>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
               const Icon = feat.icon;
               return (
                 <div key={idx} className="premium-card p-6 flex flex-col group hover:cursor-pointer" onClick={() => navigate('/upload')}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                       <Icon size={24} className="group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>{feat.title}</h3>
                    <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
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
