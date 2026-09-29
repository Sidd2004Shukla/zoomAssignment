// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // backend api url
      NEXT_PUBLIC_API_BASE_URL: string;

      // zegocloud public config
      NEXT_PUBLIC_ZEGOCLOUD_APP_ID: string;

      // app base url
      NEXT_PUBLIC_BASE_URL: string;
    }
  }
}
