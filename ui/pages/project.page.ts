import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { type FireflyProject } from '../ui.types';

/**
 * Page Object Model for the Adobe Firefly "Your stuff" page.
 *
 * URL: https://firefly.adobe.com/your-stuff
 *
 * This page shows the user's files, shared content, projects,
 * favorites, generation history, and deleted items.
 *
 * Anti-pattern compliance (Elaichenkov's 17 Playwright Mistakes):
 *   #2:  Web-first assertions only (toBeVisible) — NOT isVisible()
 *   #5:  No pre-waits before fill/click — they already auto-wait
 *   #11: { exact: true } on all getByRole / getByText locators
 *   #16: Action methods return void — test decides what comes next
 */
export class ProjectPage {
  /** Main files container */
  readonly filesContainer: Locator;

  /** "Create folder" button */
  readonly createFolderButton: Locator;

  /** Search field for filtering files */
  readonly searchField: Locator;

  /** Sort button for changing file order */
  readonly sortButton: Locator;

  /** View toggle (grid/list) */
  readonly viewToggle: Locator;

  /** Files grid container */
  readonly filesGrid: Locator;

  /** Left nav tab items */
  readonly navTabs: Locator;

  /** "Your files" nav link */
  readonly yourFilesLink: Locator;

  /** "Shared with you" nav link */
  readonly sharedWithYouLink: Locator;

  /** "Projects" nav link */
  readonly projectsLink: Locator;

  /** "Favorites" nav link */
  readonly favoritesLink: Locator;

  /** "Generation history" nav link */
  readonly generationHistoryLink: Locator;

  /** "Deleted" nav link */
  readonly deletedLink: Locator;

  /** Page heading showing the current section */
  readonly pageHeading: Locator;

  constructor(private page: Page) {
    // ── Priority 1: Role — accessibility tree, survives DOM refactors ───────
    // #11: { exact: true } on all getByRole locators
    this.createFolderButton = page.getByRole('button', { name: 'Create folder', exact: true });
    this.sortButton = page.getByRole('button', { name: 'Sort', exact: true });
    this.pageHeading = page.getByRole('heading').first();

    // ── Priority 4: Placeholder — inputs without a visible label ───────────
    // searchbox role targets <input type="search"> or role="searchbox" directly
    this.searchField = page.getByRole('searchbox');

    // ── Priority 5: TestId — FALLBACK for containers and shadow DOM nav ──────
    // filesContainer and filesGrid are layout wrappers with no accessible name
    this.filesContainer = page.getByTestId('your-files-files-container');
    this.viewToggle = page.getByTestId('cloud-documents-view-toggle');
    this.filesGrid = page.getByTestId('cloud-documents-grid');

    // Left nav tabs are inside Adobe Spectrum shadow DOM — nth() via testId
    // is the only reliable strategy here without accessible labels exposed
    this.navTabs = page.getByTestId('files-left-nav-tab');
    this.yourFilesLink = this.navTabs.nth(0);
    this.sharedWithYouLink = this.navTabs.nth(1);
    this.projectsLink = this.navTabs.nth(2);
    this.favoritesLink = this.navTabs.nth(3);
    this.generationHistoryLink = this.navTabs.nth(4);
    this.deletedLink = this.navTabs.nth(5);
  }

  /** Navigate to the "Your stuff" page */
  async navigateToYourStuff(): Promise<void> {
    Logger.info('Navigating to Your stuff page');
    await this.page.goto('/your-stuff');
    await expect(this.filesContainer).toBeVisible(); // #2: web-first
  }

  /** Navigate to the Projects section */
  async goToProjects(): Promise<void> {
    Logger.info('Navigating to Projects section');
    await this.projectsLink.click();
  }

  /** Navigate to Generation history */
  async goToGenerationHistory(): Promise<void> {
    Logger.info('Navigating to Generation history');
    await this.generationHistoryLink.click();
  }

  /** Navigate to Favorites */
  async goToFavorites(): Promise<void> {
    Logger.info('Navigating to Favorites');
    await this.favoritesLink.click();
  }

  /** Navigate to Deleted items */
  async goToDeleted(): Promise<void> {
    Logger.info('Navigating to Deleted');
    await this.deletedLink.click();
  }

  /**
   * Create a new folder.
   *
   * Anti-pattern #11: { exact: true } used on "Create" button.
   */
  async createFolder(name: string): Promise<void> {
    Logger.info(`Creating folder: ${name}`);
    await this.createFolderButton.click();
    // Folder creation dialog — fill name and confirm
    await this.page.getByRole('textbox').last().fill(name);
    // #11: exact: true prevents matching "Create folder" instead of "Create"
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
  }

  /**
   * Search for files by keyword.
   *
   * Anti-pattern #5: fill() already auto-waits — the redundant pre-click removed.
   */
  async searchFiles(keyword: string): Promise<void> {
    Logger.info(`Searching for: ${keyword}`);
    await this.searchField.fill(keyword); // #5: fill auto-waits — no pre-click needed
    await this.page.keyboard.press('Enter');
  }

  /**
   * Get the list of visible file/project items.
   *
   * Selector hierarchy: testId only — CSS class fallback (.cloud-doc-card) removed.
   */
  async getProjectList(): Promise<FireflyProject[]> {
    // testId selector only — no CSS class fallback
    const items = this.filesGrid.locator('[role="gridcell"]');
    const count = await items.count();
    const projects: FireflyProject[] = [];
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      projects.push({
        name: (await item.textContent()) ?? '',
        type: '',
        lastModified: '',
      });
    }
    return projects;
  }

  /** Get the current page heading text */
  async getPageHeading(): Promise<string> {
    return (await this.pageHeading.textContent()) ?? '';
  }

  /**
   * Assert whether the files grid is empty.
   *
   * Anti-pattern #2: expose as assertion not boolean — use toBeEmpty / count check
   * via expect in tests. This helper returns count for test-side assertions.
   */
  async getProjectCount(): Promise<number> {
    return this.filesGrid
      .locator('[role="gridcell"]') // testId-only — no CSS class fallback
      .count()
      .catch(() => 0);
  }
}
