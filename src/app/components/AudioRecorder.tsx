import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Pause, Play, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  clearAudioBlob: () => void;
}

type RecordingState = "idle" | "recording" | "paused" | "done";

export function AudioRecorder({
  onAudioReady,
  disabled,
  clearAudioBlob,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for waveform
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioDuration(elapsedBeforePauseRef.current + elapsed);
        setState("done");
        stopStream();

        // Pass blob upstream
        onAudioReady(blob, elapsedBeforePauseRef.current + elapsed);
      };

      recorder.start(100);

      startTimeRef.current = Date.now();
      elapsedBeforePauseRef.current = 0;
      setElapsed(0);

      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      setState("recording");
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert(
        "Microphone access was denied. Please allow microphone permissions and try again.",
      );
    }
  }, [onAudioReady, elapsed]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
      elapsedBeforePauseRef.current += elapsed;
      setElapsed(0);
      setState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
      setState("recording");
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const discardRecording = () => {
    clearInterval(timerRef.current);
    stopStream();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    chunksRef.current = [];
    setElapsed(0);
    elapsedBeforePauseRef.current = 0;
    setState("idle");
    clearAudioBlob();
  };

  const totalElapsed = elapsedBeforePauseRef.current + elapsed;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Waveform */}
      <div className="w-full h-16 rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/40">
        <WaveformVisualizer
          analyser={analyserRef.current}
          isActive={state === "recording"}
          color="#6366f1"
        />
      </div>

      {/* Timer */}
      <AnimatePresence mode="wait">
        {state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-2"
          >
            {state === "recording" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="text-white font-mono text-xl tracking-widest">
              {formatTime(state === "done" ? audioDuration : totalElapsed)}
            </span>
            {state === "recording" && (
              <span className="text-xs text-slate-400 ml-1">recording</span>
            )}
            {state === "paused" && (
              <span className="text-xs text-amber-400 ml-1">paused</span>
            )}
            {state === "done" && (
              <span className="text-xs text-green-400 ml-1 flex items-center gap-1">
                <Check size={11} /> ready
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {state === "idle" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            disabled={disabled}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Mic size={18} />
            <span className="text-sm">Start Recording</span>
          </motion.button>
        )}

        {(state === "recording" || state === "paused") && (
          <>
            {state === "recording" ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseRecording}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 text-amber-400 transition-colors"
              >
                <Pause size={16} />
                <span className="text-sm">Pause</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resumeRecording}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400 transition-colors"
              >
                <Play size={16} />
                <span className="text-sm">Resume</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 transition-colors"
            >
              <Square size={16} />
              <span className="text-sm">Stop</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={discardRecording}
              className="p-2.5 rounded-xl bg-slate-700/40 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          </>
        )}

        {state === "done" && (
          <>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600/10 border border-green-500/20 text-green-400">
              <Check size={16} />
              <span className="text-sm">Recording ready</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={discardRecording}
              className="p-2.5 rounded-xl bg-slate-700/40 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Trash2 size={16} />
            </motion.button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      <AnimatePresence>
        {audioUrl && state === "done" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
          >
            <audio
              controls
              src={audioUrl}
              className="w-full h-8 rounded-lg"
              style={{ filter: "invert(0.8) hue-rotate(180deg)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
