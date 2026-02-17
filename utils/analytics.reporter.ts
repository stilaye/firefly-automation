import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom Playwright reporter that tracks test analytics over time.
 *
 * Reporting Layer: Test analytics — records test results to a JSON file
 * for trend analysis, flakiness detection, and performance regression tracking.
 *
 * Data is appended to `test-results/analytics.json` after each run.
 *
 * Usage in playwright.config.ts:
 *   reporter: [['./utils/analytics.reporter.ts', { outputDir: './test-results' }]]
 */

interface AnalyticsReporterOptions {
  /** Output directory for analytics data (default: './test-results') */
  outputDir?: string;
  /** Max number of historical runs to keep (default: 100) */
  maxRuns?: number;
}

interface TestRunRecord {
  /** ISO timestamp of the run */
  timestamp: string;
  /** Total duration in ms */
  duration: number;
  /** Overall result status */
  status: string;
  /** Environment URL */
  environment: string;
  /** CI or local */
  isCI: boolean;
  /** Git branch */
  branch: string;
  /** Test count summary */
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  };
  /** Individual test results */
  tests: TestRecord[];
}

interface TestRecord {
  /** Full test title (describe > test) */
  title: string;
  /** Test file path */
  file: string;
  /** Browser project name */
  project: string;
  /** Test status */
  status: string;
  /** Duration in ms */
  duration: number;
  /** Number of retries needed */
  retries: number;
  /** Whether the test is flaky (passed on retry) */
  flaky: boolean;
}

interface AnalyticsData {
  /** Runs history */
  runs: TestRunRecord[];
  /** Flaky test tracker — map of test title to flaky count */
  flakyTests: Record<string, number>;
  /** Slow test tracker — map of test title to average duration */
  slowTests: Record<string, number>;
}

/**
 * Custom Playwright reporter that tracks test analytics over time.
 */
class AnalyticsReporter implements Reporter {
  private options: Required<AnalyticsReporterOptions>;
  private startTime = 0;
  private tests: TestRecord[] = [];
  private summary = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

  /**
   * Initializes the AnalyticsReporter.
   * @param options - partial AnalyticsReporterOptions.
   */
  constructor(options: AnalyticsReporterOptions = {}) {
    this.options = {
      outputDir: options.outputDir || './test-results',
      maxRuns: options.maxRuns ?? 100,
    };
  }

  /**
   * Called once before any tests run.
   * @param _config - Resolved Playwright configuration.
   * @param suite - The root suite.
   */
  onBegin(_config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.summary.total = suite.allTests().length;
  }

  /**
   * Called after each test finishes.
   * @param test - The test case.
   * @param result - The result.
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    const isFlaky = result.status === 'passed' && result.retry > 0;

    this.tests.push({
      title: test.titlePath().join(' > '),
      file: test.location.file.split('/').pop() || test.location.file,
      project: test.parent?.project()?.name || 'unknown',
      status: result.status,
      duration: result.duration,
      retries: result.retry,
      flaky: isFlaky,
    });

    switch (result.status) {
      case 'passed':
        this.summary.passed++;
        break;
      case 'failed':
      case 'timedOut':
        this.summary.failed++;
        break;
      case 'skipped':
      case 'interrupted':
        this.summary.skipped++;
        break;
    }

    if (isFlaky) this.summary.flaky++;
  }

  /**
   * Called after all tests have finished.
   * @param result - The full result.
   */
  async onEnd(result: FullResult): Promise<void> {
    const duration = Date.now() - this.startTime;

    const run: TestRunRecord = {
      timestamp: new Date().toISOString(),
      duration,
      status: result.status,
      environment: process.env.BASE_URL || 'unknown',
      isCI: !!process.env.CI,
      branch: process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || 'unknown',
      summary: this.summary,
      tests: this.tests,
    };

    this.saveAnalytics(run);
  }

  /**
   * Saves the analytics data to a JSON file.
   * @param run - The current test run record.
   */
  private saveAnalytics(run: TestRunRecord): void {
    try {
      const outputDir = this.options.outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filePath = path.join(outputDir, 'analytics.json');
      let data: AnalyticsData = { runs: [], flakyTests: {}, slowTests: {} };

      // Load existing data
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(raw);
      }

      // Append the new run
      data.runs.push(run);

      // Trim to max runs
      if (data.runs.length > this.options.maxRuns) {
        data.runs = data.runs.slice(-this.options.maxRuns);
      }

      // Update flaky test tracker
      for (const test of run.tests) {
        if (test.flaky) {
          data.flakyTests[test.title] = (data.flakyTests[test.title] || 0) + 1;
        }
      }

      // Update slow test tracker (rolling average)
      for (const test of run.tests) {
        if (test.status === 'passed') {
          const existing = data.slowTests[test.title];
          if (existing) {
            data.slowTests[test.title] = Math.round((existing + test.duration) / 2);
          } else {
            data.slowTests[test.title] = test.duration;
          }
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      // eslint-disable-next-line no-console
      console.log(`[AnalyticsReporter] Results saved to ${filePath}`);
      this.printSummary(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[AnalyticsReporter] Failed to save analytics: ${err}`);
    }
  }

  /**
   * Prints a summary of flaky and slow tests to the console.
   * @param data - The accumulated analytics data.
   */
  private printSummary(data: AnalyticsData): void {
    // Print flaky tests (sorted by frequency)
    const flakyEntries = Object.entries(data.flakyTests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (flakyEntries.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\n[AnalyticsReporter] Top flaky tests:');
      for (const [title, count] of flakyEntries) {
        // eslint-disable-next-line no-console
        console.log(`  ${count}x flaky — ${title}`);
      }
    }

    // Print slowest tests (from current run)
    const slowest = [...this.tests]
      .filter((t) => t.status === 'passed')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (slowest.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\n[AnalyticsReporter] Slowest tests (this run):');
      for (const t of slowest) {
        // eslint-disable-next-line no-console
        console.log(`  ${(t.duration / 1000).toFixed(1)}s — ${t.title}`);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`\n[AnalyticsReporter] Total runs tracked: ${data.runs.length}`);
  }
}

export default AnalyticsReporter;
