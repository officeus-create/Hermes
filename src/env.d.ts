/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_MODE?: "preview" | "live";
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
  // Independent capture-only UI switch; default unset = preview.
  readonly PUBLIC_CARRIER_CAPTURE_MODE?: "disabled" | "capture_only";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
