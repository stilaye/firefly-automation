import { test, expect } from '../fixtures/browser.fixture';
import { EditorPage } from '../ui/pages/editor.page';
import { compareScreenshot, getDynamicMasks } from '../utils/visual.helper';

test.describe('Editing Flow', () => {
  let editorPage: EditorPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    editorPage = new EditorPage(authenticatedPage);
    await editorPage.navigateToEditor();
  });

  test('should display the editor with upload area', async () => {
    await expect(editorPage.uploadArea).toBeVisible();
    await expect(editorPage.uploadFromDeviceButton).toBeVisible();
    await expect(editorPage.browseCloudButton).toBeVisible();
    await editorPage.assertEmptyState(); // #2: web-first — retries via toBeVisible()
  });

  test('should show Gallery, Generate, and Edit tabs', async () => {
    await expect(editorPage.galleryTab).toBeVisible();
    await expect(editorPage.generateTab).toBeVisible();
    await expect(editorPage.editTab).toBeVisible();
  });

  test('should have Download button in header', async () => {
    await expect(editorPage.downloadButton).toBeVisible();
  });

  test('should switch to Generate tab', async ({ authenticatedPage }) => {
    await editorPage.goToGenerate();
    await expect(authenticatedPage).toHaveURL(/generate\/image/);
  });

  test('should show prompt button and model picker', async () => {
    await expect(editorPage.promptButton).toBeVisible();
    await expect(editorPage.modelPicker).toBeVisible();
  });

  test('should navigate back to homepage', async ({ authenticatedPage }) => {
    await editorPage.goBack();
    await expect(authenticatedPage).toHaveURL(/firefly\.adobe\.com\//);
  });

  test('visual regression: editor empty state', async ({ authenticatedPage }) => {
    await compareScreenshot(authenticatedPage, 'editor-empty-state', {
      mask: getDynamicMasks(authenticatedPage),
    });
  });

  test('should get editor state correctly', async () => {
    const state = await editorPage.getEditorState();
    expect(state.hasImage).toBe(false);
    expect(state.currentTab).toBe('edit');
  });
});
