import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, register, resetPassword } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      if (!username || !password) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля",
          variant: "destructive"
        });
        return;
      }

      const success = login(username, password);
      
      if (success) {
        toast({
          title: "Успешно!",
          description: "Вы вошли в систему"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный логин или пароль",
          variant: "destructive"
        });
      }
    } else if (mode === 'register') {
      if (!username || !password || !fullName || !email) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля",
          variant: "destructive"
        });
        return;
      }

      const result = register(username, password, fullName, email);
      
      if (result.success) {
        toast({
          title: "Успешно!",
          description: result.message + '. Теперь вы можете войти'
        });
        setMode('login');
        setPassword('');
        setFullName('');
        setEmail('');
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleResetPassword = () => {
    if (!resetEmail) {
      toast({
        title: "Ошибка",
        description: "Введите email",
        variant: "destructive"
      });
      return;
    }

    const result = resetPassword(resetEmail);
    
    if (result.success) {
      toast({
        title: "Успешно!",
        description: result.message
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } else {
      toast({
        title: "Ошибка",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-2xl animate-fade-in rounded-3xl">
        <CardHeader className="text-center space-y-2">
          <img 
            src="https://cdn.poehali.dev/projects/e9eee953-4329-40dd-9bfe-344b210af164/files/415c8bfd-9b0d-433e-8f62-b84e5b0f3825.jpg" 
            alt="Сервис Клик"
            className="mx-auto w-24 h-24 rounded-2xl object-cover mb-4 shadow-lg"
          />
          <CardTitle className="text-4xl font-bold gradient-text">Сервис Клик</CardTitle>
          <CardDescription className="text-base font-medium">
            {mode === 'login' ? 'Войдите в систему для доступа к базе знаний' : 'Создайте новый аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Полное имя</Label>
                <div className="relative">
                  <Icon name="User" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Иван Иванов"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Icon name="Mail" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ivan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <div className="relative">
                <Icon name="User" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-2 focus:border-primary"
                  autoComplete={mode === 'login' ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsResetDialogOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Забыли пароль?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-12 gradient-bg hover:opacity-90 transition-opacity rounded-xl text-base font-semibold">
              <Icon name={mode === 'login' ? "LogIn" : "UserPlus"} size={18} className="mr-2" />
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setPassword('');
                  setFullName('');
                  setEmail('');
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </form>

          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Восстановление пароля</DialogTitle>
                <DialogDescription>
                  Введите email, указанный при регистрации
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Icon name="Mail" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="ivan@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-2 focus:border-primary"
                    />
                  </div>
                </div>
                <Button onClick={handleResetPassword} className="w-full h-12 gradient-bg hover:opacity-90 rounded-xl">
                  <Icon name="Send" size={18} className="mr-2" />
                  Восстановить пароль
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}