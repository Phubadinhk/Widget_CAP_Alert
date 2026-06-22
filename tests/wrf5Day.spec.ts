import { test } from "@playwright/test";
import { FIVE_DAY_PERFORMANCE_DATA } from "../test-data/wrf5Day.data";
import { FiveDayPerformancePage } from "../page-object/wrf5Day";
import { ENV } from "../src/config/environment";
type PerformanceSuccessResult = {
  success: true;
  provinceId: number;
  finishTimeSec: number;
};

type PerformanceFailResult = {
  success: false;
  provinceId: number;
  message: string;
};

type PerformanceResult = PerformanceSuccessResult | PerformanceFailResult;

test("Performance wrf5Day Page - Concurrent", async () => {
  test.setTimeout(FIVE_DAY_PERFORMANCE_DATA.TEST_TIMEOUT);

  console.log("====================================");
  console.log(`Environment : ${ENV.TEST_ENV}`);
  console.log(`V3_URL      : ${ENV.V3_URL}`);
  console.log("====================================");

  const finishTimes: number[] = [];
  const errorLogs: string[] = [];

  const token = ENV.KIOSK_TOKEN.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  console.log("Performance Result wrf5Day Page");
  console.log(
    `1 Run = 1 Browser | เปิดพร้อมกัน ${FIVE_DAY_PERFORMANCE_DATA.PROVINCE_IDS.length} Contexts`,
  );

  for (let run = 1; run <= FIVE_DAY_PERFORMANCE_DATA.TOTAL_RUNS; run++) {
    console.log(`================ Run ${run} ================`);

    const fiveDayPage = new FiveDayPerformancePage();

    try {
      await fiveDayPage.openBrowser();

      const tasks: Promise<PerformanceResult>[] =
        FIVE_DAY_PERFORMANCE_DATA.PROVINCE_IDS.map(async (provinceId) => {
          try {
            const path = FIVE_DAY_PERFORMANCE_DATA.PATH_TEMPLATE.replace(
              "{provinceId}",
              String(provinceId),
            );

            const fullUrl = `${ENV.V3_URL}${path}/${token}`;

            const finishTimeSec =
              await fiveDayPage.gotoRootThenTargetAndGetNetworkFinishTimeByNewContext(
                ENV.V3_URL,
                fullUrl,
                FIVE_DAY_PERFORMANCE_DATA.WAIT_UNTIL,
                FIVE_DAY_PERFORMANCE_DATA.ROOT_URL_TIMEOUT,
                FIVE_DAY_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
                `reports/screenshots/wrf5Day/run-${run}-province-${provinceId}.png`,
              );

            return {
              success: true as const,
              provinceId,
              finishTimeSec,
            };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);

            return {
              success: false as const,
              provinceId,
              message,
            };
          }
        });

      const results = await Promise.all(tasks);

      results.forEach((result) => {
        if (result.success) {
          finishTimes.push(result.finishTimeSec);

          console.log(
            `Run ${run} | Province ${result.provinceId}: ${result.finishTimeSec.toFixed(2)} s`,
          );
        } else {
          let errorType = "UNKNOWN_ERROR";

          if (
            result.message.includes("net::ERR_NAME_NOT_RESOLVED") ||
            result.message.includes("net::ERR_INVALID_URL") ||
            result.message.includes("Invalid URL") ||
            result.message.includes("WEB_URL_ERROR")
          ) {
            errorType = "ลิงก์เว็บผิด หรือ Domain ไม่ถูกต้อง";
          } else if (result.message.includes("Test timeout")) {
            errorType = "เวลารวมของ Test หมด";
          } else if (result.message.includes("NORMAL_PAGE_LOAD_ERROR")) {
            errorType = "โหลดหน้าเว็บปกติไม่สำเร็จ ไม่ใช่ Performance";
          } else if (result.message.includes("PERFORMANCE_PAGE_LOAD_ERROR")) {
            errorType = "โหลดหน้าทดสอบไม่สำเร็จ";
          } else if (result.message.includes("BROWSER_INITIALIZE_ERROR")) {
            errorType = "สร้าง Browser ไม่สำเร็จ";
          }

          console.error(
            `Run ${run} | Province ${result.provinceId}: โหลดไม่สำเร็จ`,
          );
          console.error(`Error Type: ${errorType}`);
          console.error(`Error Detail: ${result.message}`);

          errorLogs.push(
            `Run ${run} | Province ${result.provinceId}: ${errorType} | ${result.message}`,
          );
        }
      });
    } finally {
      await fiveDayPage.close();
    }
  }

  const totalExpected =
    FIVE_DAY_PERFORMANCE_DATA.TOTAL_RUNS *
    FIVE_DAY_PERFORMANCE_DATA.PROVINCE_IDS.length;

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
  console.log(`Success Pages: ${finishTimes.length}/${totalExpected}`);
  console.log(`Failed Pages: ${errorLogs.length}/${totalExpected}`);
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
    errorLogs.forEach((log) => {
      console.log(log);
    });
  }

  if (errorLogs.length > 0) {
    throw new Error(
      `Performance test failed: ${errorLogs.length}/${totalExpected} pages failed.`,
    );
  }
});
