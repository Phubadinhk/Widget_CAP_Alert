export const RAINFALL_PERFORMANCE_DATA = {
  ROOT_URL: "https://dev-ndwc.azurewebsites.net",
  PATH_TEMPLATE: "/kioskClient/wrf/cumulativeRainfall",

  TOTAL_RUNS: 1,
  CONCURRENT_CONTEXTS: 5,

  TEST_TIMEOUT: 1800000,
  NAVIGATION_TIMEOUT: 120000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,
};

