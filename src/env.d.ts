interface ImportMetaEnv {
  /** GA4 measurement id (G-XXXXXXXXXX). Unset disables analytics entirely. */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
