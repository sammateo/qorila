import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LANGUAGES } from "../services/languages";

interface LanguageSelectorProps {
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;
  label?: string;
  allowAuto?: boolean;
  disabled?: boolean;
  detectedLabel?: string;
}

export function LanguageSelectorDropdown({
  value,
  onChange,
  placeholder = "Select language",
  label,
  allowAuto = false,
  disabled = false,
  detectedLabel,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedLang = value
    ? SUPPORTED_LANGUAGES.find((l) => l.code === value)
    : null;

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-indigo-500/50"}
          ${isOpen ? "border-indigo-500 bg-slate-800/80" : "border-slate-700 bg-slate-800/50"}
        `}
      >
        {selectedLang ? (
          <>
            <span className="text-lg leading-none">{selectedLang.flag}</span>
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm block truncate">
                {selectedLang.name}
              </span>
              {detectedLabel && (
                <span className="text-xs text-indigo-400 block">
                  {detectedLabel}
                </span>
              )}
            </div>
          </>
        ) : allowAuto && !value ? (
          <>
            <span className="text-lg leading-none">🔍</span>
            <div className="flex-1 min-w-0">
              <span className="text-slate-300 text-sm block truncate">
                Auto-detect
              </span>
              {detectedLabel && (
                <span className="text-xs text-indigo-400 block">
                  {detectedLabel}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="text-slate-400 text-sm flex-1">{placeholder}</span>
        )}
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            style={{ maxHeight: "280px" }}
          >
            {/* Search */}
            <div className="p-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-800 rounded-lg">
                <Search size={13} className="text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="overflow-y-auto" style={{ maxHeight: "510px" }}>
              {allowAuto && (
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-800 transition-colors text-left
                    ${!value ? "bg-indigo-500/10 text-indigo-400" : "text-slate-300"}
                  `}
                >
                  <span className="text-base">🔍</span>
                  <div>
                    <span className="text-sm block">Auto-detect</span>
                    <span className="text-xs text-slate-500">
                      Whisper will detect the language
                    </span>
                  </div>
                </button>
              )}

              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  No languages found
                </div>
              ) : (
                filtered.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 transition-colors text-left
                      ${value === lang.code ? "bg-indigo-500/10 text-indigo-300" : "text-slate-300"}
                    `}
                  >
                    <span className="text-base shrink-0">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm block">{lang.name}</span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-xs text-slate-500 block">
                          {lang.nativeName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 font-mono shrink-0">
                      {lang.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
