/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TICKETNFT_ADDRESS: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  // Adicione outras variáveis VITE_ aqui que você usa no seu app
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}