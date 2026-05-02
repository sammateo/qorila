import { AlertTriangle, X, RefreshCw, Settings, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { AIError } from "../services/cloudflareAI";

interface RateLimitBannerProps {
  error: AIError;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function RateLimitBanner({
  error,
  onDismiss,
  onRetry,
}: RateLimitBannerProps) {
  const config: Record<
    AIError["type"],
    {
      icon: React.ReactNode;
      title: string;
      color: string;
      bg: string;
      border: string;
    }
  > = {
    rate_limit: {
      icon: <AlertTriangle size={16} />,
      title: "Rate Limit Reached",
      color: "text-amber-400",
      bg: "bg-amber-500/8",
      border: "border-amber-500/25",
    },
    auth: {
      icon: <Settings size={16} />,
      title: "Authentication Error",
      color: "text-red-400",
      bg: "bg-red-500/8",
      border: "border-red-500/25",
    },
    model_unavailable: {
      icon: <AlertTriangle size={16} />,
      title: "Model Unavailable",
      color: "text-orange-400",
      bg: "bg-orange-500/8",
      border: "border-orange-500/25",
    },
    network: {
      icon: <Wifi size={16} />,
      title: "Network Error",
      color: "text-slate-300",
      bg: "bg-slate-700/30",
      border: "border-slate-600/30",
    },
    unknown: {
      icon: <AlertTriangle size={16} />,
      title: "Error",
      color: "text-red-400",
      bg: "bg-red-500/8",
      border: "border-red-500/25",
    },
  };

  const cfg = config[error.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
    >
      <span className={`${cfg.color} shrink-0 mt-0.5`}>{cfg.icon}</span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${cfg.color}`}>{cfg.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          {error.message}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onRetry && error.type === "rate_limit" && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Retry"
          >
            <RefreshCw size={13} />
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}
