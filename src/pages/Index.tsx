import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Login from '@/components/Login';
import KnowledgeBase from '@/components/KnowledgeBase';
import AdminPanel from '@/components/AdminPanel';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">База знаний</h1>
              <p className="text-xs text-muted-foreground">Система управления знаниями</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
              <Icon name={user?.role === 'admin' ? 'Shield' : 'User'} size={18} className="text-primary" />
              <div className="text-sm">
                <p className="font-semibold">{user?.fullName}</p>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Badge>
              </div>
            </div>
            {user?.role === 'admin' && (
              <Button
                variant={showAdminPanel ? 'default' : 'outline'}
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                <Icon name="Users" size={18} className="mr-2" />
                {showAdminPanel ? 'База знаний' : 'Управление'}
              </Button>
            )}
            <Button variant="ghost" onClick={logout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>
      
      {showAdminPanel && user?.role === 'admin' ? (
        <AdminPanel />
      ) : (
        <KnowledgeBase />
      )}
    </div>
  );
};

export default Index;
