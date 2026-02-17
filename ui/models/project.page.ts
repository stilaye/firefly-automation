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
    this.filesContainer = page.locator('[data-testid="your-files-files-container"]');
    this.createFolderButton = page.locator('[data-testid="cloud-documents-create-folder-button"]');
    this.searchField = page.locator('[data-testid="cloud-documents-search-field"]');
    this.sortButton = page.locator('[data-testid="cloud-documents-sort-button"]');
    this.viewToggle = page.locator('[data-testid="cloud-documents-view-toggle"]');
    this.filesGrid = page.locator('[data-testid="cloud-documents-grid"]');
    this.navTabs = page.locator('[data-testid="files-left-nav-tab"]');

    // Left nav links — using nth-child since labels are inside shadow DOM
    this.yourFilesLink = this.navTabs.nth(0);
    this.sharedWithYouLink = this.navTabs.nth(1);
    this.projectsLink = this.navTabs.nth(2);
    this.favoritesLink = this.navTabs.nth(3);
    this.generationHistoryLink = this.navTabs.nth(4);
    this.deletedLink = this.navTabs.nth(5);

    this.pageHeading = page.getByRole('heading').first();
  }

  /** Navigate to the "Your stuff" page */
  async navigateToYourStuff(): Promise<void> {
    Logger.info('Navigating to Your stuff page');
    await this.page.goto('/your-stuff');
    await expect(this.filesContainer).toBeVisible();
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

  /** Create a new folder */
  async createFolder(name: string): Promise<void> {
    Logger.info(`Creating folder: ${name}`);
    await this.createFolderButton.click();
    // Folder creation dialog — type the name and confirm
    await this.page.getByRole('textbox').last().fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  /** Search for files by keyword */
  async searchFiles(keyword: string): Promise<void> {
    Logger.info(`Searching for: ${keyword}`);
    await this.searchField.click();
    await this.searchField.fill(keyword);
    await this.page.keyboard.press('Enter');
  }

  /** Get the list of visible file/project items */
  async getProjectList(): Promise<FireflyProject[]> {
    const items = this.filesGrid.locator('[role="gridcell"], .cloud-doc-card');
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

  /** Check if the files grid is empty */
  async isEmpty(): Promise<boolean> {
    const count = await this.filesGrid
      .locator('[role="gridcell"], .cloud-doc-card')
      .count()
      .catch(() => 0);
    return count === 0;
  }
}
