export const FIVE_DAY_PERFORMANCE_DATA = {
  BASE_URL: "https://dev-ndwc.azurewebsites.net",
  ROOT_URL: "https://dev-ndwc.azurewebsites.net",
  PATH: "/kioskClient/wrf/wrf5Day/42",
  TOTAL_RUNS: 10,
  TEST_TIMEOUT: 600000,
  NAVIGATION_TIMEOUT: 60000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,
};