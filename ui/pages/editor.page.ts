import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';
import { Logger } from '../../utils/logger';
import { type EditorState } from '../ui.types';

/**
 * Page Object Model for the Adobe Firefly "Edit" page.
 *
 * URL: https://firefly.adobe.com/generate/image?view=edit
 *
 * Composes NavigationComponent for reusable tab navigation.
 *
 * Anti-pattern compliance (Elaichenkov's 17 Playwright Mistakes):
 *   #2:  Web-first assertions only (toBeVisible) — NOT isVisible()
 *   #5:  No pre-waits before fill/click — they already auto-wait
 *   #11: { exact: true } on all getByRole / getByText locators
 *   #14: Positive assertions — toBeHidden() not not.toBeVisible()
 *   #16: Action methods return void — test decides what comes next
 */
export class EditorPage extends BasePage {
  /** Shared navigation tabs (Gallery / Generate / Edit) */
  readonly navigation: NavigationComponent;

  /** Upload area container (drag & drop zone) */
  readonly uploadArea: Locator;

  /** "Your device" button to upload from local file system */
  readonly uploadFromDeviceButton: Locator;

  /** "Adobe cloud storage" button to browse cloud assets */
  readonly browseCloudButton: Locator;

  /** Generate button for applying instruct edits */
  readonly generateButton: Locator;

  /** Prompt button to open the instruct prompt panel */
  readonly promptButton: Locator;

  /** Download button in the header */
  readonly downloadButton: Locator;

  /** Share button in the header */
  readonly shareButton: Locator;

  /** "New" button to start a fresh edit */
  readonly newButton: Locator;

  /** The instruct prompt textarea (visible after opening prompt panel) */
  readonly promptInput: Locator;

  /** Model picker for the editor */
  readonly modelPicker: Locator;

  /**
   *
   */
  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);

    // ── Priority 1: Role — accessibility tree, survives DOM refactors ───────
    // #11: { exact: true } on all role/label locators
    this.downloadButton = page.getByRole('button', { name: 'Download', exact: true });
    this.shareButton = page.getByRole('button', { name: 'Share', exact: true });
    this.generateButton = page.getByRole('button', { name: 'Generate', exact: true });
    this.newButton = page.getByRole('button', { name: 'New', exact: true });
    this.uploadFromDeviceButton = page.getByRole('button', { name: 'Your device', exact: true });
    this.browseCloudButton = page.getByRole('button', {
      name: 'Adobe cloud storage',
      exact: true,
    });
    this.promptButton = page.getByRole('button', { name: 'Prompt', exact: true });

    // ── Priority 2: Label — form inputs, mimics real user ───────────────────
    this.promptInput = page.getByLabel('Prompt', { exact: true });

    // ── Priority 5: TestId — FALLBACK for icon/container elements ────────────
    // uploadArea is a drag-drop zone with no accessible name — testId required
    this.uploadArea = page.getByTestId('firefly-lego-editor-empty-state-upload');
    // modelPicker is a custom Spectrum component with no stable accessible name
    this.modelPicker = page.getByTestId('lego-instruct-model-picker');
  }

  // ── Proxy getters for backward compatibility with existing tests ──────────
  /** Gallery tab */
  get galleryTab(): Locator {
    return this.navigation.galleryTab;
  }

  /** Generate tab */
  get generateTab(): Locator {
    return this.navigation.generateTab;
  }

  /** Edit tab */
  get editTab(): Locator {
    return this.navigation.editTab;
  }

  /** Back button in the header */
  get backButton(): Locator {
    return this.navigation.backButton;
  }

  /** Navigate to the Edit page */
  async navigateToEditor(): Promise<void> {
    await this.goto('/generate/image?view=edit', this.uploadArea.or(this.newButton));
  }

  /**
   * Assert that the editor is in the empty state (no image loaded).
   *
   * Anti-pattern #2: use web-first toBeVisible() — NOT isVisible() which does not retry.
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.uploadArea).toBeVisible(); // #2: web-first — retries
  }

  /** Upload an image from the local device using the file chooser */
  async uploadImage(filePath: string): Promise<void> {
    Logger.info(`Uploading image from: ${filePath}`);
    // #7: listen for the event FIRST, trigger SECOND, await THIRD
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadFromDeviceButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * Open the instruct prompt panel and enter a prompt.
   *
   * Anti-pattern #5: fill() already auto-waits — no pre-wait before promptButton.click().
   */
  async enterEditPrompt(text: string): Promise<void> {
    Logger.info(`Entering edit prompt: "${text}"`);
    await this.promptButton.click();
    await this.promptInput.fill(text); // #5: fill auto-waits
  }

  /** Apply the edit by clicking Generate */
  async applyEdit(): Promise<void> {
    Logger.info('Applying edit (Generate)');
    await this.generateButton.click();
  }

  /** Click the Download button */
  async downloadImage(): Promise<void> {
    Logger.info('Downloading edited image');
    await this.downloadButton.click();
  }

  /** Start a new edit (discard current) */
  async startNewEdit(): Promise<void> {
    Logger.info('Starting new edit');
    await this.newButton.click();
  }

  /**
   * Get the current editor state.
   *
   * Note: isEnabled() is acceptable here as it reads element state for data
   * collection, not as an assertion. Tests should use expect().toBeEnabled() instead.
   */
  async getEditorState(): Promise<EditorState> {
    const hasImage = !(await this.uploadArea.isVisible().catch(() => false));
    const canDownload = await this.downloadButton.isEnabled().catch(() => false);

    const generateSelected = await this.navigation.generateTab
      .getAttribute('selected')
      .catch(() => null);
    const gallerySelected = await this.navigation.galleryTab
      .getAttribute('selected')
      .catch(() => null);

    let currentTab: EditorState['currentTab'];
    if (generateSelected !== null) currentTab = 'generate';
    else if (gallerySelected !== null) currentTab = 'gallery';
    else currentTab = 'edit';

    return { hasImage, canDownload, currentTab };
  }

  /** Navigate to the Generate tab */
  async goToGenerate(): Promise<void> {
    await this.navigation.goToGenerate();
  }

  /** Navigate to the Gallery tab */
  async goToGallery(): Promise<void> {
    await this.navigation.goToGallery();
  }

  /** Go back to the Firefly homepage */
  async goBack(): Promise<void> {
    await this.navigation.goBack();
  }
}
