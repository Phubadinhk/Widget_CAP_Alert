export const TEMPERATURE_PERFORMANCE_DATA = {
  ROOT_URL: "https://dev-ndwc.azurewebsites.net",
  PATH_TEMPLATE: "/kioskClient/wrf/wrf24hr/{provinceId}",
  TOTAL_RUNS: 1,
  TEST_TIMEOUT: 1800000,
  NAVIGATION_TIMEOUT: 120000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,

  PROVINCE_IDS: [
    3, 7, 9, 12, 15,
    // 18, 22, 27, 31, 35,
    // 39, 42, 46, 50, 54,
    // 58, 63, 67, 72, 77,
  ],
};
