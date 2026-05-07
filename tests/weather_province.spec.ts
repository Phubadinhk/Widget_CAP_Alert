import { test } from '@playwright/test';
import { HOME_PERFORMANCE_DATA } from '../test-data/weather_province.data';
import { HomePerformancePage } from '../page-object/weather_province';

test('Performance weather_province Page', async () => {
  test.setTimeout(HOME_PERFORMANCE_DATA.TEST_TIMEOUT);

  const finishTimes: number[] = [];

  // ดึง token จาก .env
  const token = process.env.KIOSK_TOKEN;

  if (!token) {
    throw new Error('Missing KIOSK_TOKEN in .env');
  }

  // ประกอบ URL จริง
  const fullUrl = `${HOME_PERFORMANCE_DATA.BASE_URL}${HOME_PERFORMANCE_DATA.PATH}/${token}`;

  for (let i = 1; i <= HOME_PERFORMANCE_DATA.TOTAL_RUNS; i++) {
    const homePage = new HomePerformancePage();

    try {
      await homePage.openNewBrowserNoCache();

      const finishTimeSec = await homePage.gotoAndGetNetworkFinishTime(
        fullUrl, //  ใช้ตัวนี้แทน URL เดิม
        HOME_PERFORMANCE_DATA.WAIT_UNTIL,
        HOME_PERFORMANCE_DATA.NAVIGATION_TIMEOUT
      );

      finishTimes.push(finishTimeSec);

      console.log(`Run ที่ ${i}: ${finishTimeSec.toFixed(2)} s`);
    } catch (error) {
      console.error(`Run ที่ ${i}: โหลดไม่สำเร็จ`, error);
    } finally {
      await homePage.close();
    }
  }

  const totalTime = finishTimes.reduce((sum, time) => sum + time, 0);
  const averageTime = finishTimes.length ? totalTime / finishTimes.length : 0;

  console.log('----------------------------');
  console.log(`Success Runs: ${finishTimes.length}/${HOME_PERFORMANCE_DATA.TOTAL_RUNS}`);
  console.log(`Total Time: ${totalTime.toFixed(2)} s`);
  console.log(`Average Time: ${averageTime.toFixed(2)} s`);
});