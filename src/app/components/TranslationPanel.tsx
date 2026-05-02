import { useState } from "react";
import { Copy, Check, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../services/languages";

interface TranslationPanelProps {
  sourceText: string;
  translatedText: string;
  sourceLang: Language | null;
  targetLang: Language | null;
  isLoading?: boolean;
  loadingStep?: "transcribing" | "translating" | null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={14} className="text-green-400" />
      ) : (
        <Copy size={14} />
      )}
    </button>
  );
}

export function TTSButton({ text, lang }: { text: string; lang: string }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors ${
        speaking ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
      }`}
      title={speaking ? "Stop speaking" : "Read aloud"}
    >
      <Volume2 size={14} className={speaking ? "animate-pulse" : ""} />
    </button>
  );
}

function TextPanel({
  label,
  text,
  lang,
  isLoading,
  loadingLabel,
  accent,
}: {
  label: string;
  text: string;
  lang: Language | null;
  isLoading?: boolean;
  loadingLabel?: string;
  accent: "indigo" | "violet";
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 300;
  const displayText = isLong && !expanded ? text.slice(0, 300) + "…" : text;

  const accentClasses = {
    indigo: {
      border: "border-indigo-500/30",
      header: "bg-indigo-500/8",
      label: "text-indigo-400",
      dot: "bg-indigo-500",
    },
    violet: {
      border: "border-violet-500/30",
      header: "bg-violet-500/8",
      label: "text-violet-400",
      dot: "bg-violet-500",
    },
  }[accent];

  return (
    <div
      className={`flex flex-col rounded-xl border ${accentClasses.border} bg-slate-900/40 overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 ${accentClasses.header} border-b ${accentClasses.border}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`} />
          <span
            className={`text-xs uppercase tracking-wider ${accentClasses.label}`}
          >
            {label}
          </span>
          {lang && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          )}
        </div>
        {text && (
          <div className="flex items-center gap-0.5">
            {lang && <TTSButton text={text} lang={lang.code} />}
            <CopyButton text={text} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${accentClasses.dot}`}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-slate-400">
              {loadingLabel || "Processing..."}
            </span>
          </div>
        ) : text ? (
          <div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {displayText}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600 italic">
            {label.includes("Source")
              ? "Transcription will appear here…"
              : "Translation will appear here…"}
          </p>
        )}
      </div>

      {/* Word count */}
      {text && !isLoading && (
        <div
          className={`px-4 py-2 border-t ${accentClasses.border} ${accentClasses.header}`}
        >
          <span className="text-xs text-slate-500">
            {text.split(/\s+/).filter(Boolean).length} words · {text.length}{" "}
            characters
          </span>
        </div>
      )}
    </div>
  );
}

export function TranslationPanel({
  sourceText,
  translatedText,
  sourceLang,
  targetLang,
  isLoading,
  loadingStep,
}: TranslationPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextPanel
        label="Source Transcription"
        text={sourceText}
        lang={sourceLang}
        isLoading={isLoading && loadingStep === "transcribing"}
        loadingLabel="Transcribing audio with Whisper…"
        accent="indigo"
      />
      <TextPanel
        label="Translation"
        text={translatedText}
        lang={targetLang}
        isLoading={
          isLoading &&
          (loadingStep === "translating" || loadingStep === "transcribing")
        }
        loadingLabel={
          loadingStep === "transcribing"
            ? "Waiting for transcription…"
            : "Translating with M2M100…"
        }
        accent="violet"
      />
    </div>
  );
}
