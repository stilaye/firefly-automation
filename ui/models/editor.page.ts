import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { type EditorState } from '../ui.types';

/**
 * Page Object Model for the Adobe Firefly "Edit" page.
 *
 * URL: https://firefly.adobe.com/generate/image?view=edit
 *
 * This page allows users to upload an image and apply AI-powered edits
 * using text prompts (instruct mode).
 */
export class EditorPage {
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

  /** Gallery tab */
  readonly galleryTab: Locator;

  /** Generate tab */
  readonly generateTab: Locator;

  /** Edit tab */
  readonly editTab: Locator;

  /** Back button in the header */
  readonly backButton: Locator;

  /** The instruct prompt textarea (visible after opening prompt panel) */
  readonly promptInput: Locator;

  /** Model picker for the editor */
  readonly modelPicker: Locator;

  constructor(private page: Page) {
    this.uploadArea = page.locator('[data-testid="firefly-lego-editor-empty-state-upload"]');
    this.uploadFromDeviceButton = page.locator('[data-testid="empty-state-upload-button"]');
    this.browseCloudButton = page.locator('[data-testid="empty-state-browse-button"]');
    this.generateButton = page.locator('[data-testid="instruct-generate-button"]');
    this.promptButton = page.locator('[data-testid="instruct-button"]');
    this.downloadButton = page.getByRole('button', { name: 'Download' });
    this.shareButton = page.getByRole('button', { name: 'Share' });
    this.newButton = page.locator('[data-testid="new-button"]');
    this.galleryTab = page.locator('sp-tab[value="gallery"]');
    this.generateTab = page.locator('sp-tab[value="generate"]');
    this.editTab = page.locator('sp-tab[value="edit"]');
    this.backButton = page.locator('[data-testid="header-navbar-back-button"]');
    this.promptInput = page.getByLabel('Prompt');
    this.modelPicker = page.locator('[data-testid="lego-instruct-model-picker"]');
  }

  /** Navigate to the Edit page */
  async navigateToEditor(): Promise<void> {
    Logger.info('Navigating to Edit page');
    await this.page.goto('/generate/image?view=edit');
    await expect(this.uploadArea.or(this.newButton)).toBeVisible();
  }

  /** Check if the editor is in the empty state (no image loaded) */
  async isEmptyState(): Promise<boolean> {
    return this.uploadArea.isVisible().catch(() => false);
  }

  /** Upload an image from the local device using the file chooser */
  async uploadImage(filePath: string): Promise<void> {
    Logger.info(`Uploading image from: ${filePath}`);
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadFromDeviceButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /** Open the instruct prompt panel and enter a prompt */
  async enterEditPrompt(text: string): Promise<void> {
    Logger.info(`Entering edit prompt: "${text}"`);
    await this.promptButton.click();
    await this.promptInput.fill(text);
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

  /** Get the current editor state */
  async getEditorState(): Promise<EditorState> {
    const hasImage = !(await this.isEmptyState());
    const canDownload = await this.downloadButton.isEnabled().catch(() => false);

    const generateSelected = await this.generateTab.getAttribute('selected').catch(() => null);
    const gallerySelected = await this.galleryTab.getAttribute('selected').catch(() => null);

    let currentTab: EditorState['currentTab'];
    if (generateSelected !== null) currentTab = 'generate';
    else if (gallerySelected !== null) currentTab = 'gallery';
    else currentTab = 'edit';

    return { hasImage, canDownload, currentTab };
  }

  /** Navigate to the Generate tab */
  async goToGenerate(): Promise<void> {
    await this.generateTab.click();
  }

  /** Navigate to the Gallery tab */
  async goToGallery(): Promise<void> {
    await this.galleryTab.click();
  }

  /** Go back to the Firefly homepage */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
