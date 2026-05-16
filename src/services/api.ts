import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 min for AI calls
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Unknown error';
    console.error(`[API Error]`, message);
    return Promise.reject(new Error(message));
  }
);

// ─── Upload ────────────────────────────────────────────────────────────────
export const uploadFile = async (
  file: File,
  onProgress?: (pct: number) => void
) => {
  const form = new FormData();
  form.append('file', file);

  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data;
};

// ─── Extract ───────────────────────────────────────────────────────────────
export const extractText = async (fileId: string) => {
  const res = await api.post('/extract', { file_id: fileId });
  return res.data;
};

// ─── Summarize ─────────────────────────────────────────────────────────────
export const summarizeDocument = async (text: string) => {
  const res = await api.post('/summarize', { text });
  return res.data;
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatWithDocument = async (
  text: string,
  question: string,
  history: Array<{ role: string; content: string }>
) => {
  const res = await api.post('/chat', { text, question, history });
  return res.data;
};

// ─── Compare ───────────────────────────────────────────────────────────────
export const compareDocuments = async (
  text1: string,
  text2: string,
  doc1_name: string,
  doc2_name: string
) => {
  const res = await api.post('/compare', { text1, text2, doc1_name, doc2_name });
  return res.data;
};

// ─── Export ────────────────────────────────────────────────────────────────
export const exportAnalysis = async (
  format: 'txt' | 'docx' | 'pdf',
  data: object,
  filename: string
) => {
  const res = await api.post(
    `/export/${format}`,
    { ...data, filename },
    { responseType: 'blob' }
  );

  const ext = format;
  const mimeMap: Record<string, string> = {
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
  };

  const url = URL.createObjectURL(new Blob([res.data], { type: mimeMap[ext] }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_analysis.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};

export const clearServerUploads = async () => {
  const res = await api.post('/clear-uploads');
  return res.data;
};

export default api;
