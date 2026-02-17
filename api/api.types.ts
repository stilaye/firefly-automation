export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
}

/** Request payload for image generation */
export interface GenerationRequest {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  referenceImageIds?: string[];
  numResults?: number;
}

/** Response from the image generation API */
export interface GenerationResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  images: ImageMetadata[];
  prompt: string;
  model: string;
}

/** Metadata for a generated or uploaded image */
export interface ImageMetadata {
  id: string;
  url: string;
  width: number;
  height: number;
  contentType: string;
  createdAt: string;
}

/** Authentication token response */
export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}
