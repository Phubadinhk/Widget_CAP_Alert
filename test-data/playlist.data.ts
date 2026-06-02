export const PLAYLIST_PERFORMANCE_DATA = {
  BASE_URL: "https://ndwc-cap-kiosk-dev.azurewebsites.net/",
  ROOT_URL: "https://ndwc-cap-kiosk-dev.azurewebsites.net/",
  PATH: "/KioskClient/Playlist",

  TOTAL_RUNS: 1,
  CONCURRENT_CONTEXTS: 5,

  TEST_TIMEOUT: 1800000,
  NAVIGATION_TIMEOUT: 120000,
  ROOT_URL_TIMEOUT: 60000,
  WAIT_UNTIL: "networkidle" as const,
};

