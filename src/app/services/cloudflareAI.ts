// ======= CONFIGURATION =======
// Replace these with your actual Cloudflare credentials
export const CLOUDFLARE_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
};
// =============================

export interface WhisperResult {
  text: string;
  word_count?: number;
  words?: Array<{ word: string; start: number; end: number }>;
  vtt?: string;
}

export interface TranslationResult {
  translated_text: string;
}
const ERROR_MESSAGES = {
  rate_limit:
    "Too many requests right now. Please wait a moment and try again.",

  auth: "Request could not be authorized. Please try again later.",

  model_unavailable:
    "The AI service is temporarily unavailable. Please try again shortly.",

  network: "Unable to reach the server. Check the connection and try again.",

  unknown: "An unexpected error occurred. Please try again.",
};
export type AIError =
  | { type: "rate_limit"; message: string }
  | { type: "auth"; message: string }
  | { type: "model_unavailable"; message: string }
  | { type: "network"; message: string }
  | { type: "unknown"; message: string };

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: AIError;
}

/**
 * Converts a Blob to a Base64 string.
 * @param blob The Blob object to convert.
 * @returns A promise that resolves with the Base64 string (including data URL prefix).
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Successfully finished reading
    reader.onloadend = () => {
      // reader.result will be a string in data URL format
      resolve(reader.result as string);
    };

    // Handle potential errors
    reader.onerror = reject;

    // Read the blob as a Data URL (base64)
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribe audio using Cloudflare Workers AI Whisper model
 * @param audioBlob - The audio blob to transcribe
 * @param sourceLanguage - Optional: hint the language to Whisper (ISO 639-1 code)
 */
export async function transcribeAudio(
  audioBlob: Blob,
  sourceLanguage?: string,
): Promise<AIResponse<WhisperResult>> {
  const { baseUrl } = CLOUDFLARE_CONFIG;

  try {
    const base64String = await blobToBase64(audioBlob);
    const transcriptionBody = {
      audio: base64String,
      language: sourceLanguage,
    };

    const url = `${baseUrl}/transcribe`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: JSON.stringify(transcriptionBody),
    });

    if (response.status === 429) {
      return {
        success: false,
        error: {
          type: "rate_limit",
          message: ERROR_MESSAGES.rate_limit,
        },
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: {
          type: "auth",
          message: ERROR_MESSAGES.auth,
        },
      };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: {
          type: "unknown",
          message: ERROR_MESSAGES.unknown,
        },
      };
    }

    const json = await response.json();

    if (!json.success) {
      const errMsg = json.errors?.[0]?.message || "Unknown Cloudflare AI error";
      if (errMsg.toLowerCase().includes("rate limit")) {
        return {
          success: false,
          error: { type: "rate_limit", message: ERROR_MESSAGES.rate_limit },
        };
      }
      return {
        success: false,
        error: { type: "unknown", message: ERROR_MESSAGES.unknown },
      };
    }
    return {
      success: true,
      data: json.result as WhisperResult,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network request failed";
    return {
      success: false,
      error: { type: "network", message: ERROR_MESSAGES.network },
    };
  }
}

/**
 * Translate text using Cloudflare Workers AI M2M100-1.2B model
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<AIResponse<TranslationResult>> {
  const { baseUrl } = CLOUDFLARE_CONFIG;

  try {
    const url = `${baseUrl}/translate`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    });

    if (response.status === 429) {
      return {
        success: false,
        error: {
          type: "rate_limit",
          message: ERROR_MESSAGES.rate_limit,
        },
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: {
          type: "auth",
          message: ERROR_MESSAGES.auth,
        },
      };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: {
          type: "unknown",
          message: ERROR_MESSAGES.unknown,
        },
      };
    }

    const json = await response.json();

    if (!json.success) {
      const errMsg = json.errors?.[0]?.message || "Unknown translation error";
      if (errMsg.toLowerCase().includes("rate limit")) {
        return {
          success: false,
          error: { type: "rate_limit", message: ERROR_MESSAGES.rate_limit },
        };
      }
      return {
        success: false,
        error: { type: "unknown", message: ERROR_MESSAGES.unknown },
      };
    }

    return {
      success: true,
      data: json.result as TranslationResult,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network request failed";
    return {
      success: false,
      error: { type: "network", message: ERROR_MESSAGES.network },
    };
  }
}
