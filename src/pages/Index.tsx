import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Login from '@/components/Login';
import KnowledgeBase from '@/components/KnowledgeBase';
import AdminPanel from '@/components/AdminPanel';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem('app_zoom');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    document.documentElement.style.zoom = zoom.toString();
    localStorage.setItem('app_zoom', zoom.toString());
  }, [zoom]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const zoomLevels = [
    { value: 0.75, label: '75%' },
    { value: 0.85, label: '85%' },
    { value: 1, label: '100%' },
    { value: 1.1, label: '110%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' }
  ];

  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Сервис Клик</h1>
              <p className="text-xs text-muted-foreground">База знаний сервисного центра</p>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Icon name="ZoomIn" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {zoomLevels.map((level) => (
                  <DropdownMenuItem
                    key={level.value}
                    onClick={() => setZoom(level.value)}
                    className={zoom === level.value ? 'bg-accent' : ''}
                  >
                    <Icon 
                      name={zoom === level.value ? 'Check' : 'Circle'} 
                      size={16} 
                      className="mr-2"
                    />
                    {level.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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