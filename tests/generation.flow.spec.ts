import { test, expect } from '../fixtures/browser.fixture';
import { GeneratePage } from '../ui/pages/generate.page';
import { mockGenerationAPI, mockGenerationFailure, clearMocks } from '../utils/api.mock';
import { compareScreenshot, getDynamicMasks } from '../utils/visual.helper';
import { measurePageLoad } from '../utils/perf.metrics';

test.describe('Generation Flow', () => {
  let generatePage: GeneratePage;

  test.beforeEach(async ({ authenticatedPage }) => {
    generatePage = new GeneratePage(authenticatedPage);
    await generatePage.navigateToGenerate();
  });

  test('should display the generate page with empty state', async () => {
    await expect(generatePage.promptInput).toBeVisible();
    await expect(generatePage.generateButton).toBeVisible();
    await expect(generatePage.emptyStateHeading).toBeVisible();
    await expect(generatePage.settingsPanel).toBeVisible();
    await generatePage.assertEmptyState(); // #2: web-first — retries via toBeVisible()
  });

  test('should allow entering a prompt', async () => {
    const prompt = 'A serene mountain landscape at sunset with warm colors';
    await generatePage.enterPrompt(prompt);

    await expect(generatePage.promptInput).toHaveValue(prompt);
  });

  test('should show model picker with available models', async ({ authenticatedPage }) => {
    await expect(generatePage.modelPicker).toBeVisible();
    await generatePage.modelPicker.click();

    // Verify at least some models are available
    const modelOptions = authenticatedPage.locator('sp-menu-item');
    await expect(modelOptions.first()).toBeVisible();
  });

  test('should show aspect ratio picker', async () => {
    await expect(generatePage.aspectRatioPicker).toBeVisible();
  });

  test('should generate images with mocked API', async ({ authenticatedPage }) => {
    // Mock the generation API for a deterministic test
    await mockGenerationAPI(authenticatedPage);

    await generatePage.enterPrompt('A test prompt for mocked generation');
    await generatePage.clickGenerate();

    // Verify generation results appear
    await generatePage.waitForResults();
    const images = await generatePage.getGeneratedImages();
    expect(images.length).toBeGreaterThan(0);

    await clearMocks(authenticatedPage);
  });

  test('should handle generation failure gracefully', async ({ authenticatedPage }) => {
    await mockGenerationFailure(authenticatedPage);

    await generatePage.enterPrompt('A prompt that will fail');
    await generatePage.clickGenerate();

    // The UI should show an error state (not crash)
    // Wait for the error response to be processed
    await expect(generatePage.promptInput).toBeVisible();
    await clearMocks(authenticatedPage);
  });

  test('should navigate between Gallery, Generate, and Edit tabs', async () => {
    await expect(generatePage.galleryTab).toBeVisible();
    await expect(generatePage.generateTab).toBeVisible();
    await expect(generatePage.editTab).toBeVisible();

    await generatePage.goToEdit();
    await expect(generatePage.editTab).toHaveAttribute('selected', /.*/);

    await generatePage.goToGallery();
    await expect(generatePage.galleryTab).toHaveAttribute('selected', /.*/);
  });

  test('visual regression: generate page empty state', async ({ authenticatedPage }) => {
    await compareScreenshot(authenticatedPage, 'generate-page-empty', {
      mask: getDynamicMasks(authenticatedPage),
    });
  });

  test('should capture page load metrics', async ({ authenticatedPage }) => {
    const metrics = await measurePageLoad(authenticatedPage);
    expect(metrics.pageLoad).toBeGreaterThan(0);
    expect(metrics.domContentLoaded).toBeGreaterThan(0);
  });
});
