import { useState, useCallback } from "react";
import {
  Mic,
  Upload,
  ArrowLeftRight,
  Sparkles,
  Clock,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";

import { AudioRecorder } from "./components/AudioRecorder";
import { AudioUpload } from "./components/AudioUpload";
import { LanguageSelectorDropdown } from "./components/LanguageSelectorDropdown";
import { TranslationPanel } from "./components/TranslationPanel";
import { TranslationHistory } from "./components/TranslationHistory";
import { RateLimitBanner } from "./components/RateLimitBanner";

import {
  transcribeAudio,
  translateText,
  AIError,
} from "./services/cloudflareAI";
import {
  getHistory,
  addToHistory,
  TranslationRecord,
} from "./services/translationHistory";
import {
  getLanguageByCode,
  mapWhisperLanguage,
  SUPPORTED_LANGUAGES,
} from "./services/languages";

type InputTab = "record" | "upload";
type ProcessingStep = "idle" | "transcribing" | "translating" | "done";

export default function App() {
  // Input state
  const [activeTab, setActiveTab] = useState<InputTab>("record");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Language state
  const [sourceLang, setSourceLang] = useState<string | null>("en"); // null = auto-detect
  const [targetLang, setTargetLang] = useState<string>("en");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  // Results
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  // Processing state
  const [step, setStep] = useState<ProcessingStep>("idle");
  const [error, setError] = useState<AIError | null>(null);

  // History
  const [history, setHistory] = useState<TranslationRecord[]>(getHistory);
  const [showHistory, setShowHistory] = useState(false);

  const isProcessing = step === "transcribing" || step === "translating";

  const effectiveSourceLang = sourceLang;
  const sourceLangObj = effectiveSourceLang
    ? getLanguageByCode(effectiveSourceLang)
    : null;
  const targetLangObj = targetLang ? getLanguageByCode(targetLang) : null;

  const handleAudioReady = useCallback(
    (blob: Blob, duration: number, fileName?: string) => {
      setAudioBlob(blob);
      setAudioDuration(duration);
      setAudioFileName(fileName || "recording.webm");
      // Reset previous results
      setSourceText("");
      setTranslatedText("");
      setDetectedLang(null);
      setError(null);
      setStep("idle");
    },
    [],
  );

  const handleRecordingReady = useCallback(
    (blob: Blob, duration: number) => {
      handleAudioReady(blob, duration, "recording.webm");
    },
    [handleAudioReady],
  );

  const handleUploadReady = useCallback(
    (blob: Blob, duration: number, fileName: string) => {
      handleAudioReady(blob, duration, fileName);
    },
    [handleAudioReady],
  );

  const swapLanguages = () => {
    if (!effectiveSourceLang) return;
    const newSource = targetLang;
    const newTarget = effectiveSourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    setDetectedLang(null);
    // Swap texts if available
    if (sourceText && translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleTranslate = async () => {
    if (!audioBlob) {
      toast.error("Please record or upload audio first");
      return;
    }
    if (!targetLang) {
      toast.error("Please select a target language");
      return;
    }

    setError(null);
    setSourceText("");
    setTranslatedText("");
    setStep("transcribing");

    // Step 1: Transcribe
    const transcribeRes = await transcribeAudio(
      audioBlob,
      sourceLang || undefined,
    );

    if (!transcribeRes.success || !transcribeRes.data) {
      setError(transcribeRes.error!);
      setStep("idle");
      return;
    }

    const { text: transcribedText } = transcribeRes.data;

    // Map detected language

    setSourceText(transcribedText);

    const finalSourceLang = sourceLang || "en";

    // If source and target are the same, skip translation
    if (finalSourceLang === targetLang) {
      setTranslatedText(transcribedText);
      setStep("done");
      toast.success(
        "Transcription complete — source and target language are the same",
      );
      saveToHistory(
        transcribedText,
        transcribedText,
        finalSourceLang,
        targetLang,
      );
      return;
    }

    setStep("translating");

    // Step 2: Translate
    const translateRes = await translateText(
      transcribedText,
      finalSourceLang,
      targetLang,
    );

    if (!translateRes.success || !translateRes.data) {
      setError(translateRes.error!);
      setStep("idle");
      return;
    }

    const { translated_text } = translateRes.data;
    setTranslatedText(translated_text);
    setStep("done");
    toast.success("Translation complete!");

    saveToHistory(
      transcribedText,
      translated_text,
      finalSourceLang,
      targetLang,
    );
  };

  const saveToHistory = (
    src: string,
    tgt: string,
    srcLang: string,
    tgtLang: string,
  ) => {
    addToHistory({
      audioName: audioFileName,
      sourceLang: srcLang,
      targetLang: tgtLang,
      sourceText: src,
      translatedText: tgt,
      duration: audioDuration,
    });
    setHistory(getHistory());
  };

  const handleRetry = () => {
    setError(null);
    handleTranslate();
  };

  const handleRestoreHistory = (record: TranslationRecord) => {
    setSourceText(record.sourceText);
    setTranslatedText(record.translatedText);
    setSourceLang(record.sourceLang);
    setTargetLang(record.targetLang);
    setDetectedLang(null);
    setStep("done");
    setShowHistory(false);
    toast.success("Translation restored from history");
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e2233",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#e2e8f0",
          },
        }}
      />

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* ===== HEADER ===== */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/25">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-white">Qorila</h1>
              <p className="text-xs text-slate-500">Whisper · M2M100</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory((s) => !s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all
                ${
                  showHistory
                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }
              `}
            >
              <Clock size={14} />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="text-xs bg-indigo-500/20 text-indigo-400 rounded-full px-1.5 py-0.5 min-w-5 text-center">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ===== ERROR BANNER ===== */}
        <AnimatePresence>
          {error && (
            <RateLimitBanner
              error={error}
              onDismiss={() => setError(null)}
              onRetry={error.type === "rate_limit" ? handleRetry : undefined}
            />
          )}
        </AnimatePresence>

        {/* ===== MAIN CARD ===== */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm ">
          {/* Input tabs */}
          <div className="flex border-b border-slate-700/50">
            {[
              { id: "record" as InputTab, icon: Mic, label: "Record Audio" },
              { id: "upload" as InputTab, icon: Upload, label: "Upload File" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setAudioBlob(null);
                  setSourceText("");
                  setTranslatedText("");
                  setDetectedLang(null);
                  setError(null);
                  setStep("idle");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm transition-all
                  ${
                    activeTab === id
                      ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                      : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:bg-slate-800/30"
                  }
                `}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* Audio Input Section */}
            <div>
              <AnimatePresence mode="wait">
                {activeTab === "record" ? (
                  <motion.div
                    key="recorder"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AudioRecorder
                      onAudioReady={handleRecordingReady}
                      disabled={isProcessing}
                      clearAudioBlob={() => setAudioBlob(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="uploader"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AudioUpload
                      onAudioReady={handleUploadReady}
                      disabled={isProcessing}
                      clearAudioBlob={() => setAudioBlob(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-xs text-slate-600 uppercase tracking-wider">
                Languages
              </span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>

            {/* Language selectors */}
            <div className="flex flex-col md:flex-row md:items-end gap-2">
              {/* Source language */}
              <div className="flex-1">
                <LanguageSelectorDropdown
                  value={sourceLang || ""}
                  onChange={(v) => {
                    setSourceLang(v || null);
                    setDetectedLang(null);
                  }}
                  label="Source Language"
                  // allowAuto
                  disabled={isProcessing}
                  detectedLabel={
                    detectedLang && !sourceLang
                      ? `Detected: ${getLanguageByCode(detectedLang)?.name || detectedLang}`
                      : undefined
                  }
                />
              </div>

              {/* Swap button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={swapLanguages}
                disabled={isProcessing || !effectiveSourceLang}
                className={`mb-1 p-2.5 rounded-xl border transition-colors flex items-center justify-center
                  ${
                    effectiveSourceLang && !isProcessing
                      ? "border-slate-600 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400"
                      : "border-slate-700/50 bg-slate-800/20 text-slate-600 cursor-not-allowed"
                  }
                `}
                title="Swap languages"
              >
                <ArrowLeftRight
                  size={15}
                  className="transition-all duration-300 ease-in-out hover:rotate-180 "
                />
              </motion.button>

              {/* Target language */}
              <div className="flex-1">
                <LanguageSelectorDropdown
                  value={targetLang}
                  onChange={setTargetLang}
                  label="Target Language"
                  placeholder="Select target"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Translate Button */}
            <motion.button
              whileHover={!isProcessing && audioBlob ? { scale: 1.01 } : {}}
              whileTap={!isProcessing && audioBlob ? { scale: 0.99 } : {}}
              onClick={handleTranslate}
              disabled={isProcessing || !audioBlob || !targetLang}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm transition-all duration-200
                ${
                  !isProcessing && audioBlob && targetLang
                    ? "bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>
                    {step === "transcribing"
                      ? "Transcribing with Whisper…"
                      : "Translating with M2M100…"}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>
                    {audioBlob
                      ? "Transcribe & Translate"
                      : "Record or upload audio to begin"}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ===== RESULTS ===== */}
        <AnimatePresence>
          {(sourceText || translatedText || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-slate-300">Results</h2>
                {step === "done" && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Complete
                  </span>
                )}
              </div>
              <TranslationPanel
                sourceText={sourceText}
                translatedText={translatedText}
                sourceLang={sourceLangObj || null}
                targetLang={targetLangObj || null}
                isLoading={isProcessing}
                loadingStep={
                  step === "transcribing"
                    ? "transcribing"
                    : step === "translating"
                      ? "translating"
                      : null
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== HISTORY SECTION ===== */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-slate-400" />
                  <h2 className="text-slate-200">Translation History</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-5">
                <TranslationHistory
                  records={history}
                  onRecordsChange={() => setHistory(getHistory())}
                  onRestore={handleRestoreHistory}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== FOOTER ===== */}
        <footer className="text-center space-y-1 pb-4">
          <p className="text-xs text-slate-600">
            Powered by{" "}
            <span className="text-slate-500">
              @cf/openai/whisper-large-v3-turbo
            </span>{" "}
            · <span className="text-slate-500">@cf/meta/m2m100-1.2b</span>
          </p>
          <p className="text-xs text-slate-700">
            {SUPPORTED_LANGUAGES.length} languages supported
          </p>
        </footer>
      </div>
    </div>
  );
}
