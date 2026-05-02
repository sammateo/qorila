import { useState, useRef, useCallback } from "react";
import { Upload, FileAudio, X, Check, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StaticWaveform } from "./WaveformVisualizer";

interface AudioUploadProps {
  onAudioReady: (blob: Blob, durationSeconds: number, fileName: string) => void;
  disabled?: boolean;
  clearAudioBlob: () => void;
}

const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/mp4",
];

const MAX_SIZE_MB = 25;

export function AudioUpload({
  onAudioReady,
  disabled,
  clearAudioBlob,
}: AudioUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (f: File) => {
      setError(null);

      const sizeInMB = f.size / (1024 * 1024);
      if (sizeInMB > MAX_SIZE_MB) {
        setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      if (
        !ACCEPTED_TYPES.some(
          (type) =>
            f.type === type ||
            (type === "audio/mp3" && f.type === "audio/mpeg"),
        )
      ) {
        // Try to be lenient with file extension
        const ext = f.name.split(".").pop()?.toLowerCase();
        const allowedExts = [
          "mp3",
          "wav",
          "ogg",
          "webm",
          "flac",
          "aac",
          "m4a",
          "mp4",
        ];
        if (!ext || !allowedExts.includes(ext)) {
          setError(
            "Unsupported file type. Please upload MP3, WAV, OGG, WEBM, FLAC, AAC, or M4A files.",
          );
          return;
        }
      }

      setFile(f);

      // Get audio duration
      const url = URL.createObjectURL(f);
      const audio = new Audio(url);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => resolve();
      });
      const duration = isFinite(audio.duration) ? audio.duration : 0;
      URL.revokeObjectURL(url);

      onAudioReady(f, duration, f.name);
    },
    [onAudioReady],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
    e.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    clearAudioBlob();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed
              transition-all duration-200 cursor-pointer select-none
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${
                isDragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
              }
            `}
          >
            <div
              className={`p-3 rounded-xl ${isDragging ? "bg-indigo-500/20" : "bg-slate-700/50"} transition-colors`}
            >
              {isDragging ? (
                <CloudUpload size={24} className="text-indigo-400" />
              ) : (
                <Upload size={24} className="text-slate-400" />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-200">
                {isDragging
                  ? "Drop your audio file here"
                  : "Drop audio here or click to browse"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                MP3, WAV, OGG, WEBM, FLAC, AAC, M4A — up to {MAX_SIZE_MB}MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleInputChange}
              disabled={disabled}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl border border-slate-700 bg-slate-800/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <FileAudio size={18} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {formatSize(file.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <Check size={12} />
                  <span>Ready</span>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Static waveform decoration */}
            <div className="h-10 rounded-lg overflow-hidden">
              <StaticWaveform color="#6366f1" barCount={50} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
          >
            <X size={12} className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
