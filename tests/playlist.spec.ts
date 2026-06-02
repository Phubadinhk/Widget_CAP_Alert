import dotenv from "dotenv";
dotenv.config();

import { test } from "@playwright/test";
import { PLAYLIST_PERFORMANCE_DATA } from "../test-data/playlist.data";
import { PlaylistPerformancePage } from "../page-object/playlist";

type PerformanceSuccessResult = {
  success: true;
  run: number;
  instance: number;
  finishTimeSec: number;
};

type PerformanceFailResult = {
  success: false;
  run: number;
  instance: number;
  message: string;
};

type PerformanceResult = PerformanceSuccessResult | PerformanceFailResult;

test("Performance playlist Page - 20 Contexts", async () => {
  test.setTimeout(PLAYLIST_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];
  const errorLogs: string[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  const fullUrl =
    `${PLAYLIST_PERFORMANCE_DATA.BASE_URL}` +
    `${PLAYLIST_PERFORMANCE_DATA.PATH}/${token}`;

  console.log("Performance Result Playlist Page");
  console.log(
    `1 Run = 1 Browser | เปิดพร้อมกัน ${PLAYLIST_PERFORMANCE_DATA.CONCURRENT_CONTEXTS} Contexts`,
  );

  for (let run = 1; run <= PLAYLIST_PERFORMANCE_DATA.TOTAL_RUNS; run++) {
    console.log(`================ Run ${run} ================`);

    const playlistPage = new PlaylistPerformancePage();

    try {
      await playlistPage.openBrowser();

      const tasks: Promise<PerformanceResult>[] = Array.from(
        { length: PLAYLIST_PERFORMANCE_DATA.CONCURRENT_CONTEXTS },
        async (_, index) => {
          const instance = index + 1;

          try {
            const finishTimeSec =
              await playlistPage.gotoRootThenTargetAndGetNetworkFinishTimeByNewContext(
                PLAYLIST_PERFORMANCE_DATA.ROOT_URL,
                fullUrl,
                PLAYLIST_PERFORMANCE_DATA.WAIT_UNTIL,
                PLAYLIST_PERFORMANCE_DATA.ROOT_URL_TIMEOUT,
                PLAYLIST_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
                `reports/screenshots/Playlist/run-${run}-Context-${instance}.png`,
              );

            return {
              success: true as const,
              run,
              instance,
              finishTimeSec,
            };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);

            return {
              success: false as const,
              run,
              instance,
              message,
            };
          }
        },
      );

      const results = await Promise.all(tasks);

      results.forEach((result) => {
        if (result.success) {
          finishTimes.push(result.finishTimeSec);

          console.log(
            `Run ${result.run} | Context ${result.instance}: ${result.finishTimeSec.toFixed(2)} s`,
          );
        } else {
          console.error(
            `Run ${result.run} | Context ${result.instance}: โหลดไม่สำเร็จ`,
          );
          console.error(result.message);

          errorLogs.push(
            `Run ${result.run} | Context ${result.instance}: ${result.message}`,
          );
        }
      });
    } finally {
      await playlistPage.close();
    }
  }

  const totalExpected =
    PLAYLIST_PERFORMANCE_DATA.TOTAL_RUNS *
    PLAYLIST_PERFORMANCE_DATA.CONCURRENT_CONTEXTS;

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);

  const averageTime =
    finishTimes.length > 0 ? totalTime / finishTimes.length : 0;

  const sortedTimes = [...finishTimes].sort((a, b) => a - b);

  let medianTime = 0;

  if (sortedTimes.length > 0) {
    const middleIndex = Math.floor(sortedTimes.length / 2);

    medianTime =
      sortedTimes.length % 2 === 0
        ? (sortedTimes[middleIndex - 1] + sortedTimes[middleIndex]) / 2
        : sortedTimes[middleIndex];
  }

  const minTime = sortedTimes.length > 0 ? sortedTimes[0] : 0;

  const maxTime =
    sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0;

  console.log("====================================");
  console.log(`Success Contexts: ${finishTimes.length}/${totalExpected}`);
  console.log(`Failed Contexts: ${errorLogs.length}/${totalExpected}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
  console.log(`Median Time: ${medianTime.toFixed(2)} s`);
  console.log(`Min Time: ${minTime.toFixed(2)} s`);
  console.log(`Max Time: ${maxTime.toFixed(2)} s`);
  console.log("====================================");

  console.log("Error Summary");

  if (errorLogs.length === 0) {
    console.log("No Errors");
  } else {
    errorLogs.forEach((log) => console.log(log));
  }

  if (errorLogs.length > 0) {
    throw new Error(
      `Performance test failed: ${errorLogs.length}/${totalExpected} contexts failed.`,
    );
  }
});
