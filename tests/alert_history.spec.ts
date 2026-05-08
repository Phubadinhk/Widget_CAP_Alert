import dotenv from "dotenv";
dotenv.config();

import { test } from "@playwright/test";
import { ALERT_HISTORY_PERFORMANCE_DATA } from "../test-data/alert_history.data";
import { AlertHistoryPerformancePage } from "../page-object/alert_history";

test("Performance DisasterAlertHistory Page", async () => {
  test.setTimeout(ALERT_HISTORY_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  const fullUrl = new URL(
    `${ALERT_HISTORY_PERFORMANCE_DATA.PATH}/${token}`,
    ALERT_HISTORY_PERFORMANCE_DATA.BASE_URL,
  ).toString();

  console.log("Performance Result DisasterAlertHistory Page");

  for (let i = 1; i <= ALERT_HISTORY_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const alertHistoryPage = new AlertHistoryPerformancePage();

    try {
      await alertHistoryPage.openNewBrowser();

      const finishTimeSec = await alertHistoryPage.gotoAndGetNetworkFinishTime(
        fullUrl,
        ALERT_HISTORY_PERFORMANCE_DATA.WAIT_UNTIL,
        ALERT_HISTORY_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
      );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await alertHistoryPage.close();
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
    `Success Runs: ${finishTimes.length}/${ALERT_HISTORY_PERFORMANCE_DATA.TOTAL_RUNS}`,
  );

  console.log(`Total Time: ${totalTime.toFixed(2)} s`);

  console.log(`Average Time: ${averageTime.toFixed(2)} s`);

  console.log(`Median Time: ${medianTime.toFixed(2)} s`);

  console.log(`Min Time: ${minTime.toFixed(2)} s`);

  console.log(`Max Time: ${maxTime.toFixed(2)} s`);
});
