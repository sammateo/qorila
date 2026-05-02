import { useEffect, useRef } from "react";

// Polyfill for roundRect if not available
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = Math.min(radius, height / 2, width / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  color?: string;
  barCount?: number;
  className?: string;
}

export function WaveformVisualizer({
  analyser,
  isActive,
  color = "#6366f1",
  barCount = 48,
  className = "",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isActive) {
        // Draw idle flat bars
        const barWidth = (width / barCount) * 0.6;
        const gap = (width / barCount) * 0.4;

        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + gap) + gap / 2;
          const barHeight = 3;
          const y = (height - barHeight) / 2;

          ctx.fillStyle = color + "40";
          ctx.beginPath();
          roundRect(ctx, x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(3, value * height * 0.85);
        const x = i * (barWidth + gap) + gap / 2;
        const y = (height - barHeight) / 2;

        // Gradient color based on amplitude
        const alpha = 0.4 + value * 0.6;
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");

        ctx.beginPath();
        roundRect(ctx, x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyser, isActive, color, barCount]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });

    resizeObserver.observe(canvas);
    // Initial size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}

// Static waveform for playback display (non-animated)
export function StaticWaveform({
  className = "",
  barCount = 60,
  color = "#6366f1",
}: {
  className?: string;
  barCount?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Generate random-ish waveform pattern
    const seed = 42;
    const barWidth = (width / barCount) * 0.55;
    const gap = (width / barCount) * 0.45;

    for (let i = 0; i < barCount; i++) {
      // Pseudo-random heights for visual appeal
      const noise =
        Math.sin(i * 0.5 + seed) * 0.3 +
        Math.sin(i * 1.3) * 0.2 +
        Math.sin(i * 0.17) * 0.15 +
        0.35;
      const normalizedHeight = Math.max(0.08, Math.min(0.9, noise));
      const barHeight = normalizedHeight * height * 0.8;

      const x = i * (barWidth + gap) + gap / 2;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = color + "80";
      ctx.beginPath();
      roundRect(ctx, x, y, barWidth, barHeight, 3);
      ctx.fill();
    }
  }, [barCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}