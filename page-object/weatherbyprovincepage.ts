import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class WeatherPerformancePage {
  private browser?: Browser;

  async openBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });
  }

  async gotoRootThenTargetAndGetNetworkFinishTimeByNewContext(
    rootUrl: string,
    targetUrl: string,
    waitUntil: "load" | "domcontentloaded" | "networkidle",
    rootTimeout: number,
    targetTimeout: number,
    screenshotPath?: string,
  ): Promise<number> {
    if (!this.browser) {
      throw new Error("BROWSER_INITIALIZE_ERROR: ยังไม่ได้สร้าง Browser");
    }

    const context: BrowserContext = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "th-TH",
    });

    await context.route("**/*", async (route) => {
      const headers = {
        ...route.request().headers(),
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      };

      await route.continue({ headers });
    });

    const page: Page = await context.newPage();

    try {
      const rootResponse = await page.goto(rootUrl, {
        waitUntil: "networkidle",
        timeout: rootTimeout,
      });

      const rootStatus = rootResponse?.status();

      if (rootStatus !== 200) {
        throw new Error(`Root Status: ${rootStatus}`);
      }

      await page.waitForTimeout(3000);

      const response = await page.goto(targetUrl, {
        waitUntil,
        timeout: targetTimeout,
      });

      const status = response?.status();

      if (status !== 200) {
        throw new Error(`Target Status: ${status}`);
      }

      const finishTimeMs = await page.evaluate(() => {
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

      if (screenshotPath) {
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
      }

      return finishTimeMs / 1000;
    } catch (error) {
      if (screenshotPath) {
        try {
          await page.screenshot({
            path: screenshotPath.replace(".png", "-FAIL.png"),
            fullPage: true,
            timeout: 10000,
          });
        } catch (screenshotError) {
          console.error("Capture fail screenshot error:", screenshotError);
        }
      }

      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `PERFORMANCE_PAGE_LOAD_ERROR: Error ที่หน้าทดสอบ Performance | URL: ${targetUrl} | ${message}`,
      );
    } finally {
      await page.close();
      await context.close();
    }
  }

  async close(): Promise<void> {
    await this.browser?.close();
  }
}
