// Supported languages for M2M100-1.2B and Whisper
// M2M100 uses ISO 639-1 two-letter codes
// Whisper uses similar codes but may differ in some cases

export interface Language {
  code: string; // M2M100 / ISO 639-1 code
  whisperCode: string; // Whisper language code (usually same)
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "af", whisperCode: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦" },
  { code: "ar", whisperCode: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "az", whisperCode: "az", name: "Azerbaijani", nativeName: "Azərbaycan", flag: "🇦🇿" },
  { code: "be", whisperCode: "be", name: "Belarusian", nativeName: "Беларуская", flag: "🇧🇾" },
  { code: "bg", whisperCode: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬" },
  { code: "bn", whisperCode: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "bs", whisperCode: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦" },
  { code: "ca", whisperCode: "ca", name: "Catalan", nativeName: "Català", flag: "🏴" },
  { code: "cs", whisperCode: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "cy", whisperCode: "cy", name: "Welsh", nativeName: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { code: "da", whisperCode: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "de", whisperCode: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "el", whisperCode: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "en", whisperCode: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", whisperCode: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "et", whisperCode: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪" },
  { code: "fa", whisperCode: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
  { code: "fi", whisperCode: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "fr", whisperCode: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "gl", whisperCode: "gl", name: "Galician", nativeName: "Galego", flag: "🏴" },
  { code: "gu", whisperCode: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "ha", whisperCode: "ha", name: "Hausa", nativeName: "Hausa", flag: "🇳🇬" },
  { code: "he", whisperCode: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
  { code: "hi", whisperCode: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "hr", whisperCode: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷" },
  { code: "hu", whisperCode: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺" },
  { code: "hy", whisperCode: "hy", name: "Armenian", nativeName: "Հայerен", flag: "🇦🇲" },
  { code: "id", whisperCode: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "is", whisperCode: "is", name: "Icelandic", nativeName: "Íslenska", flag: "🇮🇸" },
  { code: "it", whisperCode: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ja", whisperCode: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ka", whisperCode: "ka", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪" },
  { code: "kk", whisperCode: "kk", name: "Kazakh", nativeName: "Қазақ", flag: "🇰🇿" },
  { code: "km", whisperCode: "km", name: "Khmer", nativeName: "ខ្មែរ", flag: "🇰🇭" },
  { code: "ko", whisperCode: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "lt", whisperCode: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹" },
  { code: "lv", whisperCode: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻" },
  { code: "mk", whisperCode: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰" },
  { code: "ml", whisperCode: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "mn", whisperCode: "mn", name: "Mongolian", nativeName: "Монгол", flag: "🇲🇳" },
  { code: "mr", whisperCode: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ms", whisperCode: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "my", whisperCode: "my", name: "Burmese", nativeName: "မြန်မာ", flag: "🇲🇲" },
  { code: "ne", whisperCode: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵" },
  { code: "nl", whisperCode: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "no", whisperCode: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "pa", whisperCode: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "pl", whisperCode: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "ps", whisperCode: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫" },
  { code: "pt", whisperCode: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ro", whisperCode: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "ru", whisperCode: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "si", whisperCode: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰" },
  { code: "sk", whisperCode: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰" },
  { code: "sl", whisperCode: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮" },
  { code: "so", whisperCode: "so", name: "Somali", nativeName: "Soomaali", flag: "🇸🇴" },
  { code: "sq", whisperCode: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱" },
  { code: "sr", whisperCode: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸" },
  { code: "sv", whisperCode: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "sw", whisperCode: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
  { code: "ta", whisperCode: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", whisperCode: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "tg", whisperCode: "tg", name: "Tajik", nativeName: "Тоҷикӣ", flag: "🇹🇯" },
  { code: "th", whisperCode: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭" },
  { code: "tk", whisperCode: "tk", name: "Turkmen", nativeName: "Türkmen", flag: "🇹🇲" },
  { code: "tl", whisperCode: "tl", name: "Filipino", nativeName: "Filipino", flag: "🇵🇭" },
  { code: "tr", whisperCode: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "tt", whisperCode: "tt", name: "Tatar", nativeName: "Татар", flag: "🇷🇺" },
  { code: "uk", whisperCode: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "ur", whisperCode: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "uz", whisperCode: "uz", name: "Uzbek", nativeName: "O'zbek", flag: "🇺🇿" },
  { code: "vi", whisperCode: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "xh", whisperCode: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦" },
  { code: "yi", whisperCode: "yi", name: "Yiddish", nativeName: "ייִדיש", flag: "🏴" },
  { code: "yo", whisperCode: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬" },
  { code: "zh", whisperCode: "zh", name: "Chinese (Simplified)", nativeName: "中文", flag: "🇨🇳" },
  { code: "zu", whisperCode: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦" },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(
    (l) => l.code === code || l.whisperCode === code
  );
};

// Map Whisper detected language codes to our supported languages
export const mapWhisperLanguage = (whisperCode: string): string => {
  // Whisper returns full language names sometimes, or codes
  const lowerCode = whisperCode.toLowerCase().trim();
  const lang = SUPPORTED_LANGUAGES.find(
    (l) =>
      l.whisperCode === lowerCode ||
      l.code === lowerCode ||
      l.name.toLowerCase() === lowerCode
  );
  return lang?.code || lowerCode;
};
