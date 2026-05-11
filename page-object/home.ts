import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class HomePerformancePage {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  async openNewBrowserNoCache(): Promise<void> {
    this.browser = await chromium.launch();

    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
    });

    await this.context.route("**/*", async (route) => {
      const headers = {
        ...route.request().headers(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      await route.continue({ headers });
    });

    this.page = await this.context.newPage();
  }

  async gotoAndGetNetworkFinishTime(
    url: string,
    waitUntil: "load" | "domcontentloaded" | "networkidle",
    timeout: number,
  ): Promise<number> {
    if (!this.page) {
      throw new Error("PAGE_INITIALIZE_ERROR: เกิด Error ตอนสร้าง Page");
    }

    try {
      const response = await this.page.goto(url, {
        waitUntil,
        timeout,
      });

      const status = response?.status();

      if (status !== 200) {
        throw new Error(`Status: ${status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `PERFORMANCE_PAGE_LOAD_ERROR: Error ที่หน้าทดสอบ Performance | URL: ${url} | ${message}`,
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