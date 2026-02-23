export interface UIComponent {
  selector: string;
  name: string;
}

/** Represents a generated image result on the Generate page */
export interface GeneratedImage {
  src: string;
  alt: string;
  index: number;
}

/** Represents a Firefly project in the "Your stuff" section */
export interface FireflyProject {
  name: string;
  type: string;
  lastModified: string;
}

/** Represents the state of the image editor */
export interface EditorState {
  hasImage: boolean;
  canDownload: boolean;
  currentTab: 'gallery' | 'generate' | 'edit';
}

/** Represents a generation prompt configuration */
export interface GenerationPrompt {
  text: string;
  model?: string;
  aspectRatio?: string;
  referenceImages?: string[];
}

/** Available AI models for image generation */
export type FireflyModel =
  | 'Firefly Image 5'
  | 'Firefly Image 4 Ultra'
  | 'Firefly Image 4'
  | 'Firefly Image 3'
  | 'Gemini 2.5 (w/ Nano Banana)'
  | string;

/** Available aspect ratios */
export type AspectRatio =
  | 'Landscape (4:3)'
  | 'Portrait (3:4)'
  | 'Square (1:1)'
  | 'Widescreen (16:9)'
  | string;

// ─── Visual Regression Config ────────────────────────────────────────────────

/**
 * Configuration for a single page in the visual regression suite.
 *
 * Defined in `tests/visual-config/visual.config.json`.
 * Add new pages to that file without changing any TypeScript.
 */
export interface VisualPageConfig {
  /** Unique name for the screenshot baseline (e.g. 'generate-page-empty') */
  name: string;
  /** Relative path to navigate to (e.g. '/generate') */
  path: string;
  /** Set to false to skip this page without removing it from config */
  active: boolean;
  /** data-testid selectors for dynamic content to mask before comparison */
  maskSelectors?: string[];
}

/**
 * Top-level shape of `tests/visual-config/visual.config.json`.
 *
 * - SMOKE_ONLY: true  → only `pages.smoke` entries run
 * - SMOKE_ONLY: false → `pages.detailed` + `pages.smoke` both run
 */
export interface VisualConfig {
  /** When true, only smoke pages are tested (fast CI gate) */
  SMOKE_ONLY: boolean;
  /** Max pixel difference ratio applied to all pages (overridable per page) */
  MAX_DIFF_PIXEL_RATIO: number;
  pages: {
    /** Critical pages always included in every run */
    smoke: VisualPageConfig[];
    /** Extended coverage pages included when SMOKE_ONLY is false */
    detailed: VisualPageConfig[];
  };
}
