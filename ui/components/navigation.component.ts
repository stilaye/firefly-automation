import { type Locator, type Page } from '@playwright/test';
import { BaseComponent } from './base.component';

/**
 * Shared navigation component — reused across Generate, Edit, and other pages.
 *
 * Contains the top tab bar (Gallery / Generate / Edit) and the back button
 * found in Firefly's sub-pages.
 */
export class NavigationComponent extends BaseComponent {
  /** Gallery tab in the top navigation */
  readonly galleryTab: Locator;

  /** Generate tab in the top navigation */
  readonly generateTab: Locator;

  /** Edit tab in the top navigation */
  readonly editTab: Locator;

  /** Back button in the header */
  readonly backButton: Locator;

  /** Firefly header logo */
  readonly fireflyLogo: Locator;

  /** User avatar icon — visible when signed in */
  readonly userAvatar: Locator;

  /**
   *
   */
  constructor(page: Page) {
    super(page);
    // Adobe Spectrum <sp-tab> components expose ARIA role="tab" — use getByRole
    // #11: { exact: true } on all role locators
    this.galleryTab = page.getByRole('tab', { name: 'Gallery', exact: true });
    this.generateTab = page.getByRole('tab', { name: 'Generate', exact: true });
    this.editTab = page.getByRole('tab', { name: 'Edit', exact: true });
    this.backButton = page.getByRole('button', { name: 'Back', exact: true });
    this.fireflyLogo = page.getByRole('link', { name: 'Adobe Firefly', exact: true });
    this.userAvatar = page.getByTestId('user-avatar-account-icon');
  }

  /** Navigate to the Gallery tab */
  async goToGallery(): Promise<void> {
    await this.click(this.galleryTab);
  }

  /** Navigate to the Generate tab */
  async goToGenerate(): Promise<void> {
    await this.click(this.generateTab);
  }

  /** Navigate to the Edit tab */
  async goToEdit(): Promise<void> {
    await this.click(this.editTab);
  }

  /** Go back via the header back button */
  async goBack(): Promise<void> {
    await this.click(this.backButton);
  }
}
