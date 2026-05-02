import { useState } from "react";
import {
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  TranslationRecord,
  deleteFromHistory,
  clearHistory,
  formatDuration,
} from "../services/translationHistory";
import { getLanguageByCode } from "../services/languages";
import { TTSButton } from "./TranslationPanel";

interface TranslationHistoryProps {
  records: TranslationRecord[];
  onRecordsChange: () => void;
  onRestore?: (record: TranslationRecord) => void;
}

function HistoryItem({
  record,
  onDelete,
  onRestore,
}: {
  record: TranslationRecord;
  onDelete: () => void;
  onRestore?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sourceLang = getLanguageByCode(record.sourceLang);
  const targetLang = getLanguageByCode(record.targetLang);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          {sourceLang && <span title={sourceLang.name}>{sourceLang.flag}</span>}
          <span className="text-slate-600">→</span>
          {targetLang && <span title={targetLang.name}>{targetLang.flag}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 truncate">{record.sourceText}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {record.translatedText}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-slate-500">
            {timeAgo(record.createdAt)}
          </span>
          {onRestore && (
            <button
              onClick={onRestore}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-indigo-400 transition-colors"
              title="Load this translation"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-700/50 px-4 py-3 space-y-3">
              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {record.audioName && <span>🎵 {record.audioName}</span>}
                {record.duration && record.duration > 0 && (
                  <span>⏱ {formatDuration(record.duration)}</span>
                )}
                <span>
                  {sourceLang?.name || record.sourceLang} →{" "}
                  {targetLang?.name || record.targetLang}
                </span>
                <span>{new Date(record.createdAt).toLocaleString()}</span>
              </div>

              {/* Source text */}
              <div>
                <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>{sourceLang?.flag}</span>{" "}
                  <span>Source Transcription</span>{" "}
                  <TTSButton
                    text={record.sourceText}
                    lang={sourceLang?.code || ""}
                  />
                </p>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 rounded-lg p-3">
                  {record.sourceText}
                </p>
              </div>

              {/* Translated text */}
              <div>
                <p className="text-xs text-violet-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>{targetLang?.flag}</span> <span>Translation</span>
                  <TTSButton
                    text={record.translatedText}
                    lang={targetLang?.code || ""}
                  />
                </p>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 rounded-lg p-3">
                  {record.translatedText}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TranslationHistory({
  records,
  onRecordsChange,
  onRestore,
}: TranslationHistoryProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    onRecordsChange();
  };

  const handleClearAll = () => {
    clearHistory();
    onRecordsChange();
    setShowClearConfirm(false);
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="p-3 rounded-xl bg-slate-800/50">
          <Clock size={20} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm text-slate-400">No translation history yet</p>
          <p className="text-xs text-slate-600 mt-1">
            Your translations will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {records.length} translation{records.length !== 1 ? "s" : ""}
        </span>

        {showClearConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Clear all?</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/10"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 size={11} />
            Clear all
          </button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {records.map((record) => (
            <HistoryItem
              key={record.id}
              record={record}
              onDelete={() => handleDelete(record.id)}
              onRestore={onRestore ? () => onRestore(record) : undefined}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
