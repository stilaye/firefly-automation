import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Custom Playwright reporter that sends test results to Slack via webhook.
 *
 * Reporting Layer: Slack alerts — posts a summary to a Slack channel
 * after each test run with pass/fail counts, duration, and failed test details.
 *
 * Usage in playwright.config.ts:
 *   reporter: [['./utils/slack.reporter.ts', { webhookUrl: process.env.SLACK_WEBHOOK_URL }]]
 *
 * Environment variable:
 *   SLACK_WEBHOOK_URL — Slack incoming webhook URL
 */

interface SlackReporterOptions {
  /** Slack incoming webhook URL */
  webhookUrl?: string;
  /** Channel override (optional — webhook default channel is used if omitted) */
  channel?: string;
  /** Only send on failure (default: false — always send) */
  onlyOnFailure?: boolean;
  /** Include failed test details in the message (default: true) */
  includeFailedDetails?: boolean;
  /** Max number of failed tests to list (default: 10) */
  maxFailedTests?: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  failedTests: { title: string; file: string; error: string }[];
}

/**
 * Custom Playwright reporter that sends test results to Slack via webhook.
 */
class SlackReporter implements Reporter {
  private options: Required<SlackReporterOptions>;
  private summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    duration: 0,
    failedTests: [],
  };
  private startTime = 0;

  /**
   * Initializes the SlackReporter with optional configuration.
   * @param options - partial SlackReporterOptions to override defaults.
   */
  constructor(options: SlackReporterOptions = {}) {
    this.options = {
      webhookUrl: options.webhookUrl || process.env.SLACK_WEBHOOK_URL || '',
      channel: options.channel || '',
      onlyOnFailure: options.onlyOnFailure ?? false,
      includeFailedDetails: options.includeFailedDetails ?? true,
      maxFailedTests: options.maxFailedTests ?? 10,
    };
  }

  /**
   * Called once before any tests run.
   * @param _config - Resolved Playwright configuration.
   * @param suite - The root suite that contains all tests.
   */
  onBegin(_config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.summary.total = suite.allTests().length;
  }

  /**
   * Called after each test finishes.
   * @param test - The test case that finished.
   * @param result - The result of the test execution.
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    switch (result.status) {
      case 'passed':
        this.summary.passed++;
        break;
      case 'failed':
      case 'timedOut':
        this.summary.failed++;
        if (this.summary.failedTests.length < this.options.maxFailedTests) {
          this.summary.failedTests.push({
            title: test.title,
            file: test.location.file.split('/').pop() || test.location.file,
            error: result.errors?.[0]?.message?.substring(0, 200) || 'Unknown error',
          });
        }
        break;
      case 'skipped':
        this.summary.skipped++;
        break;
      case 'interrupted':
        this.summary.skipped++;
        break;
    }

    // Detect flaky tests (passed on retry)
    if (result.status === 'passed' && result.retry > 0) {
      this.summary.flaky++;
    }
  }

  /**
   * Called after all tests have finished.
   * @param result - The full result of the test run.
   */
  async onEnd(result: FullResult): Promise<void> {
    this.summary.duration = Date.now() - this.startTime;

    if (!this.options.webhookUrl) {
      // eslint-disable-next-line no-console
      console.log('[SlackReporter] No SLACK_WEBHOOK_URL configured — skipping notification');
      return;
    }

    if (this.options.onlyOnFailure && result.status === 'passed') {
      // eslint-disable-next-line no-console
      console.log('[SlackReporter] All tests passed — skipping notification (onlyOnFailure=true)');
      return;
    }

    const message = this.buildMessage(result);
    await this.sendToSlack(message);
  }

  /**
   * Constructs the Slack message payload from the test summary.
   * @param result - The full test result.
   * @returns The Slack message block payload.
   */
  private buildMessage(result: FullResult): object {
    const { total, passed, failed, skipped, flaky, duration, failedTests } = this.summary;
    const durationStr = this.formatDuration(duration);
    const statusEmoji = result.status === 'passed' ? ':white_check_mark:' : ':x:';
    const statusText = result.status === 'passed' ? 'PASSED' : 'FAILED';

    const blocks: object[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Firefly Test Run — ${statusText}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total:*\n${total}` },
          { type: 'mrkdwn', text: `*Duration:*\n${durationStr}` },
          { type: 'mrkdwn', text: `*Passed:*\n:white_check_mark: ${passed}` },
          { type: 'mrkdwn', text: `*Failed:*\n:x: ${failed}` },
          { type: 'mrkdwn', text: `*Skipped:*\n:fast_forward: ${skipped}` },
          { type: 'mrkdwn', text: `*Flaky:*\n:warning: ${flaky}` },
        ],
      },
    ];

    // Add failed test details
    if (this.options.includeFailedDetails && failedTests.length > 0) {
      const failedList = failedTests
        .map((t) => `• \`${t.file}\` — ${t.title}\n  _${t.error}_`)
        .join('\n');

      blocks.push(
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Failed Tests (${failed}):*\n${failedList}`,
          },
        },
      );

      if (failed > this.options.maxFailedTests) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_...and ${failed - this.options.maxFailedTests} more failed tests_`,
            },
          ],
        });
      }
    }

    // Add environment context
    blocks.push(
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Environment:* ${process.env.BASE_URL || 'unknown'} | *CI:* ${process.env.CI ? 'Yes' : 'Local'} | *Branch:* ${process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || 'unknown'}`,
          },
        ],
      },
    );

    const payload: Record<string, unknown> = { blocks };
    if (this.options.channel) {
      payload.channel = this.options.channel;
    }

    return payload;
  }

  /**
   * Sends the constructed payload to the configured Slack webhook.
   * @param payload - The JSON payload to send.
   */
  private async sendToSlack(payload: object): Promise<void> {
    try {
      const parsedUrl = new URL(this.options.webhookUrl);
      const data = JSON.stringify(payload);
      const transport = parsedUrl.protocol === 'https:' ? https : http;

      return new Promise((resolve, reject) => {
        const req = transport.request(
          {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
            },
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              // eslint-disable-next-line no-console
              console.log('[SlackReporter] Notification sent successfully');
              resolve();
            } else {
              // eslint-disable-next-line no-console
              console.error(`[SlackReporter] Failed to send: HTTP ${res.statusCode}`);
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
        );

        req.on('error', (err) => {
          // eslint-disable-next-line no-console
          console.error(`[SlackReporter] Request error: ${err.message}`);
          reject(err);
        });

        req.write(data);
        req.end();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[SlackReporter] Error: ${err}`);
    }
  }

  /**
   * Formats a duration in milliseconds into a human-readable string (m s or s).
   * @param ms - Duration in milliseconds.
   * @returns Formatted duration string.
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }
}

export default SlackReporter;
