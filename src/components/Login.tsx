import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
            Войдите в систему для доступа к базе знаний
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
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

            <Button type="submit" className="w-full h-12 gradient-bg hover:opacity-90 transition-opacity rounded-xl text-base font-semibold">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}