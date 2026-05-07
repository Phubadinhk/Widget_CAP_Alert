import dotenv from 'dotenv';
dotenv.config();

import { test } from '@playwright/test';
import { DANGER_PERFORMANCE_DATA } from '../test-data/danger.data';
import { DangerPerformancePage } from '../page-object/danger';

test('Performance danger Page', async () => {
  test.setTimeout(DANGER_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  const fullUrl =
    `${DANGER_PERFORMANCE_DATA.BASE_URL}` +
    `${DANGER_PERFORMANCE_DATA.PATH}/${token}`;

  console.log(`Performance Result Danger Page`); 

  for (let i = 1; i <= DANGER_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const dangerPage = new DangerPerformancePage();

    try {
      await dangerPage.openNewBrowser();

      const finishTimeSec =
        await dangerPage.gotoRootThenTargetAndGetNetworkFinishTime(
          DANGER_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          DANGER_PERFORMANCE_DATA.WAIT_UNTIL,
          DANGER_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await dangerPage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;

  console.log('----------------------------');
  console.log(`Success Runs: ${finishTimes.length}/${DANGER_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
});