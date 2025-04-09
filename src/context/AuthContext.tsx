import React, { createContext, useContext, useEffect, useState } from 'react';
import { getApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes, signInWithEmailAndPassword } from '@react-native-firebase/auth';


interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  isEmailVerified: () => Promise<boolean>;
  reloadUser: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseAuth = auth(getApp());

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.sendEmailVerification();
    } catch (error) {
      console.error('Erreur d’inscription :', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      console.error('Erreur de connexion :', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    if (firebaseAuth.currentUser) {
      try {
        await firebaseAuth.currentUser.sendEmailVerification();
      } catch (error) {
        console.error('Erreur envoi email de vérification :', error);
        throw error;
      }
    }
  };

  const isEmailVerified = async (): Promise<boolean> => {
    if (firebaseAuth.currentUser) {
      try {
        await firebaseAuth.currentUser.reload();
        return firebaseAuth.currentUser.emailVerified;
      } catch (error) {
        console.error('Erreur vérification email :', error);
        return false;
      }
    }
    return false;
  };

  const reloadUser = async () => {
    if (firebaseAuth.currentUser) {
      try {
        await firebaseAuth.currentUser.reload();
        setUser(firebaseAuth.currentUser);
      } catch (error) {
        console.error('Erreur rechargement utilisateur :', error);
      }
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Erreur reset mot de passe :', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        sendEmailVerification,
        isEmailVerified,
        reloadUser,
        sendPasswordResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
