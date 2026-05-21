export const HOME_PERFORMANCE_DATA = {
  BASE_URL: "https://dev-ndwc.azurewebsites.net",
  PATH_TEMPLATE: "/kioskclient/mainpage/{provinceId}/{stationId}",

  TOTAL_RUNS: 1,
  TEST_TIMEOUT: 1800000,
  NAVIGATION_TIMEOUT: 120000,
  WAIT_UNTIL: "networkidle" as const,

  PROVINCE_IDS: [
    3, 7, 9, 12, 15,
    // 18, 22, 27, 31, 35,
    // 39, 42, 46, 50, 54,
    // 58, 63, 67, 72, 77,
  ],

  STATION_IDS: [
    762, 712, 729, 742, 640,
    // 659, 739, 658, 656, 657,
    // 828, 854, 677, 688, 670,
    // 820, 858, 640, 802, 643,
  ],
};