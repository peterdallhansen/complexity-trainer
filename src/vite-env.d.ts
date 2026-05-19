/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables.
 * Ensures TypeScript recognizes the custom VITE_ env vars.
 */
interface ImportMetaEnv {
  readonly VITE_AZURE_OPENAI_BASE_URL: string;
  readonly VITE_AZURE_OPENAI_API_KEY: string;
  readonly VITE_AZURE_OPENAI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
