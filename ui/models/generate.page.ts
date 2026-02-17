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
    this.promptInput = page.getByLabel('Prompt');
    this.generateButton = page.locator('[data-testid="generate-image-generate-button"]');
    this.modelPicker = page.locator('[data-testid="firefly-picker-model"]');
    this.aspectRatioPicker = page.locator('[data-testid="aspect-ratio-picker"]');
    this.settingsPanel = page.locator('[data-testid="firefly-image-settings-panel-sidebar"]');
    this.referenceImageUpload = page.locator('[data-testid="upload-placeholder-button"]');
    this.emptyState = page.locator('[data-testid="empty-state-container"]');
    this.emptyStateHeading = page.getByRole('heading', {
      name: 'Start generating images',
    });
    this.galleryTab = page.locator('sp-tab[value="gallery"]');
    this.generateTab = page.locator('sp-tab[value="generate"]');
    this.editTab = page.locator('sp-tab[value="edit"]');
    this.backButton = page.locator('[data-testid="header-navbar-back-button"]');
  }

  /** Navigate to the Generate Image page */
  async navigateToGenerate(): Promise<void> {
    Logger.info('Navigating to Generate Image page');
    await this.page.goto('/generate/image');
    await expect(this.promptInput).toBeVisible();
  }

  /** Enter a text prompt for image generation */
  async enterPrompt(text: string): Promise<void> {
    Logger.info(`Entering prompt: "${text}"`);
    await this.promptInput.click();
    await this.promptInput.fill(text);
  }

  /** Click the Generate button to start generation */
  async clickGenerate(): Promise<void> {
    Logger.info('Clicking Generate button');
    await this.generateButton.click();
  }

  /** Wait for generation results to appear (images loaded) */
  async waitForResults(timeout = 60000): Promise<void> {
    Logger.info('Waiting for generation results');
    await expect(this.emptyState).not.toBeVisible({ timeout });
    // Wait for at least one generated image to appear in the results area
    await this.page
      .locator('[data-testid="generated-image"], .result-image, img[src*="firefly"]')
      .first()
      .waitFor({ state: 'visible', timeout });
  }

  /** Get all generated image elements from the results area */
  async getGeneratedImages(): Promise<GeneratedImage[]> {
    const images = this.page.locator('[data-testid="generated-image"], .result-image img');
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
    await this.page
      .getByRole('option', { name: modelName })
      .or(this.page.locator(`sp-menu-item:has-text("${modelName}")`))
      .click();
  }

  /** Select an aspect ratio from the picker */
  async selectAspectRatio(ratio: string): Promise<void> {
    Logger.info(`Selecting aspect ratio: ${ratio}`);
    await this.aspectRatioPicker.click();
    await this.page
      .getByRole('option', { name: ratio })
      .or(this.page.locator(`sp-menu-item:has-text("${ratio}")`))
      .click();
  }

  /** Check if the empty state is visible (no generation yet) */
  async isEmptyState(): Promise<boolean> {
    return this.emptyStateHeading.isVisible().catch(() => false);
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
