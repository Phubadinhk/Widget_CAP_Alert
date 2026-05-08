import dotenv from "dotenv";
dotenv.config();

import { test } from "@playwright/test";
import { TEMPERATURE_PERFORMANCE_DATA } from "../test-data/temperature.data";
import { TemperaturePerformancePage } from "../page-object/temperature";

test("Performance wrf24hr Page", async () => {
  test.setTimeout(TEMPERATURE_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  const fullUrl =
    `${TEMPERATURE_PERFORMANCE_DATA.BASE_URL}` +
    `${TEMPERATURE_PERFORMANCE_DATA.PATH}/${token}`;

  console.log(`Performance Result wrf24hr Page`);

  for (let i = 1; i <= TEMPERATURE_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const temperaturePage = new TemperaturePerformancePage();

    try {
      await temperaturePage.openNewBrowser();

      const finishTimeSec =
        await temperaturePage.gotoRootThenTargetAndGetNetworkFinishTime(
          TEMPERATURE_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          TEMPERATURE_PERFORMANCE_DATA.WAIT_UNTIL,
          TEMPERATURE_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await temperaturePage.close();
    }
  }

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

  console.log("----------------------------");

  console.log(
    `Success Runs: ${finishTimes.length}/${TEMPERATURE_PERFORMANCE_DATA.TOTAL_RUNS}`,
  );

  console.log(`Total Time: ${totalTime.toFixed(2)} s`);

  console.log(`Average Time: ${averageTime.toFixed(2)} s`);

  console.log(`Median Time: ${medianTime.toFixed(2)} s`);

  console.log(`Min Time: ${minTime.toFixed(2)} s`);

  console.log(`Max Time: ${maxTime.toFixed(2)} s`);
});
