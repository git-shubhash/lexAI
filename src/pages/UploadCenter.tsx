import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, CheckCircle, Loader2,
  ArrowRight, FileText
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { uploadFile, extractText, summarizeDocument } from '../services/api';
import { saveToHistory } from '../services/storage';
import type { DocumentFile } from '../types/index';

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
};

type Step = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'done' | 'error';

interface FileEntry {
  file: File;
  id: string;
  step: Step;
  progress: number;
  error?: string;
}


const stepLabel: Record<Step, string> = {
  idle: 'Waiting',
  uploading: 'Uploading...',
  extracting: 'Extracting text...',
  analyzing: 'AI Analyzing...',
  done: 'Complete!',
  error: 'Failed',
};

const UploadCenter: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { setCurrentDocument, setDocumentText, setCurrentSummary } = useApp();
  const navigate = useNavigate();

  const onDrop = useCallback((accepted: File[]) => {
    const newEntries: FileEntry[] = accepted.map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      step: 'idle',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 50 * 1024 * 1024,
  });

  const processFile = async (entry: FileEntry) => {
    const update = (patch: Partial<FileEntry>) =>
      setFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, ...patch } : f)));

    try {
      // Step 1: Upload
      update({ step: 'uploading', progress: 10 });
      const uploadRes = await uploadFile(entry.file, (pct) =>
        update({ progress: Math.floor(pct * 0.4) })
      );

      // Step 2: Extract text
      update({ step: 'extracting', progress: 45 });
      const extractRes = await extractText(uploadRes.file_id);
      if (!extractRes.success || extractRes.is_empty) {
        throw new Error('Could not extract text from the document.');
      }

      // Step 3: AI Analysis
      update({ step: 'analyzing', progress: 60 });
      const summaryRes = await summarizeDocument(extractRes.text);

      update({ step: 'done', progress: 100 });

      // Save to context and history
      const doc: DocumentFile = {
        id: uploadRes.file_id,
        name: entry.file.name,
        size: entry.file.size,
        type: entry.file.type,
        uploadedAt: new Date().toISOString(),
        text: extractRes.text,
        summary: summaryRes.summary,
      };

      setCurrentDocument(doc);
      setDocumentText(extractRes.text);
      setCurrentSummary(summaryRes.summary);

      saveToHistory({
        id: uploadRes.file_id,
        filename: entry.file.name,
        uploadedAt: new Date().toISOString(),
        summary: summaryRes.summary,
        text: extractRes.text,
      });

    } catch (err: any) {
      update({ step: 'error', error: err.message });
    }
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const anyDone = files.some((f) => f.step === 'done');
  const idleFiles = files.filter((f) => f.step === 'idle');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Upload Documents</h1>
        <p className="text-lg mt-2" style={{ color: 'var(--text-muted)' }}>Drag and drop your legal documents to begin analysis.</p>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone-container p-16 text-center cursor-pointer ${
          isDragActive ? 'dropzone-active' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          {isDragActive ? 'Drop files here...' : 'Select files to upload'}
        </h3>
        <p className="text-md mb-6" style={{ color: 'var(--text-muted)' }}>
          or drag and drop them here
        </p>
        <div className="flex justify-center gap-3 text-sm font-medium" style={{ color: 'var(--text-light)' }}>
           <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">PDF</span>
           <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">DOCX</span>
           <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">TXT</span>
           <span className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">Images</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Processing Queue ({files.length})</h3>
            {idleFiles.length > 0 && (
              <button
                onClick={() => idleFiles.forEach(processFile)}
                className="btn-primary px-4 py-2 text-sm"
              >
                Start Analysis
              </button>
            )}
          </div>

          <div className="space-y-4">
            {files.map((entry) => (
              <div key={entry.id} className="premium-card p-5">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                    <FileText size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                       <p className="font-semibold text-base truncate" style={{ color: 'var(--text-main)' }}>{entry.file.name}</p>
                       <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{(entry.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    
                    {['uploading', 'extracting', 'analyzing'].includes(entry.step) && (
                      <div className="mt-3">
                         <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--brand-main)' }}>
                            <span className="font-medium">{stepLabel[entry.step]}</span>
                            <span className="font-bold">{entry.progress}%</span>
                         </div>
                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-hover)' }}>
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ width: `${entry.progress}%`, background: 'var(--brand-main)' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {entry.error && <p className="text-sm text-red-500 font-medium mt-2">{entry.error}</p>}
                    {entry.step === 'done' && <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1"><CheckCircle size={16}/> Analysis Complete</p>}
                  </div>

                  <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
                    {entry.step === 'idle' && (
                      <button onClick={() => processFile(entry)} className="btn-secondary px-3 py-1.5 text-sm">
                        Start
                      </button>
                    )}
                    {['uploading', 'extracting', 'analyzing'].includes(entry.step) && (
                      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand-main)' }} />
                    )}
                    <button 
                      onClick={() => removeFile(entry.id)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      disabled={['uploading', 'extracting', 'analyzing'].includes(entry.step)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {anyDone && (
            <button
              onClick={() => navigate('/analysis')}
              className="w-full mt-8 btn-primary py-4 text-lg flex items-center justify-center gap-3"
            >
              View Full Analysis Report <ArrowRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadCenter;
