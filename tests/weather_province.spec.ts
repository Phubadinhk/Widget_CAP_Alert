import dotenv from 'dotenv';
dotenv.config();

import { test } from '@playwright/test';
import { WEATHER_PERFORMANCE_DATA } from '../test-data/weather_province.data';
import { WeatherPerformancePage } from '../page-object/weather_province';

test('Performance weather_province Page', async () => {
  test.setTimeout(WEATHER_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  const token = process.env.KIOSK_TOKEN?.trim();

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  const fullUrl =
    `${WEATHER_PERFORMANCE_DATA.BASE_URL}` +
    `${WEATHER_PERFORMANCE_DATA.PATH}/${token}`;
  
  console.log(`Performance Result Weather Province Page`); 

  for (let i = 1; i <= WEATHER_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const weatherPage = new WeatherPerformancePage();

    try {
      await weatherPage.openNewBrowser();

      const finishTimeSec =
        await weatherPage.gotoRootThenTargetAndGetNetworkFinishTime(
          WEATHER_PERFORMANCE_DATA.ROOT_URL,
          fullUrl,
          WEATHER_PERFORMANCE_DATA.WAIT_UNTIL,
          WEATHER_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
        );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await weatherPage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;

  console.log('----------------------------');
  console.log(`Success Runs: ${finishTimes.length}/${WEATHER_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
});