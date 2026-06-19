import { ENV } from "./environment";

export const UrlBuilder = {
  v3(path: string): string {
    return `${ENV.V3_URL}${path}/${ENV.KIOSK_TOKEN}`;
  },

  v9(path: string): string {
    return `${ENV.V9_URL}${path}/${ENV.KIOSK_TOKEN}`;
  },
};