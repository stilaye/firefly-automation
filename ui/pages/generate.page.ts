import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { type GeneratedImage } from '../ui.types';

/**
 * Page Object Model for the Adobe Firefly "Generate Image" page.
 *
 * URL: https://firefly.adobe.com/generate/image
 *
 * This page allows users to enter a text prompt and generate AI images
 * using various models and settings.
 *
 * Anti-pattern compliance (Elaichenkov's 17 Playwright Mistakes):
 *   #2:  Web-first assertions only (toBeVisible) — NOT isVisible()
 *   #5:  No pre-waits before fill/click — they already auto-wait
 *   #11: { exact: true } on all getByRole / getByText locators
 *   #14: Positive assertions — toBeHidden() not not.toBeVisible()
 *   #16: Action methods return void — test decides what comes next
 */
export class GeneratePage {
  /** Prompt textarea where the user describes the image to generate */
  readonly promptInput: Locator;

  /** Generate button to start image generation */
  readonly generateButton: Locator;

  /** Model picker dropdown (e.g., Firefly Image 5, Gemini 2.5) */
  readonly modelPicker: Locator;

  /** Aspect ratio picker dropdown */
  readonly aspectRatioPicker: Locator;

  /** Settings panel sidebar on the left */
  readonly settingsPanel: Locator;

  /** Reference image upload button */
  readonly referenceImageUpload: Locator;

  /** Empty state container shown before first generation */
  readonly emptyState: Locator;

  /** "Start generating images" heading in the empty state */
  readonly emptyStateHeading: Locator;

  /** Gallery tab in the top navigation */
  readonly galleryTab: Locator;

  /** Generate tab in the top navigation */
  readonly generateTab: Locator;

  /** Edit tab in the top navigation */
  readonly editTab: Locator;

  /** Back button in the header */
  readonly backButton: Locator;

  constructor(private page: Page) {
    // ── Priority 1: Role — accessibility tree, survives DOM refactors ───────
    // #11: { exact: true } on all role/label locators
    this.generateButton = page.getByRole('button', { name: 'Generate', exact: true });
    this.backButton = page.getByRole('button', { name: 'Back', exact: true });
    this.emptyStateHeading = page.getByRole('heading', {
      name: 'Start generating images',
      exact: true,
    });

    // Adobe Spectrum <sp-tab> components expose ARIA role="tab" — use getByRole
    this.galleryTab = page.getByRole('tab', { name: 'Gallery', exact: true });
    this.generateTab = page.getByRole('tab', { name: 'Generate', exact: true });
    this.editTab = page.getByRole('tab', { name: 'Edit', exact: true });

    // ── Priority 2: Label — form inputs, mimics real user ───────────────────
    this.promptInput = page.getByLabel('Prompt', { exact: true });

    // ── Priority 5: TestId — FALLBACK for custom Spectrum components ─────────
    // ModelPicker, AspectRatio, ReferenceUpload are Adobe Spectrum custom
    // components with no stable accessible name — testId is the correct choice.
    this.modelPicker = page.getByTestId('firefly-picker-model');
    this.aspectRatioPicker = page.getByTestId('aspect-ratio-picker');
    this.settingsPanel = page.getByTestId('firefly-image-settings-panel-sidebar');
    this.referenceImageUpload = page.getByTestId('upload-placeholder-button');
    this.emptyState = page.getByTestId('empty-state-container');
  }

  /** Navigate to the Generate Image page */
  async navigateToGenerate(): Promise<void> {
    Logger.info('Navigating to Generate Image page');
    await this.page.goto('/generate/image');
    await expect(this.promptInput).toBeVisible(); // #2: web-first — retries until timeout
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
    Logger.info(`Selecting model: ${modelName}`);
    await this.modelPicker.click();
    // #11: exact: true prevents partial model name matches
    await this.page
      .getByRole('option', { name: modelName, exact: true })
      .or(this.page.locator(`sp-menu-item:has-text("${modelName}")`))
      .click();
  }

  /** Select an aspect ratio from the picker */
  async selectAspectRatio(ratio: string): Promise<void> {
    Logger.info(`Selecting aspect ratio: ${ratio}`);
    await this.aspectRatioPicker.click();
    // #11: exact: true prevents partial ratio name matches
    await this.page
      .getByRole('option', { name: ratio, exact: true })
      .or(this.page.locator(`sp-menu-item:has-text("${ratio}")`))
      .click();
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
    await this.galleryTab.click();
  }

  /** Navigate to the Edit tab */
  async goToEdit(): Promise<void> {
    await this.editTab.click();
  }

  /** Go back to the Firefly homepage */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
