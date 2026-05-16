import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { GitCompare, Upload, Loader2, CheckCircle, X, RefreshCw, FileText } from 'lucide-react';
import { uploadFile, extractText, compareDocuments } from '../services/api';
import type { ComparisonResult } from '../types/index';

interface DocSlot {
  file?: File;
  fileId?: string;
  text?: string;
  loading: boolean;
  error?: string;
}

const DocDropzone: React.FC<{
  label: string;
  slot: DocSlot;
  onDrop: (files: File[]) => void;
}> = ({ label, slot, onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${isDragActive ? 'dropzone-active' : ''}`}
      style={{ borderColor: slot.text ? '#22c55e' : 'var(--border-strong)', background: 'var(--bg-surface)' }}
    >
      <input {...getInputProps()} />
      {slot.loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-main)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Processing document...</p>
        </div>
      ) : slot.text ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={32} className="text-green-500" />
          <p className="font-semibold text-lg" style={{ color: 'var(--text-main)' }}>{slot.file?.name}</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{slot.text.split(' ').length.toLocaleString()} words extracted</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
            <Upload size={24} />
          </div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>{label}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Drop PDF, DOCX, or TXT here</p>
        </div>
      )}
      {slot.error && <p className="text-red-500 font-medium text-sm mt-3">{slot.error}</p>}
    </div>
  );
};

const Comparison: React.FC = () => {
  const [doc1, setDoc1] = useState<DocSlot>({ loading: false });
  const [doc2, setDoc2] = useState<DocSlot>({ loading: false });
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  const handleDrop = (slot: 'doc1' | 'doc2') => async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const setter = slot === 'doc1' ? setDoc1 : setDoc2;
    setter({ file, loading: true });

    try {
      const uploadRes = await uploadFile(file);
      const extractRes = await extractText(uploadRes.file_id);
      if (!extractRes.success) throw new Error('Text extraction failed');
      setter({ file, fileId: uploadRes.file_id, text: extractRes.text, loading: false });
    } catch (err: any) {
      setter({ file, loading: false, error: err.message });
    }
  };

  const compare = async () => {
    if (!doc1.text || !doc2.text) return;
    setComparing(true);
    setError('');
    try {
      const res = await compareDocuments(doc1.text, doc2.text, doc1.file?.name || 'Doc 1', doc2.file?.name || 'Doc 2');
      setResult(res.comparison);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-slide-up">
      <div className="mb-6">
        <h1 className="heading-clean text-2xl">Compare Documents</h1>
        <p className="text-slate-500 mt-1">Upload two contracts to detect missing clauses, risk differences, and modifications.</p>
      </div>

      {/* Doc upload grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <DocDropzone label="Document 1 (Original)" slot={doc1} onDrop={handleDrop('doc1')} />
        <DocDropzone label="Document 2 (Revised)" slot={doc2} onDrop={handleDrop('doc2')} />
      </div>

      {/* Compare button */}
      {doc1.text && doc2.text && !result && (
        <button
          onClick={compare}
          disabled={comparing}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {comparing ? (
            <><Loader2 size={20} className="animate-spin" /> Comparing Documents...</>
          ) : (
            <><GitCompare size={20} /> Generate Comparison Report</>
          )}
        </button>
      )}

      {error && (
        <div className="p-4 rounded-xl text-red-600 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <strong className="font-semibold">Error: </strong> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              Comparison Report
            </h2>
            <button onClick={() => setResult(null)} className="btn-secondary px-4 py-2 flex items-center gap-2">
              <RefreshCw size={16} /> Reset
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: doc1.file?.name || 'Doc 1', risk: result.risk_comparison?.doc1_risk, risks: result.risk_comparison?.doc1_risks },
              { name: doc2.file?.name || 'Doc 2', risk: result.risk_comparison?.doc2_risk, risks: result.risk_comparison?.doc2_risks },
            ].map((d, i) => (
              <div key={i} className="premium-card p-6">
                <div className="flex items-center justify-between mb-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                     <FileText size={18} style={{ color: 'var(--text-muted)' }} />
                     <h3 className="font-bold text-lg truncate" style={{ color: 'var(--text-main)' }}>{d.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider badge-${d.risk || 'medium'}`}>
                     {d.risk} RISK
                  </span>
                </div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Risk Factors Detected</h4>
                <ul className="space-y-2">
                  {d.risks?.length ? d.risks.map((r, j) => (
                    <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                       <span className="text-red-500 font-bold mt-0.5">•</span> {r}
                    </li>
                  )) : (
                     <li className="text-sm" style={{ color: 'var(--text-muted)' }}>No major risks detected.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Differences */}
          {result.differences?.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <GitCompare size={20} style={{ color: 'var(--brand-main)' }} /> Key Differences
              </h3>
              <div className="space-y-4">
                {result.differences.map((d, i) => (
                  <div key={i} className="p-4 rounded-xl border" style={{ background: 'var(--bg-app)', borderColor: 'var(--border-subtle)' }}>
                    <p className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--brand-main)' }}>{d.aspect}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-light)' }}>{doc1.file?.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{d.doc1}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-light)' }}>{doc2.file?.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{d.doc2}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing clauses */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: `Missing in ${doc1.file?.name || 'Doc 1'}`, items: result.missing_in_doc1 },
              { title: `Missing in ${doc2.file?.name || 'Doc 2'}`, items: result.missing_in_doc2 },
            ].map((sec, i) => sec.items?.length > 0 && (
              <div key={i} className="premium-card p-6 border-t-4 border-t-red-500">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                  <X size={18} className="text-red-500" /> {sec.title}
                </h3>
                <ul className="space-y-2">
                  {sec.items.map((item, j) => (
                    <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                       <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                       {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          {result.recommendation && (
            <div className="premium-card p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
              <h3 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-400">AI Recommendation</h3>
              <p className="text-blue-900 dark:text-blue-200">{result.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comparison;
