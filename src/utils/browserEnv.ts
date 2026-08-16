/**
 * Small, dependency-free environment checks used by the auth flow. Split out
 * of AuthContext.tsx so AuthModal.tsx can also read `isLikelyInAppBrowser()`
 * without importing the whole auth context.
 */

/** True when the app is rendered inside a cross-origin iframe we don't
 * control (e.g. an embedded preview) — `window.open()`-based popups are
 * routinely blocked there, so Google sign-in should go straight to
 * `signInWithRedirect` instead of trying a popup first. */
export function isEmbeddedInIframe(): boolean {
  try {
    return window.top !== window.self;
  } catch {
    // Cross-origin access to window.top throws, which itself confirms
    // we're embedded in a frame we don't control.
    return true;
  }
}

// Known in-app "mini browser" WebViews (Instagram, Facebook/Messenger,
// TikTok, LinkedIn, Twitter/X, Line, WeChat, Snapchat, Pinterest) that
// users land in when tapping a link from inside those apps. These WebViews
// routinely fail Firebase's `signInWithRedirect()` Google sign-in with a
// "missing initial state" error: Firebase relies on sessionStorage set in
// the tab right before navigating to Google to reconcile the result when
// the page comes back, and many in-app WebViews either partition storage
// per-navigation or hand the return trip to a different WebView instance,
// so that storage is gone by the time Firebase's own hosted auth-handler
// page tries to read it back — Firebase's error page for this renders
// *before* control ever returns to our own app code, so it can't be caught
// and retried from here. The only real fix is to warn the user up front and
// point them at email/password sign-in (no redirect involved) or their
// regular browser instead.
const IN_APP_BROWSER_UA_SIGNATURES = [
  'Instagram',
  'FBAN', // Facebook app
  'FBAV', // Facebook app (older UA form)
  'FB_IAB', // Facebook in-app browser
  'Messenger',
  'TikTok',
  'musical_ly',
  'LinkedInApp',
  'Twitter',
  'Line/',
  'MicroMessenger', // WeChat
  'Snapchat',
  'Pinterest',
];

export function isLikelyInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return IN_APP_BROWSER_UA_SIGNATURES.some((signature) => ua.includes(signature));
}
