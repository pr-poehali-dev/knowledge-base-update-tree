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
  register: (username: string, password: string, fullName: string, email: string) => { success: boolean; message: string };
  resetPassword: (email: string) => { success: boolean; message: string };
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

  const register = (username: string, password: string, fullName: string, email: string): { success: boolean; message: string } => {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    const passwordsStr = localStorage.getItem('kb_passwords');
    
    if (!usersStr || !passwordsStr) {
      return { success: false, message: 'Ошибка системы' };
    }

    const users: User[] = JSON.parse(usersStr);
    const passwords: Record<string, string> = JSON.parse(passwordsStr);

    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Пользователь с таким логином уже существует' };
    }

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email уже используется' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      role: 'user',
      fullName,
      email
    };

    users.push(newUser);
    passwords[username] = password;

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem('kb_passwords', JSON.stringify(passwords));

    return { success: true, message: 'Регистрация успешна' };
  };

  const resetPassword = (email: string): { success: boolean; message: string } => {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    
    if (!usersStr) {
      return { success: false, message: 'Ошибка системы' };
    }

    const users: User[] = JSON.parse(usersStr);
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, message: 'Пользователь с таким email не найден' };
    }

    return { success: true, message: `Временный пароль для ${user.username}: temp${user.id}` };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, isAuthenticated: !!user }}>
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