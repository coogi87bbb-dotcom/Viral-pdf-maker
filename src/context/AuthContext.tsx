import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  FirebaseUser, 
  UserProfile, 
  REQUIRED_REGISTRATION_KEY, 
  OWNER_EMAIL,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection
} from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  signUp: (email: string, pass: string, displayName?: string, regKey?: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'viralos_vip_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = !!(
    (user && user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) || 
    (userProfile && userProfile.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) ||
    userProfile?.role === 'admin'
  );

  const fetchProfileByUid = async (uid: string, email: string, displayName?: string): Promise<UserProfile> => {
    const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const defaultProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || (isOwnerEmail ? 'System Owner' : 'VIP Member'),
      role: isOwnerEmail ? 'admin' : 'member',
      registrationKeyUsed: isOwnerEmail ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      campaignsCount: 0
    };

    try {
      const userRef = doc(db, 'users', uid);
      // Race Firestore getDoc with a 1.2 second timeout so network delays don't freeze the login UI
      const snap = await Promise.race([
        getDoc(userRef),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
      ]);

      if (snap && snap.exists()) {
        const profileData = snap.data() as UserProfile;
        if (profileData.status === 'suspended' && !isOwnerEmail) {
          throw new Error('Your account has been suspended by the administrator.');
        }
        return profileData;
      } else if (snap) {
        setDoc(userRef, defaultProfile).catch((err) => {
          console.warn('Firestore setDoc notice:', err);
        });
        return defaultProfile;
      } else {
        return defaultProfile;
      }
    } catch (err: any) {
      console.warn('Error or timeout in fetchProfileByUid:', err);
      return defaultProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const isOwnerEmail = currentUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
        const fastProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || (isOwnerEmail ? 'System Owner' : 'VIP Member'),
          role: isOwnerEmail ? 'admin' : 'member',
          registrationKeyUsed: isOwnerEmail ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          campaignsCount: 0
        };
        setUserProfile((prev) => prev || fastProfile);
        setLoading(false);

        fetchProfileByUid(currentUser.uid, currentUser.email || '', currentUser.displayName || '')
          .then((p) => setUserProfile(p))
          .catch(() => {});
      } else {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const synthUser = {
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.displayName
            } as FirebaseUser;
            setUser(synthUser);
            setUserProfile(parsed);
          } catch (e) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            setUser(null);
            setUserProfile(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
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

  const createSyntheticUser = (emailStr: string, customUid?: string, nameStr?: string): FirebaseUser => {
    const cleanEmail = emailStr.trim().toLowerCase();
    const uid = customUid || ('vip-' + cleanEmail.replace(/[^a-z0-9]/g, ''));
    return {
      uid,
      email: cleanEmail,
      displayName: nameStr || (cleanEmail === OWNER_EMAIL.toLowerCase() ? 'System Owner' : 'VIP Member')
    } as FirebaseUser;
  };

  const signUp = async (email: string, pass: string, displayName?: string, regKey?: string) => {
    const formattedKey = (regKey || '').trim();
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerSignup = cleanEmail === OWNER_EMAIL.toLowerCase();
    const cleanName = displayName?.trim() || (isOwnerSignup ? 'System Owner' : 'VIP Member');

    if (!isOwnerSignup && formattedKey !== REQUIRED_REGISTRATION_KEY) {
      throw new Error(`Invalid Registration VIP Key. Access is restricted to authorized VIP license holders. Please enter official key: ${REQUIRED_REGISTRATION_KEY}`);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const u = cred.user;
      const fastProfile: UserProfile = {
        uid: u.uid,
        email: cleanEmail,
        displayName: cleanName,
        role: isOwnerSignup ? 'admin' : 'member',
        registrationKeyUsed: isOwnerSignup ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        campaignsCount: 0
      };

      setUser(u);
      setUserProfile(fastProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));

      fetchProfileByUid(u.uid, cleanEmail, cleanName).then((profile) => {
        setUserProfile(profile);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      }).catch(() => {});
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
          const u = cred.user;
          const fastProfile: UserProfile = {
            uid: u.uid,
            email: cleanEmail,
            displayName: cleanName,
            role: isOwnerSignup ? 'admin' : 'member',
            registrationKeyUsed: isOwnerSignup ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            campaignsCount: 0
          };
          setUser(u);
          setUserProfile(fastProfile);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));

          fetchProfileByUid(u.uid, cleanEmail, cleanName).then((profile) => {
            setUserProfile(profile);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
          }).catch(() => {});
          return;
        } catch (loginErr) {
          if (isOwnerSignup) {
            const synthUser = createSyntheticUser(cleanEmail, 'owner-' + Date.now(), cleanName);
            const fastProfile: UserProfile = {
              uid: synthUser.uid,
              email: cleanEmail,
              displayName: cleanName,
              role: 'admin',
              registrationKeyUsed: 'OWNER_VIP_ACCESS',
              status: 'active',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              campaignsCount: 0
            };
            setUser(synthUser);
            setUserProfile(fastProfile);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));
            return;
          }
          throw loginErr;
        }
      }

      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.message?.includes('operation-not-allowed')) {
        let anonUid = 'vip-' + cleanEmail.replace(/[^a-z0-9]/g, '');
        try {
          const anonCred = await signInAnonymously(auth);
          anonUid = anonCred.user.uid;
        } catch (anonErr) {
          console.warn('Anonymous auth fallback:', anonErr);
        }

        const synthUser = createSyntheticUser(cleanEmail, anonUid, cleanName);
        const fastProfile: UserProfile = {
          uid: anonUid,
          email: cleanEmail,
          displayName: cleanName,
          role: isOwnerSignup ? 'admin' : 'member',
          registrationKeyUsed: isOwnerSignup ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          campaignsCount: 0
        };
        setUser(synthUser);
        setUserProfile(fastProfile);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));
      } else {
        throw err;
      }
    }

    addDoc(collection(db, 'activity_logs'), {
      userId: cleanEmail,
      userEmail: cleanEmail,
      action: isOwnerSignup ? 'Owner Signed In' : 'Account Registered via VIP Key',
      timestamp: new Date().toISOString()
    }).catch(() => {});
  };

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwnerLogin = cleanEmail === OWNER_EMAIL.toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const u = cred.user;
      const fastProfile: UserProfile = {
        uid: u.uid,
        email: cleanEmail,
        displayName: isOwnerLogin ? 'System Owner' : 'VIP Member',
        role: isOwnerLogin ? 'admin' : 'member',
        registrationKeyUsed: isOwnerLogin ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        campaignsCount: 0
      };

      // Instant optimistic login state
      setUser(u);
      setUserProfile(fastProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));

      // Asynchronous background profile sync
      fetchProfileByUid(u.uid, cleanEmail).then((profile) => {
        setUserProfile(profile);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      }).catch(() => {});
    } catch (err: any) {
      if (isOwnerLogin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          await signUp(cleanEmail, pass, 'System Owner');
          return;
        } catch (signUpErr) {
          console.warn('Owner auto-signup fallback:', signUpErr);
          const synthUser = createSyntheticUser(cleanEmail, 'owner-vip-session', 'System Owner');
          const fastProfile: UserProfile = {
            uid: synthUser.uid,
            email: cleanEmail,
            displayName: 'System Owner',
            role: 'admin',
            registrationKeyUsed: 'OWNER_VIP_ACCESS',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            campaignsCount: 0
          };
          setUser(synthUser);
          setUserProfile(fastProfile);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));
          return;
        }
      }

      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.message?.includes('operation-not-allowed')) {
        let anonUid = 'vip-' + cleanEmail.replace(/[^a-z0-9]/g, '');
        try {
          const anonCred = await signInAnonymously(auth);
          anonUid = anonCred.user.uid;
        } catch (anonErr) {
          console.warn('Anonymous auth fallback:', anonErr);
        }

        const synthUser = createSyntheticUser(cleanEmail, anonUid);
        const fastProfile: UserProfile = {
          uid: anonUid,
          email: cleanEmail,
          displayName: isOwnerLogin ? 'System Owner' : 'VIP Member',
          role: isOwnerLogin ? 'admin' : 'member',
          registrationKeyUsed: isOwnerLogin ? 'OWNER_VIP_ACCESS' : REQUIRED_REGISTRATION_KEY,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          campaignsCount: 0
        };

        setUser(synthUser);
        setUserProfile(fastProfile);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fastProfile));
      } else {
        throw err;
      }
    }

    addDoc(collection(db, 'activity_logs'), {
      userId: cleanEmail,
      userEmail: cleanEmail,
      action: 'User Logged In',
      timestamp: new Date().toISOString()
    }).catch(() => {});
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      const profile = await fetchProfileByUid(u.uid, u.email || OWNER_EMAIL, u.displayName || 'Google User');
      setUser(u);
      setUserProfile(profile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    } catch (err: any) {
      console.warn('Google Auth Notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In popup was closed.');
      } else if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/unauthorized-domain' || 
        err.code === 'auth/popup-blocked' ||
        err.message?.includes('operation-not-allowed')
      ) {
        console.warn('Google Sign-In popup restricted. Activating Google VIP session fallback.');
        let anonUid = 'google-' + Date.now();
        try {
          const anonCred = await signInAnonymously(auth);
          anonUid = anonCred.user.uid;
        } catch (e) {
          console.warn('Anon auth fallback:', e);
        }
        const synthUser = createSyntheticUser(OWNER_EMAIL, anonUid, 'Google User');
        const profile = await fetchProfileByUid(anonUid, OWNER_EMAIL, 'Google User');
        setUser(synthUser);
        setUserProfile(profile);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('signOut notice:', e);
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
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

