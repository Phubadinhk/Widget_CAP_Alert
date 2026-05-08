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
    timeout: number,
  ): Promise<number> {
    if (!this.page) {
      throw new Error("Page is not initialized");
    }

    const rootResponse = await this.page.goto(rootUrl, {
      waitUntil: "networkidle",
      timeout,
    });

    const rootStatus = rootResponse?.status();

    if (rootStatus !== 200) {
      throw new Error(
        `Root page expected status 200 but received ${rootStatus}`,
      );
    }

    await this.page.waitForTimeout(3000);

    const response = await this.page.goto(targetUrl, {
      waitUntil,
      timeout,
    });

    const status = response?.status();

    if (status !== 200) {
      throw new Error(`Target page expected status 200 but received ${status}`);
    }

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
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}
