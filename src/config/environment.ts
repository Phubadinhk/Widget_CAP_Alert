import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const ENV = {
  TEST_ENV: process.env.TEST_ENV ?? "LOCAL",

  V3_URL: getEnv("V3_URL"),
  V9_URL: getEnv("V9_URL"),
  KIOSK_TOKEN: getEnv("KIOSK_TOKEN"),
};
