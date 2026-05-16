// Global type definitions

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  text?: string;
  summary?: LegalSummary;
}

export interface LegalSummary {
  short_summary: string;
  detailed_summary: string;
  document_type: string;
  parties_involved: string[];
  key_legal_points: string[];
  obligations: string[];
  important_deadlines: string[];
  penalties: string[];
  legal_risks: LegalRisk[];
  clauses: LegalClauses;
  simplified_explanation: string;
  overall_risk_score: 'low' | 'medium' | 'high';
  confidence_score: number;
  text_length?: number;
  word_count?: number;
}

export interface LegalRisk {
  risk: string;
  level: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface LegalClauses {
  confidentiality?: string;
  liability?: string;
  payment?: string;
  arbitration?: string;
  termination?: string;
  non_compete?: string;
  indemnification?: string;
  governing_law?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  filename: string;
  uploadedAt: string;
  summary: LegalSummary;
  text: string;
}

export interface ComparisonResult {
  document1_type: string;
  document2_type: string;
  similarities: string[];
  differences: Array<{ aspect: string; doc1: string; doc2: string }>;
  missing_in_doc1: string[];
  missing_in_doc2: string[];
  risk_comparison: {
    doc1_risk: 'low' | 'medium' | 'high';
    doc2_risk: 'low' | 'medium' | 'high';
    doc1_risks: string[];
    doc2_risks: string[];
  };
  recommendation: string;
  overall_comparison: string;
}

export type Theme = 'dark' | 'light';
export type ExportFormat = 'txt' | 'docx' | 'pdf';
