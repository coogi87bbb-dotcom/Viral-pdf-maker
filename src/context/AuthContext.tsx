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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfileByUid(currentUser.uid, currentUser.email || '', currentUser.displayName || '')
          .then((p) => setUserProfile(p))
          .catch(() => setUserProfile(null))
          .finally(() => setLoading(false));
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const u = res.user;
    const profile = await fetchProfileByUid(u.uid, u.email || '', u.displayName || undefined);
    setUser(u);
    setUserProfile(profile);
    logActivity(u.uid, u.email || '', 'User logged in with Google');
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
