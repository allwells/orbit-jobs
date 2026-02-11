import { chromium, type Page, type Browser } from "playwright";
import { getRandomUserAgent } from "./user-agents";
import { Client } from "pg";

/** Shape of a scraped job before DB insertion */
export interface ScrapedJob {
  linkedin_job_id: string;
  title: string;
  company: string;
  salary: string | null;
  url: string;
  location: string | null;
  work_mode: string | null;
}

// ── Helpers ──────────────────────────────────────────

/** Random delay between min and max milliseconds */
function jitter(minMs: number, maxMs: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build LinkedIn job search URL from keywords */
function buildSearchUrl(keywords: string[]): string {
  const query = keywords.join(" OR ");
  return `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}&position=1&pageNum=0`;
}

/** Extract LinkedIn job ID from a job URL */
function extractJobId(url: string): string | null {
  // URLs look like: https://www.linkedin.com/jobs/view/title-at-company-1234567890
  const match = url.match(/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
}

/** Detect work mode from metadata text */
function detectWorkMode(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("remote")) return "remote";
  if (lower.includes("hybrid")) return "hybrid";
  if (lower.includes("on-site") || lower.includes("onsite")) return "on-site";
  return null;
}

// ── Stealth browser setup ────────────────────────────

async function launchStealthBrowser(): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  return browser;
}

async function createStealthPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport: {
      width: 1280 + Math.floor(Math.random() * 200),
      height: 800 + Math.floor(Math.random() * 200),
    },
    locale: "en-US",
    timezoneId: "America/New_York",
  });

  const page = await context.newPage();

  // Remove webdriver flag
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
    // Override permissions API
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = function (
      parameters: PermissionDescriptor,
    ) {
      if (parameters.name === "notifications") {
        return Promise.resolve({
          state: "denied",
          name: parameters.name,
        } as PermissionStatus);
      }
      return originalQuery.call(this, parameters);
    };
  });

  return page;
}

/** Human-like scrolling */
async function humanScroll(page: Page): Promise<void> {
  const scrollDistance = 300 + Math.floor(Math.random() * 500);
  await page.evaluate((dist) => {
    window.scrollBy({ top: dist, behavior: "smooth" });
  }, scrollDistance);
  await jitter(800, 2000);
}

// ── Core scraping logic ──────────────────────────────

async function scrapeJobCards(
  page: Page,
  limit: number,
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  // Wait for job list to appear
  await page.waitForSelector("ul.jobs-search__results-list", {
    timeout: 15000,
  });

  // Scroll to load enough cards
  let scrollAttempts = 0;
  const maxScrolls = Math.max(3, Math.ceil(limit / 10)); // Heuristic: approx 10 jobs per scroll

  while (scrollAttempts < maxScrolls) {
    const cardCount = await page
      .locator("ul.jobs-search__results-list > li")
      .count();
    if (cardCount >= limit) break;

    await humanScroll(page);
    scrollAttempts++;
  }

  await jitter(1000, 2000);

  // Extract job cards
  const cards = await page.$$("ul.jobs-search__results-list > li");

  for (const card of cards) {
    try {
      const titleEl = await card.$("h3.base-search-card__title");
      const companyEl = await card.$("h4.base-search-card__subtitle");
      const locationEl = await card.$("span.job-search-card__location");
      const linkEl = await card.$("a.base-card__full-link");

      const title = titleEl
        ? ((await titleEl.textContent())?.trim() ?? "")
        : "";
      const company = companyEl
        ? ((await companyEl.textContent())?.trim() ?? "")
        : "";
      const location = locationEl
        ? ((await locationEl.textContent())?.trim() ?? null)
        : null;
      const url = linkEl
        ? ((await linkEl.getAttribute("href"))?.split("?")[0] ?? "")
        : "";

      if (!title || !url) continue;

      const linkedinJobId = extractJobId(url);
      if (!linkedinJobId) continue;

      // Try to detect work mode from the card's full text
      const cardText = (await card.textContent()) ?? "";
      const workMode = detectWorkMode(cardText);

      // Salary is sometimes shown in a badge/metadata span
      const salaryEl = await card.$("span.job-search-card__salary-info");
      const salary = salaryEl
        ? ((await salaryEl.textContent())?.trim() ?? null)
        : null;

      jobs.push({
        linkedin_job_id: linkedinJobId,
        title,
        company,
        salary,
        url,
        location,
        work_mode: workMode,
      });
    } catch {
      // Skip malformed cards
      continue;
    }
  }

  return jobs.slice(0, limit);
}

// ── Public API ───────────────────────────────────────

export interface ScrapeResult {
  success: boolean;
  jobsFound: number;
  jobsInserted: number;
  error?: string;
}

export async function runScraper(
  keywords: string[],
  databaseUrl: string,
  limit: number = 20,
): Promise<ScrapeResult> {
  let browser: Browser | null = null;
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    browser = await launchStealthBrowser();
    const page = await createStealthPage(browser);

    // Navigate to LinkedIn search
    const searchUrl = buildSearchUrl(keywords);
    console.log(`🔍 Scraping: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await jitter(2000, 4000);

    // Scrape job cards
    const jobs = await scrapeJobCards(page, limit);
    console.log(`📋 Found ${jobs.length} job cards`);

    // Insert into database (deduplicate by linkedin_job_id)
    let inserted = 0;
    for (const job of jobs) {
      try {
        const result = await client.query(
          `INSERT INTO job (id, linkedin_job_id, title, company, salary, url, location, work_mode)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (linkedin_job_id) DO NOTHING
           RETURNING id`,
          [
            crypto.randomUUID(),
            job.linkedin_job_id,
            job.title,
            job.company,
            job.salary,
            job.url,
            job.location,
            job.work_mode,
          ],
        );
        if (result.rows.length > 0) inserted++;
      } catch {
        // Skip duplicate / error
      }
    }

    // Log the scrape run
    await client.query(
      `INSERT INTO log (id, type, message, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        crypto.randomUUID(),
        "scrape",
        `Scraped ${jobs.length} jobs, inserted ${inserted} new`,
        JSON.stringify({
          keywords,
          jobsFound: jobs.length,
          jobsInserted: inserted,
        }),
        new Date().toISOString(),
      ],
    );

    console.log(`✅ Inserted ${inserted} new jobs`);
    return { success: true, jobsFound: jobs.length, jobsInserted: inserted };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Scraper error: ${errorMessage}`);

    // Log the error
    try {
      await client.query(
        `INSERT INTO log (id, type, message, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          crypto.randomUUID(),
          "error",
          `Scraper failed: ${errorMessage}`,
          JSON.stringify({ keywords, error: errorMessage }),
          new Date().toISOString(),
        ],
      );
    } catch {
      // Can't log — DB might be the issue
    }

    return {
      success: false,
      jobsFound: 0,
      jobsInserted: 0,
      error: errorMessage,
    };
  } finally {
    if (browser) await browser.close();
    await client.end();
  }
}

/** Scrape full description from a job URL */
export async function scrapeJobDescription(
  url: string,
): Promise<string | null> {
  let browser: Browser | null = null;
  try {
    browser = await launchStealthBrowser();
    const page = await createStealthPage(browser);

    console.log(`📄 Scraping description: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await jitter(2000, 4000);

    // Try multiple selectors common for LinkedIn job pages
    const selectors = [
      "div.description__text",
      "div.show-more-less-html__markup",
      "article.jobs-description__container",
      "div.jobs-description-content__text",
    ];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.length > 100) {
            return text.trim();
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to scrape description:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
