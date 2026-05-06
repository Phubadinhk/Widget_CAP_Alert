import { test } from '@playwright/test';
import { HOME_PERFORMANCE_DATA } from '../test-data/home.data';
import { HomePerformancePage } from '../page-object/home';

test('Performance Cold Start (Network Finish)', async () => {
  test.setTimeout(HOME_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN;

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  const fullUrl = `${HOME_PERFORMANCE_DATA.BASE_URL}${HOME_PERFORMANCE_DATA.PATH}/${token}`;

  for (let i = 1; i <= HOME_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const homePage = new HomePerformancePage();

    try {
      await homePage.openNewBrowserNoCache();

      const finishTimeSec = await homePage.gotoAndGetNetworkFinishTime(
        fullUrl,
        HOME_PERFORMANCE_DATA.WAIT_UNTIL,
        HOME_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
      );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${String(i).padStart(2, '0')}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${String(i).padStart(2, '0')}: โหลดไม่สำเร็จ`, error);
    } finally {
      await homePage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, t) => sum + t, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;
  const minTime = finishTimes.length ? Math.min(...finishTimes) : 0;
  const maxTime = finishTimes.length ? Math.max(...finishTimes) : 0;
  const stdDev = finishTimes.length
    ? Math.sqrt(finishTimes.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) / finishTimes.length)
    : 0;

  console.log('----------------');
  console.log(`Success Runs  : ${finishTimes.length}/${HOME_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time    : ${totalTime.toFixed(2)} s`);
  console.log(`Average Time  : ${averageTime.toFixed(2)} s`);
  console.log(`Min Time      : ${minTime.toFixed(2)} s`);
  console.log(`Max Time      : ${maxTime.toFixed(2)} s`);
  console.log(`Std Dev       : ${stdDev.toFixed(2)} s`);
  console.log('----------------');
});