export type LLMMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type LLMRequestBody = {
  model?: string;
  max_tokens?: number;
  system?: string;
  messages?: LLMMessage[];
  /** Forzar JSON (Ollama) */
  json?: boolean;
};

export type LLMResponseBody = {
  content: [{ text: string }];
  error?: { message: string };
};
