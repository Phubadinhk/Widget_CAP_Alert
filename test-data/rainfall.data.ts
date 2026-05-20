export const RAINFALL_PERFORMANCE_DATA = {
  BASE_URL: "https://dev-ndwc.azurewebsites.net",
  ROOT_URL: "https://dev-ndwc.azurewebsites.net",
  PATH: "/kioskClient/wrf/cumulativeRainfall",

  TOTAL_RUNS: 1,
  CONCURRENT_CONTEXTS: 5,

  TEST_TIMEOUT: 600000,
  NAVIGATION_TIMEOUT: 60000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,
};

