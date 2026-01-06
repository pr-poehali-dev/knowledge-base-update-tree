import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kb_auth_user';
const USERS_STORAGE_KEY = 'kb_users';

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    fullName: 'Администратор',
    email: 'admin@example.com'
  },
  {
    id: '2',
    username: 'user',
    role: 'user',
    fullName: 'Пользователь',
    email: 'user@example.com'
  }
];

const defaultPasswords: Record<string, string> = {
  'admin': 'admin123',
  'user': 'user123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      localStorage.setItem('kb_passwords', JSON.stringify(defaultPasswords));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    const passwordsStr = localStorage.getItem('kb_passwords');
    
    if (!usersStr || !passwordsStr) return false;

    const users: User[] = JSON.parse(usersStr);
    const passwords: Record<string, string> = JSON.parse(passwordsStr);

    const foundUser = users.find(u => u.username === username);
    
    if (foundUser && passwords[username] === password) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
