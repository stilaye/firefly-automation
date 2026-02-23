import { test, expect } from '../fixtures/browser.fixture';
import { ProjectPage } from '../ui/pages/project.page';

test.describe('Projects Flow', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectPage = new ProjectPage(authenticatedPage);
    await projectPage.navigateToYourStuff();
  });

  test('should display the Your stuff page with files container', async () => {
    await expect(projectPage.filesContainer).toBeVisible();
    await expect(projectPage.pageHeading).toBeVisible();
  });

  test('should show left navigation tabs', async () => {
    // All 6 nav tabs should be present
    await expect(projectPage.yourFilesLink).toBeVisible();
    await expect(projectPage.sharedWithYouLink).toBeVisible();
    await expect(projectPage.projectsLink).toBeVisible();
    await expect(projectPage.favoritesLink).toBeVisible();
    await expect(projectPage.generationHistoryLink).toBeVisible();
    await expect(projectPage.deletedLink).toBeVisible();
  });

  test('should navigate to Projects section', async () => {
    await projectPage.goToProjects();
    // Projects section should load
    await expect(projectPage.filesContainer).toBeVisible();
  });

  test('should navigate to Generation history', async () => {
    await projectPage.goToGenerationHistory();
    await expect(projectPage.filesContainer).toBeVisible();
  });

  test('should navigate to Favorites', async () => {
    await projectPage.goToFavorites();
    await expect(projectPage.filesContainer).toBeVisible();
  });

  test('should have create folder button', async () => {
    await expect(projectPage.createFolderButton).toBeVisible();
  });

  test('should have search functionality', async () => {
    await expect(projectPage.searchField).toBeVisible();
  });

  test('should get the page heading text', async () => {
    const heading = await projectPage.getPageHeading();
    expect(heading).toBeTruthy();
  });
});
