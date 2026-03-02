import { TestDataError } from '../utils/errors';

/**
 * Require an environment variable, throwing a descriptive error if missing.
 * Prevents silent empty-string failures that waste debugging time.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new TestDataError(key);
  return value;
}

/**
 * Centralized test data registry — single source of truth.
 *
 * All URLs, UI strings, credentials, and constants live here.
 * One UI text change = one file edit.
 */
export const TestData = {
  /** User credentials (loaded from environment) */
  credentials: {
    get validUser() {
      return {
        email: requireEnv('USERNAME'),
        password: requireEnv('PASSWORD'),
      };
    },
    invalidUser: {
      email: 'invalid@example.com',
      password: 'wrongpassword',
    },
  },

  /** URL path segments (appended to BASE_URL) */
  urls: {
    home: '/',
    generateImage: '/generate/image',
    editImage: '/generate/image?view=edit',
    yourStuff: '/your-stuff',
    gallery: '/gallery',
    discover: '/discover',
  },

  /** Regex patterns for URL assertions */
  urlPatterns: {
    fireflyHome: /firefly\.adobe\.com\/?$/,
    generateImage: /\/generate\/image/,
    editImage: /view=edit/,
    yourStuff: /\/your-stuff/,
    adobeIms: /auth\.services\.adobe\.com|adobeid/,
  },

  /** UI text constants — update here when the app changes */
  ui: {
    homepage: {
      welcomeHeading: 'Welcome to Adobe Firefly',
      logoAlt: 'Adobe Firefly',
    },
    generate: {
      emptyStateHeading: 'Start generating images',
      promptLabel: 'Prompt',
      generateButtonText: 'Generate',
    },
    editor: {
      downloadButtonText: 'Download',
      shareButtonText: 'Share',
    },
    yourStuff: {
      yourFilesTab: 'Your files',
      projectsTab: 'Projects',
      favoritesTab: 'Favorites',
      historyTab: 'Generation history',
      deletedTab: 'Deleted',
    },
  },

  /** API configuration */
  api: {
    generationEndpoint: '/v1/generate',
    maxGenerationTimeout: 60000,
  },

  /** Timeout constants */
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    generation: 60000,
  },
} as const;
