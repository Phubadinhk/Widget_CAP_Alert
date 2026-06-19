export const ALERT_HISTORY_PERFORMANCE_DATA = {
  ROOT_URL: "https://ndwc-cap-kiosk-dev.azurewebsites.net",

  PATH_TEMPLATE: "/kioskclient/disasteralerthistory/history/{geocode}",

  TOTAL_RUNS: 1,
  TEST_TIMEOUT: 1800000,
  NAVIGATION_TIMEOUT: 120000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,

  GEOCODE: [
    "th-52", "th-51", "th-50", "th-49", "th-48",
    // "th-47", "th-46", "th-45", "th-44", "th-43",
    // "th-42", "th-41", "th-40", "th-39", "th-38",
    // "th-37", "th-36", "th-35", "th-34", "th-33",
  ],
};