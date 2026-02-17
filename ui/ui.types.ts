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
