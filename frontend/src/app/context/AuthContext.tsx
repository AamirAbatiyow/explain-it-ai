import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  name: string;
  email: string;
  username?: string;
  age: string;
  interests: string[];
  password?: string; // Only for checking, usually hashed in real backend
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (data: UserData, password: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("explainit_session");
    if (savedSession) {
      setUser(JSON.parse(savedSession));
      setIsAuthenticated(true);
    }
  }, []);

  const signup = (data: UserData, password: string) => {
    const newUser = { ...data, password }; // storing password in plain text for local mock only
    
    // Save to "database" of accounts
    const existingAccounts = JSON.parse(localStorage.getItem("explainit_accounts") || "[]");
    const updatedAccounts = [...existingAccounts, newUser];
    localStorage.setItem("explainit_accounts", JSON.stringify(updatedAccounts));

    // Create session
    createSession(newUser);
  };

  const login = (email: string, password: string): boolean => {
    const accounts = JSON.parse(localStorage.getItem("explainit_accounts") || "[]");
    const foundAccount = accounts.find((acc: any) => acc.email === email && acc.password === password);

    if (foundAccount) {
      createSession(foundAccount);
      return true;
    }
    return false;
  };

  const createSession = (userData: UserData) => {
    const { password, ...safeUser } = userData; // Don't put password in session state
    setUser(safeUser as UserData);
    setIsAuthenticated(true);
    localStorage.setItem("explainit_session", JSON.stringify(safeUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("explainit_session");
  };

  const updateProfile = (data: Partial<UserData>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem("explainit_session", JSON.stringify(updatedUser));
    
    // Also update in accounts list
    const accounts = JSON.parse(localStorage.getItem("explainit_accounts") || "[]");
    const updatedAccounts = accounts.map((acc: any) => 
      acc.email === user.email ? { ...acc, ...data } : acc
    );
    localStorage.setItem("explainit_accounts", JSON.stringify(updatedAccounts));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
