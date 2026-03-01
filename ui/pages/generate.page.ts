import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';
import { SettingsComponent } from '../components/settings.component';
import { Logger } from '../../utils/logger';
import { type GeneratedImage } from '../ui.types';

/**
 * Page Object Model for the Adobe Firefly "Generate Image" page.
 *
 * URL: https://firefly.adobe.com/generate/image
 *
 * Composes NavigationComponent and SettingsComponent for reusable
 * tab navigation and model/aspect-ratio selection.
 *
 * Anti-pattern compliance (Elaichenkov's 17 Playwright Mistakes):
 *   #2:  Web-first assertions only (toBeVisible) — NOT isVisible()
 *   #5:  No pre-waits before fill/click — they already auto-wait
 *   #11: { exact: true } on all getByRole / getByText locators
 *   #14: Positive assertions — toBeHidden() not not.toBeVisible()
 *   #16: Action methods return void — test decides what comes next
 */
export class GeneratePage extends BasePage {
  /** Shared navigation tabs (Gallery / Generate / Edit) */
  readonly navigation: NavigationComponent;

  /** Shared settings panel (model picker, aspect ratio, etc.) */
  readonly settings: SettingsComponent;

  /** Prompt textarea where the user describes the image to generate */
  readonly promptInput: Locator;

  /** Generate button to start image generation */
  readonly generateButton: Locator;

  /** Empty state container shown before first generation */
  readonly emptyState: Locator;

  /** "Start generating images" heading in the empty state */
  readonly emptyStateHeading: Locator;

  /**
   *
   */
  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);
    this.settings = new SettingsComponent(page);

    // ── Priority 1: Role — accessibility tree, survives DOM refactors ───────
    // #11: { exact: true } on all role/label locators
    this.generateButton = page.getByRole('button', { name: 'Generate', exact: true });
    this.emptyStateHeading = page.getByRole('heading', {
      name: 'Start generating images',
      exact: true,
    });

    // ── Priority 2: Label — form inputs, mimics real user ───────────────────
    this.promptInput = page.getByLabel('Prompt', { exact: true });

    // ── Priority 5: TestId — FALLBACK for custom Spectrum components ─────────
    this.emptyState = page.getByTestId('empty-state-container');
  }

  // ── Proxy getters for backward compatibility with existing tests ──────────
  /** Gallery tab in the top navigation */
  get galleryTab(): Locator {
    return this.navigation.galleryTab;
  }

  /** Generate tab in the top navigation */
  get generateTab(): Locator {
    return this.navigation.generateTab;
  }

  /** Edit tab in the top navigation */
  get editTab(): Locator {
    return this.navigation.editTab;
  }

  /** Back button in the header */
  get backButton(): Locator {
    return this.navigation.backButton;
  }

  /** Model picker dropdown */
  get modelPicker(): Locator {
    return this.settings.modelPicker;
  }

  /** Aspect ratio picker dropdown */
  get aspectRatioPicker(): Locator {
    return this.settings.aspectRatioPicker;
  }

  /** Settings panel sidebar */
  get settingsPanel(): Locator {
    return this.settings.settingsPanel;
  }

  /** Reference image upload button */
  get referenceImageUpload(): Locator {
    return this.settings.referenceImageUpload;
  }

  /** Navigate to the Generate Image page */
  async navigateToGenerate(): Promise<void> {
    await this.goto('/generate/image', this.promptInput);
  }

  /**
   * Enter a text prompt for image generation.
   *
   * Anti-pattern #5: fill() already auto-waits — the pre-click has been removed.
   */
  async enterPrompt(text: string): Promise<void> {
    Logger.info(`Entering prompt: "${text}"`);
    await this.promptInput.fill(text); // #5: fill auto-waits — no pre-click needed
  }

  /** Click the Generate button to start generation */
  async clickGenerate(): Promise<void> {
    Logger.info('Clicking Generate button');
    await this.generateButton.click();
  }

  /** Wait for generation results to appear (images loaded) */
  async waitForResults(timeout = 60000): Promise<void> {
    Logger.info('Waiting for generation results');
    // #14: toBeHidden() (positive) instead of not.toBeVisible() (negative)
    await expect(this.emptyState).toBeHidden({ timeout });
    // Selector hierarchy: testId only — no fragile CSS class fallback
    await this.page.getByTestId('generated-image').first().waitFor({ state: 'visible', timeout });
  }

  /** Get all generated image elements from the results area */
  async getGeneratedImages(): Promise<GeneratedImage[]> {
    // Selector hierarchy: testId — no CSS class fallback (.result-image removed)
    const images = this.page.getByTestId('generated-image');
    const count = await images.count();
    const results: GeneratedImage[] = [];
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      results.push({
        src: (await img.getAttribute('src')) ?? '',
        alt: (await img.getAttribute('alt')) ?? '',
        index: i,
      });
    }
    return results;
  }

  /** Select a model from the model picker dropdown */
  async selectModel(modelName: string): Promise<void> {
    await this.settings.selectModel(modelName);
  }

  /** Select an aspect ratio from the picker */
  async selectAspectRatio(ratio: string): Promise<void> {
    await this.settings.selectAspectRatio(ratio);
  }

  /**
   * Assert that the page is in the empty state (no generation yet).
   *
   * Anti-pattern #2: use web-first toBeVisible() — NOT isVisible() which does not retry.
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyStateHeading).toBeVisible(); // #2: web-first — retries
  }

  /** Navigate to the Gallery tab */
  async goToGallery(): Promise<void> {
    await this.navigation.goToGallery();
  }

  /** Navigate to the Edit tab */
  async goToEdit(): Promise<void> {
    await this.navigation.goToEdit();
  }

  /** Go back to the Firefly homepage */
  async goBack(): Promise<void> {
    await this.navigation.goBack();
  }
}
