import type { HistoryItem, Theme } from '../types/index';

const HISTORY_KEY = 'lexai_history';
const THEME_KEY = 'lexai_theme';
const CHAT_KEY_PREFIX = 'lexai_chat_';
const MAX_HISTORY = 20;

// ─── History ───────────────────────────────────────────────────────────────
export const saveToHistory = (item: HistoryItem): void => {
  const existing = getHistory();
  const updated = [item, ...existing.filter((h) => h.id !== item.id)].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Storage full – remove oldest
    const trimmed = updated.slice(0, MAX_HISTORY / 2);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const deleteHistoryItem = (id: string): void => {
  const updated = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

// ─── Chat History ──────────────────────────────────────────────────────────
export const saveChatHistory = (docId: string, messages: object[]): void => {
  try {
    localStorage.setItem(`${CHAT_KEY_PREFIX}${docId}`, JSON.stringify(messages.slice(-50)));
  } catch { /* ignore */ }
};

export const getChatHistory = (docId: string): object[] => {
  try {
    const raw = localStorage.getItem(`${CHAT_KEY_PREFIX}${docId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ─── Theme ─────────────────────────────────────────────────────────────────
export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
};
