export const DANGER_PERFORMANCE_DATA = {
  BASE_URL: "https://ndwc-cap-kiosk-dev.azurewebsites.net",
  ROOT_URL: "https://ndwc-cap-kiosk-dev.azurewebsites.net",
  PATH: "/KioskClient/DangerSituation/DangerEvent/42",
  TOTAL_RUNS: 10,
  TEST_TIMEOUT: 600000,
  NAVIGATION_TIMEOUT: 60000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,
};