export interface TranslationRecord {
  id: string;
  createdAt: string;
  audioName?: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  duration?: number; // audio duration in seconds
}

const STORAGE_KEY = "qorila_history";
const MAX_HISTORY = 50;

export function getHistory(): TranslationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TranslationRecord[];
  } catch {
    return [];
  }
}

export function addToHistory(
  record: Omit<TranslationRecord, "id" | "createdAt">,
): TranslationRecord {
  const history = getHistory();
  const newRecord: TranslationRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...history].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full
  }

  return newRecord;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
