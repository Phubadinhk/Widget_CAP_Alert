import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class RainfallPerformancePage {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  async openNewBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });

    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "th-TH",
    });

    this.page = await this.context.newPage();
  }

  async gotoRootThenTargetAndGetNetworkFinishTime(
    rootUrl: string,
    targetUrl: string,
    waitUntil: "load" | "domcontentloaded" | "networkidle",
    rootTimeout: number,
    targetTimeout: number,
  ): Promise<number> {
    if (!this.page) {
      throw new Error("PAGE_INITIALIZE_ERROR: เกิด Error ตอนสร้าง Page");
    }

    try {
      const rootResponse = await this.page.goto(rootUrl, {
        waitUntil: "networkidle",
        timeout: rootTimeout,
      });

      const rootStatus = rootResponse?.status();

      if (rootStatus !== 200) {
        throw new Error(`Status: ${rootStatus}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `NORMAL_PAGE_LOAD_ERROR: Error ที่การโหลดหน้าเว็บปกติ ไม่ใช่ Performance ของหน้าที่ทดสอบ | URL: ${rootUrl} | ${message}`,
      );
    }

    await this.page.waitForTimeout(3000);

    try {
      const response = await this.page.goto(targetUrl, {
        waitUntil,
        timeout: targetTimeout,
      });

      const status = response?.status();

      if (status !== 200) {
        throw new Error(`Status: ${status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `PERFORMANCE_PAGE_LOAD_ERROR: Error ที่หน้าทดสอบ Performance | URL: ${targetUrl} | ${message}`,
      );
    }

    try {
      const finishTimeMs = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];

        const navigations = performance.getEntriesByType(
          "navigation",
        ) as PerformanceNavigationTiming[];

        const resourceEndTimes = resources.map((r) => r.responseEnd || 0);
        const navEnd = navigations[0]?.responseEnd || 0;

        return Math.max(navEnd, ...resourceEndTimes);
      });

      return finishTimeMs / 1000;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `PERFORMANCE_MEASURE_ERROR: Error ตอนวัดเวลา Performance | ${message}`,
      );
    }
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}