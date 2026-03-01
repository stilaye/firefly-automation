import { type Locator, type Page } from '@playwright/test';
import { BaseComponent } from './base.component';
import { Logger } from '../../utils/logger';

/**
 * Settings panel component — reused across Generate and Edit pages.
 *
 * Contains model picker, aspect ratio picker, and other generation settings
 * found in the left sidebar.
 */
export class SettingsComponent extends BaseComponent {
  /** Model picker dropdown (e.g., Firefly Image 5) */
  readonly modelPicker: Locator;

  /** Aspect ratio picker dropdown */
  readonly aspectRatioPicker: Locator;

  /** Settings panel sidebar container */
  readonly settingsPanel: Locator;

  /** Reference image upload button */
  readonly referenceImageUpload: Locator;

  /**
   *
   */
  constructor(page: Page) {
    super(page);
    // ModelPicker, AspectRatio, ReferenceUpload are Adobe Spectrum custom
    // components with no stable accessible name — testId is the correct choice.
    this.modelPicker = page.getByTestId('firefly-picker-model');
    this.aspectRatioPicker = page.getByTestId('aspect-ratio-picker');
    this.settingsPanel = page.getByTestId('firefly-image-settings-panel-sidebar');
    this.referenceImageUpload = page.getByTestId('upload-placeholder-button');
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
}
