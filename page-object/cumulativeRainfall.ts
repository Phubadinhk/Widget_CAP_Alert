import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class RainfallPerformancePage {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;

  async openBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
    });

    this.context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "th-TH",
    });

    this.page = await this.context.newPage();
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
      throw new Error("BROWSER_INITIALIZE_ERROR");
    }

    const context = await this.browser.newContext({
      ignoreHTTPSErrors: true,
      locale: "th-TH",
    });

    const page = await context.newPage();

    try {
      await page.goto(rootUrl, {
        waitUntil: "networkidle",
        timeout: rootTimeout,
      });

      await page.waitForTimeout(3000);

      const response = await page.goto(targetUrl, {
        waitUntil,
        timeout: targetTimeout,
      });

      const status = response?.status();

      if (status !== 200) {
        throw new Error(`Status: ${status}`);
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
            path: screenshotPath.replace(".png", "-failed.png"),
            fullPage: true,
          });
        } catch {
          // ignore screenshot error
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

  async captureScreenshot(path: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "PAGE_INITIALIZE_ERROR: ไม่สามารถ Capture Screenshot ได้ เพราะ Page ยังไม่ถูกสร้าง",
      );
    }

    await this.page.screenshot({
      path,
      fullPage: true,
    });
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}
