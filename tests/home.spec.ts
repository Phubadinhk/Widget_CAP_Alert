import { test } from "@playwright/test";
import { HOME_PERFORMANCE_DATA } from "../test-data/home.data";
import { HomePerformancePage } from "../page-object/home";

type PerformanceSuccessResult = {
  success: true;
  provinceId: number;
  stationId: number;
  finishTimeSec: number;
};

type PerformanceFailResult = {
  success: false;
  provinceId: number;
  stationId: number;
  message: string;
};

type PerformanceResult = PerformanceSuccessResult | PerformanceFailResult;

test("Performance Main Page - 20 contexts concurrent", async () => {
  test.setTimeout(HOME_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];
  const errorLogs: string[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing KIOSK_TOKEN in .env");
  }

  if (
    HOME_PERFORMANCE_DATA.PROVINCE_IDS.length !==
    HOME_PERFORMANCE_DATA.STATION_IDS.length
  ) {
    throw new Error(
      "PROVINCE_IDS และ STATION_IDS ต้องมีจำนวนเท่ากัน",
    );
  }

  console.log("Performance Result Main Page");
  console.log(
    `1 Run = 1 Browser | เปิดพร้อมกัน ${HOME_PERFORMANCE_DATA.PROVINCE_IDS.length} Contexts`,
  );

  for (let run = 1; run <= HOME_PERFORMANCE_DATA.TOTAL_RUNS; run++) {
    console.log(`================ Run ${run} ================`);

    const homePage = new HomePerformancePage();

    try {
      await homePage.openBrowser();

      const tasks: Promise<PerformanceResult>[] =
        HOME_PERFORMANCE_DATA.PROVINCE_IDS.map(
          async (provinceId, index) => {
            const stationId =
              HOME_PERFORMANCE_DATA.STATION_IDS[index];

            try {
              const path = HOME_PERFORMANCE_DATA.PATH_TEMPLATE
                .replace("{provinceId}", String(provinceId))
                .replace("{stationId}", String(stationId));

              const fullUrl =
                `${HOME_PERFORMANCE_DATA.BASE_URL}` +
                `${path}/${token}`;

              const finishTimeSec =
                await homePage.gotoAndGetNetworkFinishTimeByNewContext(
                  fullUrl,
                  HOME_PERFORMANCE_DATA.WAIT_UNTIL,
                  HOME_PERFORMANCE_DATA.NAVIGATION_TIMEOUT,
                  `reports/screenshots/MainPage/run-${run}-province-${provinceId}-station-${stationId}.png`,
                );

              return {
                success: true as const,
                provinceId,
                stationId,
                finishTimeSec,
              };
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);

              return {
                success: false as const,
                provinceId,
                stationId,
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
            `Run ${run} | Province ${result.provinceId} | Station ${result.stationId}: ${result.finishTimeSec.toFixed(2)} s`,
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
          } else if (result.message.includes("PERFORMANCE_PAGE_LOAD_ERROR")) {
            errorType = "โหลดหน้าทดสอบไม่สำเร็จ";
          } else if (result.message.includes("BROWSER_INITIALIZE_ERROR")) {
            errorType = "สร้าง Browser ไม่สำเร็จ";
          }

          console.error(
            `Run ${run} | Province ${result.provinceId} | Station ${result.stationId}: โหลดไม่สำเร็จ`,
          );
          console.error(`Error Type: ${errorType}`);
          console.error(`Error Detail: ${result.message}`);

          errorLogs.push(
            `Run ${run} | Province ${result.provinceId} | Station ${result.stationId}: ${errorType} | ${result.message}`,
          );
        }
      });
    } finally {
      await homePage.close();
    }
  }

  const totalExpected =
    HOME_PERFORMANCE_DATA.TOTAL_RUNS *
    HOME_PERFORMANCE_DATA.PROVINCE_IDS.length;

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