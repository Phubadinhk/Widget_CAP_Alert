import dotenv from "dotenv";
dotenv.config();

import { test } from "@playwright/test";
import { RAINFALL_PERFORMANCE_DATA } from "../test-data/rainfall.data";
import { RainfallPerformancePage } from "../page-object/rainfall";

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

test("Performance cumulativeRainfall Page - 20 Contexts", async () => {
  test.setTimeout(RAINFALL_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];
  const errorLogs: string[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  const fullUrl =
    `${RAINFALL_PERFORMANCE_DATA.BASE_URL}` +
    `${RAINFALL_PERFORMANCE_DATA.PATH}/${token}`;

  console.log("Performance Result CumulativeRainfall Page");
  console.log(
    `1 Run = 1 Browser | เปิดพร้อมกัน ${RAINFALL_PERFORMANCE_DATA.CONCURRENT_CONTEXTS} Contexts`,
  );

  for (let run = 1; run <= RAINFALL_PERFORMANCE_DATA.TOTAL_RUNS; run++) {
    console.log(`================ Run ${run} ================`);

    const rainfallPage = new RainfallPerformancePage();

    try {
      await rainfallPage.openBrowser();

      const tasks: Promise<PerformanceResult>[] = Array.from(
        { length: RAINFALL_PERFORMANCE_DATA.CONCURRENT_CONTEXTS },
        async (_, index) => {
          const instance = index + 1;

          try {
            const finishTimeSec =
              await rainfallPage.gotoRootThenTargetAndGetNetworkFinishTimeByNewContext(
                RAINFALL_PERFORMANCE_DATA.ROOT_URL,
                fullUrl,
                RAINFALL_PERFORMANCE_DATA.WAIT_UNTIL,
                RAINFALL_PERFORMANCE_DATA.ROOT_URL_TIMEOUT,
                RAINFALL_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
                `reports/screenshots/Rainfall/run-${run}-Context-${instance}.png`,
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
      await rainfallPage.close();
    }
  }

  const totalExpected =
    RAINFALL_PERFORMANCE_DATA.TOTAL_RUNS *
    RAINFALL_PERFORMANCE_DATA.CONCURRENT_CONTEXTS;

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
