import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  FirebaseUser,
  UserProfile,
  OWNER_EMAIL,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection
} from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  /** Set when a signInWithRedirect() return (e.g. Google sign-in in an
   * embedded/iframe context) fails to resolve to a signed-in user — surfaced
   * so AuthModal can show it instead of the failure silently dumping the
   * visitor back on the signed-out landing page with no explanation. */
  authError: string | null;
  signUp: (email: string, pass: string, displayName?: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Optimistic-only hint for instant UI (e.g. show the admin tab while the
  // Firestore profile is still loading). It grants no actual data access —
  // firestore.rules independently re-verifies ownership via the real,
  // server-issued ID token before allowing any admin read/write.
  const isOwner = !!(
    (user && user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) ||
    userProfile?.role === 'admin'
  );

  const fetchProfileByUid = async (uid: string, email: string, displayName?: string): Promise<UserProfile> => {
    const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const defaultProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || (isOwnerEmail ? 'System Owner' : 'Member'),
      role: isOwnerEmail ? 'admin' : 'member',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      campaignsCount: 0
    };

    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profileData = snap.data() as UserProfile;
        if (profileData.status === 'suspended' && !isOwnerEmail) {
          throw new Error('Your account has been suspended by the administrator.');
        }
        return profileData;
      }

      // First time we've seen this uid — create their profile doc.
      // firestore.rules independently enforces that only the verified owner
      // may ever have role: 'admin' written, regardless of what's sent here.
      await setDoc(userRef, defaultProfile).catch((err) => {
        console.warn('Firestore setDoc notice:', err);
      });
      return defaultProfile;
    } catch (err) {
      console.warn('Error fetching profile:', err);
      return defaultProfile;
    }
  };

  useEffect(() => {
    let cancelled = false;
    // Whether getRedirectResult() has settled (resolved OR rejected) yet.
    // onAuthStateChanged can fire once with a null user before Firebase
    // finishes internally processing a pending signInWithRedirect() return
    // (the path taken for Google sign-in in an embedded/iframe context,
    // e.g. this environment's own preview) — if we painted the signed-out
    // landing page on that first null callback, a slow-resolving redirect
    // would flash "signed out" even though a sign-in might still be
    // completing, with no guarantee the UI ever gets a second callback to
    // correct itself before the visitor notices. So: don't commit to the
    // signed-out UI on a null callback until the redirect check has
    // definitely settled one way or the other.
    let redirectSettled = false;
    let pendingSignOut: (() => void) | null = null;

    const finishSignedOut = () => {
      if (cancelled) return;
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    };

    // Completes a signInWithRedirect() started elsewhere (e.g. the popup
    // fallback below). onAuthStateChanged will also fire with the same
    // user, but only this call gives us access to the result for logging
    // and to a genuine error if the redirect sign-in itself failed.
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          logActivity(res.user.uid, res.user.email || '', 'User logged in with Google (redirect)');
        }
      })
      .catch((err) => {
        console.warn('Google redirect sign-in notice:', err);
        if (!cancelled) setAuthError(err?.message || 'Google sign-in failed. Please try again.');
      })
      .finally(() => {
        redirectSettled = true;
        if (pendingSignOut) {
          const run = pendingSignOut;
          pendingSignOut = null;
          run();
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfileByUid(currentUser.uid, currentUser.email || '', currentUser.displayName || '')
          .then((p) => {
            if (!cancelled) setUserProfile(p);
          })
          .catch(() => {
            if (!cancelled) setUserProfile(null);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
        return;
      }

      if (redirectSettled) {
        finishSignedOut();
      } else {
        // Hold off — a redirect result may still be resolving.
        pendingSignOut = finishSignedOut;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user && user.email) {
      const p = await fetchProfileByUid(user.uid, user.email, user.displayName || '');
      setUserProfile(p);
    }
  };

  const logActivity = (userId: string, userEmail: string, action: string) => {
    addDoc(collection(db, 'activity_logs'), {
      userId,
      userEmail,
      action,
      timestamp: new Date().toISOString()
    }).catch((err) => console.warn('Activity log notice:', err));
  };

  const signUp = async (email: string, pass: string, displayName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerSignup = cleanEmail === OWNER_EMAIL.toLowerCase();
    const cleanName = displayName?.trim() || (isOwnerSignup ? 'System Owner' : 'Member');

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const u = cred.user;

    if (isOwnerSignup) {
      // Require the owner's address to be verified before firestore.rules
      // will ever recognize it as admin (see isOwner() in firestore.rules).
      sendEmailVerification(u).catch((err) => console.warn('Email verification notice:', err));
    }

    setUser(u);
    const profile = await fetchProfileByUid(u.uid, cleanEmail, cleanName);
    setUserProfile(profile);

    logActivity(u.uid, cleanEmail, isOwnerSignup ? 'Owner account created' : 'Account registered');
  };

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const u = cred.user;

    setUser(u);
    const profile = await fetchProfileByUid(u.uid, cleanEmail, u.displayName || undefined);
    setUserProfile(profile);

    logActivity(u.uid, cleanEmail, 'User logged in');
  };

  // Environments that embed the app in a cross-origin iframe (e.g. Google
  // AI Studio's preview) routinely block window.open, so a popup there is
  // doomed before we even try it — go straight to redirect in that case.
  const isEmbeddedInIframe = () => {
    try {
      return window.top !== window.self;
    } catch {
      // Cross-origin access to window.top throws, which itself confirms
      // we're embedded in a frame we don't control.
      return true;
    }
  };

  // Note: auth/unauthorized-domain is deliberately excluded — it's a
  // domain-allowlist check enforced identically for popup and redirect, so
  // retrying with redirect would just fail the same way. That one requires
  // adding the domain in the Firebase Console (Authentication > Settings >
  // Authorized domains), not a client-side fallback.
  const POPUP_FALLBACK_CODES = new Set([
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment'
  ]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (isEmbeddedInIframe()) {
      await signInWithRedirect(auth, googleProvider);
      return; // page navigates away; redirect result is handled on return
    }

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      const profile = await fetchProfileByUid(u.uid, u.email || '', u.displayName || undefined);
      setUser(u);
      setUserProfile(profile);
      logActivity(u.uid, u.email || '', 'User logged in with Google');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code && POPUP_FALLBACK_CODES.has(code)) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isOwner,
        authError,
        signUp,
        login,
        signInWithGoogle,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
