import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DocumentFile, LegalSummary } from '../types/index';


interface AppContextType {
  // Document state
  currentDocument: DocumentFile | null;
  setCurrentDocument: (doc: DocumentFile | null) => void;
  documentText: string;
  setDocumentText: (text: string) => void;
  currentSummary: LegalSummary | null;
  setCurrentSummary: (s: LegalSummary | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Processing state
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  processingStep: string;
  setProcessingStep: (s: string) => void;

  // User
  userName: string | null;
  setUserName: (name: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentDocument, setCurrentDocument] = useState<DocumentFile | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [currentSummary, setCurrentSummary] = useState<LegalSummary | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [userName, setUserNameState] = useState<string | null>(localStorage.getItem('lexai_user_name'));

  useEffect(() => {
    document.documentElement.className = 'dark';
  }, []);

  const setUserName = (name: string) => {
    localStorage.setItem('lexai_user_name', name);
    setUserNameState(name);
  };

  return (
    <AppContext.Provider value={{
      currentDocument, setCurrentDocument,
      documentText, setDocumentText,
      currentSummary, setCurrentSummary,
      sidebarOpen, setSidebarOpen,
      isProcessing, setIsProcessing,
      processingStep, setProcessingStep,
      userName, setUserName,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
