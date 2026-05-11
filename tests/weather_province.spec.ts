import dotenv from "dotenv";
dotenv.config();

import { test } from "@playwright/test";
import { WEATHER_PERFORMANCE_DATA } from "../test-data/weather_province.data";
import { WeatherPerformancePage } from "../page-object/weather_province";

test("Performance WeatherByProvincePage", async () => {
  test.setTimeout(WEATHER_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];
  const errorLogs: string[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  const fullUrl =
    `${WEATHER_PERFORMANCE_DATA.BASE_URL}` +
    `${WEATHER_PERFORMANCE_DATA.PATH}/${token}`;

  console.log("Performance Result WeatherByProvincePage");

  for (let i = 1; i <= WEATHER_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const weatherPage = new WeatherPerformancePage();

    try {
      await weatherPage.openNewBrowser();

      const finishTimeSec =
        await weatherPage.gotoRootThenTargetAndGetNetworkFinishTime(
          WEATHER_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          WEATHER_PERFORMANCE_DATA.WAIT_UNTIL,
          WEATHER_PERFORMANCE_DATA.ROOT_URL_TIMEOUT,
          WEATHER_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      let errorType = "UNKNOWN_ERROR";

      if (
        message.includes("net::ERR_NAME_NOT_RESOLVED") ||
        message.includes("net::ERR_INVALID_URL") ||
        message.includes("Invalid URL") ||
        message.includes("WEB_URL_ERROR")
      ) {
        errorType = "ลิงก์เว็บผิด หรือ Domain ไม่ถูกต้อง";
      } else if (message.includes("Test timeout")) {
        errorType = "เวลารวมของ Test หมด (TEST_TIMEOUT)";
      } else if (message.includes("NORMAL_PAGE_LOAD_ERROR")) {
        errorType = "โหลดหน้าเว็บปกติไม่สำเร็จ ไม่ใช่ Performance";
      } else if (message.includes("PERFORMANCE_PAGE_LOAD_ERROR")) {
        errorType = "โหลดหน้าที่ใช้วัด Performance ไม่สำเร็จ";
      } else if (message.includes("PERFORMANCE_MEASURE_ERROR")) {
        errorType = "วัดเวลา Performance ไม่สำเร็จ";
      } else if (message.includes("PAGE_INITIALIZE_ERROR")) {
        errorType = "สร้าง Page ไม่สำเร็จ";
      }

      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`);
      console.error(`Error Type: ${errorType}`);
      console.error(`Error Detail: ${message}`);

      errorLogs.push(`Run ${i}: ${errorType} | ${message}`);
    } finally {
      await weatherPage.close();
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
    `Success Runs: ${finishTimes.length}/${WEATHER_PERFORMANCE_DATA.TOTAL_RUNS}`,
  );
  console.log(
    `Failed Runs: ${errorLogs.length}/${WEATHER_PERFORMANCE_DATA.TOTAL_RUNS}`,
  );
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
  console.log(`Median Time: ${medianTime.toFixed(2)} s`);
  console.log(`Min Time: ${minTime.toFixed(2)} s`);
  console.log(`Max Time: ${maxTime.toFixed(2)} s`);

  console.log("----------------------------");
  console.log("Error Summary");

  if (errorLogs.length === 0) {
    console.log("No Errors");
  } else {
    errorLogs.forEach((log) => {
      console.log(log);
    });
  }

  if (errorLogs.length > 0) {
    throw new Error(
      `Performance test failed: ${errorLogs.length}/${WEATHER_PERFORMANCE_DATA.TOTAL_RUNS} runs failed. Please check Error Summary above.`,
    );
  }
});
