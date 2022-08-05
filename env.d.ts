/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  readonly VITE_WEBSITE_TITLE: string;
  readonly VITE_WEBSITE_FAVICON: string;
  readonly VITE_WEBSITE_DESCRIPTION: string;

  readonly VITE_APP_I18N_FALLBACK_LOCALE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
