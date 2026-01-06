import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'user' as UserRole
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const usersStr = localStorage.getItem('kb_users');
    const passwordsStr = localStorage.getItem('kb_passwords');
    
    if (usersStr) setUsers(JSON.parse(usersStr));
    if (passwordsStr) setPasswords(JSON.parse(passwordsStr));
  };

  const saveUsers = (updatedUsers: User[], updatedPasswords?: Record<string, string>) => {
    localStorage.setItem('kb_users', JSON.stringify(updatedUsers));
    if (updatedPasswords) {
      localStorage.setItem('kb_passwords', JSON.stringify(updatedPasswords));
    }
    setUsers(updatedUsers);
    if (updatedPasswords) setPasswords(updatedPasswords);
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName || !newUser.email) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast({
        title: "Ошибка",
        description: "Пользователь с таким логином уже существует",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      role: newUser.role,
      fullName: newUser.fullName,
      email: newUser.email
    };

    const updatedPasswords = { ...passwords, [newUser.username]: newUser.password };
    
    saveUsers([...users, user], updatedPasswords);
    setIsAddDialogOpen(false);
    setNewUser({ username: '', password: '', fullName: '', email: '', role: 'user' });
    
    toast({
      title: "Успешно!",
      description: "Пользователь добавлен"
    });
  };

  const handleEditUser = () => {
    if (!editingUser || !editingUser.username || !editingUser.fullName || !editingUser.email) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
    saveUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setEditingUser(null);
    
    toast({
      title: "Успешно!",
      description: "Пользователь обновлен"
    });
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (users.length === 1) {
      toast({
        title: "Ошибка",
        description: "Нельзя удалить последнего пользователя",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    const updatedPasswords = { ...passwords };
    delete updatedPasswords[username];
    
    saveUsers(updatedUsers, updatedPasswords);
    
    toast({
      title: "Удалено",
      description: "Пользователь удален"
    });
  };

  const handleResetPassword = (username: string) => {
    const newPassword = prompt(`Введите новый пароль для пользователя ${username}:`);
    
    if (newPassword && newPassword.length >= 6) {
      const updatedPasswords = { ...passwords, [username]: newPassword };
      localStorage.setItem('kb_passwords', JSON.stringify(updatedPasswords));
      setPasswords(updatedPasswords);
      
      toast({
        title: "Успешно!",
        description: `Пароль для ${username} изменен`
      });
    } else if (newPassword) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-2 shadow-xl">
        <CardHeader className="gradient-bg text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Icon name="Users" size={32} />
                Управление пользователями
              </CardTitle>
              <CardDescription className="text-white/80 mt-2">
                Добавляйте, редактируйте и удаляйте пользователей системы
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary">
                  <Icon name="UserPlus" size={20} className="mr-2" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Добавить пользователя</DialogTitle>
                  <DialogDescription>
                    Создайте нового пользователя системы
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-username">Логин *</Label>
                    <Input
                      id="new-username"
                      placeholder="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Пароль *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-fullname">Полное имя *</Label>
                    <Input
                      id="new-fullname"
                      placeholder="Иван Иванов"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-email">Email *</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-role">Роль</Label>
                    <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddUser} className="w-full gradient-bg">
                    <Icon name="UserPlus" size={18} className="mr-2" />
                    Создать пользователя
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                      }`}>
                        <Icon name={user.role === 'admin' ? 'Shield' : 'User'} size={24} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{user.fullName}</h3>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <Icon name="AtSign" size={14} className="inline mr-1" />
                          {user.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Icon name="Mail" size={14} className="inline mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user.username)}
                      >
                        <Icon name="Key" size={16} className="mr-1" />
                        Сменить пароль
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser({ ...user });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Icon name="Edit" size={16} className="mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon name="Trash2" size={16} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените информацию о пользователе
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Логин</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Логин нельзя изменить</p>
              </div>
              <div>
                <Label htmlFor="edit-fullname">Полное имя *</Label>
                <Input
                  id="edit-fullname"
                  placeholder="Иван Иванов"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="user@example.com"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Роль</Label>
                <Select value={editingUser.role} onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Пользователь</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditUser} className="w-full gradient-bg">
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить изменения
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
