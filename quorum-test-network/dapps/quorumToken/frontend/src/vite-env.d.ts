interface ImportMetaEnv {
  readonly VITE_TICKETNFT_ADDRESS?: string;
  readonly VITE_CONTRACT_ADDRESS?: string;  
  readonly VITE_API_BASE_URL?: string; // Add other environment variables as needed
}
interface ImportMeta {
   readonly env: ImportMetaEnv;
}