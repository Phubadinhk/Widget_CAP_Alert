import dotenv from 'dotenv';
dotenv.config();

import { test } from '@playwright/test';
import { FIVE_DAY_PERFORMANCE_DATA } from '../test-data/five-day.data';
import { FiveDayPerformancePage } from '../page-object/five-day';

test('Performance five-day Page', async () => {
  test.setTimeout(FIVE_DAY_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  const fullUrl =
    `${FIVE_DAY_PERFORMANCE_DATA.BASE_URL}` +
    `${FIVE_DAY_PERFORMANCE_DATA.PATH}/${token}`;

  console.log(`Performance Result Five-Day Page`); 

  for (let i = 1; i <= FIVE_DAY_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const fiveDayPage = new FiveDayPerformancePage();

    try {
      await fiveDayPage.openNewBrowser();

      const finishTimeSec =
        await fiveDayPage.gotoRootThenTargetAndGetNetworkFinishTime(
          FIVE_DAY_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          FIVE_DAY_PERFORMANCE_DATA.WAIT_UNTIL,
          FIVE_DAY_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await fiveDayPage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;

  console.log('----------------------------');
  console.log(`Success Runs: ${finishTimes.length}/${FIVE_DAY_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
});