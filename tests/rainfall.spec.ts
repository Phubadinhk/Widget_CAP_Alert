import dotenv from 'dotenv';
dotenv.config();

import { test } from '@playwright/test';
import { RAINFALL_PERFORMANCE_DATA } from '../test-data/rainfall.data';
import { RainfallPerformancePage } from '../page-object/rainfall';

test('Performance rainfall Page', async () => {
  test.setTimeout(RAINFALL_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  const fullUrl =
    `${RAINFALL_PERFORMANCE_DATA.BASE_URL}` +
    `${RAINFALL_PERFORMANCE_DATA.PATH}/${token}`;

  console.log(`Performance Result Rainfall Page`); 

  for (let i = 1; i <= RAINFALL_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const rainfallPage = new RainfallPerformancePage();

    try {
      await rainfallPage.openNewBrowser();

      const finishTimeSec =
        await rainfallPage.gotoRootThenTargetAndGetNetworkFinishTime(
          RAINFALL_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          RAINFALL_PERFORMANCE_DATA.WAIT_UNTIL,
          RAINFALL_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await rainfallPage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;

  console.log('----------------------------');
  console.log(`Success Runs: ${finishTimes.length}/${RAINFALL_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
});