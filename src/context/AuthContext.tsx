import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {getCurrentUser, signIn, signUp, confirmSignUp, signOut} from 'aws-amplify/auth';

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignUp: (email: string, password: string) => Promise<void>;
  handleConfirmSignUp: (email: string, code: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session when app starts
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || '',
      });
    } catch {
      // No current session — user is not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp({
      username: email,
      password,
    });
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn({
      username: email,
      password,
    });
    // After successful sign-in, fetch user info
    await checkCurrentUser();
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        handleSignIn,
        handleSignUp,
        handleConfirmSignUp,
        handleSignOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
