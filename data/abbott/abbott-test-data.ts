/**
 * Centralized test data for Abbott Merlin.net — single source of truth.
 *
 * All URLs, UI strings, and constants live here.
 * One UI text change = one file edit.
 */
export const AbbottTestData = {
  /** URL path segments (appended to baseURL in playwright.config.ts) */
  urls: {
    login: '/web/chakravyuh/login',
    resetPassword: '/web/chakravyuh/resetpassword',
    termsOfUsePdf: '/documents/240590/252003/Terms_and_Conditions.pdf',
    privacyPolicyPdf: '/documents/240590/252003/Privacy_Policy.pdf',
  },

  /** Regex patterns for URL assertions */
  urlPatterns: {
    login: /\/web\/chakravyuh\/login/,
    resetPassword: /\/web\/chakravyuh\/resetpassword/,
    termsOfUsePdf: /Terms_and_Conditions\.pdf/,
    privacyPolicyPdf: /Privacy_Policy\.pdf/,
  },

  /** UI text constants — update here when the app changes */
  ui: {
    login: {
      pageTitle: 'Merlin.net',
      welcomeHeading: 'Welcome to Merlin.net',
      signInButtonText: 'Sign in',
      forgotPasswordLinkText: 'Forgot user ID or password',
      userIdLabel: 'User ID',
      passwordLabel: 'Password',
    },
    resetPassword: {
      pageTitle: 'Merlin.net',
      headingText: 'Reset Password',
      resetButtonText: 'Reset Password',
      cancelButtonText: 'Cancel',
      userIdLabel: 'User ID',
      emailLabel: 'Registered email address',
      instructionText:
        'Please enter your Merlin.net\u2122 user ID and your email address registered in Merlin.net\u2122. A temporary',
      forgotUserIdText:
        'If you have forgotten your User ID, please contact your administrator for further assistance.',
    },
    footer: {
      termsOfUseLinkText: 'Website Terms of Use',
      privacyPolicyLinkText: 'Privacy Policy',
      contactUsLinkText: 'Contact Us',
      abbottLinkText: 'www.cardiovascular.abbott',
      abbottLinkHref: 'https://www.cardiovascular.abbott',
      copyrightPattern: /Merlin\.net\u2122.*Abbott/,
    },
    helpMenu: {
      helpText: 'Help',
      learnMoreText: 'Learn More',
      practiceSiteText: 'Practice Site',
      aboutText: 'About',
    },
  },

  /** Test input values for form validation */
  testInputs: {
    validUserId: 'testuser01',
    validEmail: 'testuser@example.com',
    longInput: 'a'.repeat(1000),
    xssPayload: '<script>alert("xss")</script>',
    sqlInjection: "' OR 1=1 --",
    unicodeInput: '\u00FC\u00F1\u00EE\u00E7\u00F6d\u00E9 \uD83D\uDE80',
  },

  /** Timeout constants */
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
  },
} as const;
