import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  image?: string;
  video?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories?: Category[];
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Начало работы',
    icon: 'Rocket',
    count: 8,
    subcategories: [
      { id: '1-1', name: 'Регистрация', icon: 'UserPlus', count: 3 },
      { id: '1-2', name: 'Первые шаги', icon: 'FootprintsIcon', count: 5 }
    ]
  },
  {
    id: '2',
    name: 'Функции',
    icon: 'Settings',
    count: 12,
    subcategories: [
      { id: '2-1', name: 'Основные', icon: 'Star', count: 7 },
      { id: '2-2', name: 'Продвинутые', icon: 'Zap', count: 5 }
    ]
  },
  {
    id: '3',
    name: 'Решение проблем',
    icon: 'HelpCircle',
    count: 15,
    subcategories: [
      { id: '3-1', name: 'Частые ошибки', icon: 'AlertCircle', count: 8 },
      { id: '3-2', name: 'Технические вопросы', icon: 'Wrench', count: 7 }
    ]
  },
  {
    id: '4',
    name: 'Интеграции',
    icon: 'Link',
    count: 10
  }
];

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Как зарегистрироваться в системе?',
    answer: 'Для регистрации нажмите кнопку "Регистрация" в правом верхнем углу. Введите email, придумайте надежный пароль и подтвердите его. После этого на почту придет письмо с подтверждением.',
    category: 'Начало работы',
    tags: ['регистрация', 'аккаунт'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'
  },
  {
    id: '2',
    question: 'Как восстановить пароль?',
    answer: 'На странице входа нажмите "Забыли пароль?". Введите email, указанный при регистрации. Вам придет письмо со ссылкой для сброса пароля. Перейдите по ссылке и создайте новый пароль.',
    category: 'Начало работы',
    tags: ['пароль', 'безопасность']
  },
  {
    id: '3',
    question: 'Какие форматы файлов поддерживаются?',
    answer: 'Система поддерживает изображения (JPG, PNG, GIF, WebP), видео (MP4, WebM), документы (PDF, DOC, DOCX) и архивы (ZIP, RAR). Максимальный размер файла - 50 МБ.',
    category: 'Функции',
    tags: ['файлы', 'загрузка'],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: '4',
    question: 'Как использовать поиск?',
    answer: 'Введите ключевое слово в поле поиска. Система ищет по вопросам, ответам и тегам. Используйте фильтры по категориям для более точного результата. Поиск работает в режиме реального времени.',
    category: 'Функции',
    tags: ['поиск', 'навигация'],
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400'
  },
  {
    id: '5',
    question: 'Что делать если возникла ошибка 404?',
    answer: 'Ошибка 404 означает, что страница не найдена. Проверьте правильность URL. Возможно, страница была удалена или перемещена. Используйте поиск или вернитесь на главную страницу.',
    category: 'Решение проблем',
    tags: ['ошибка', '404']
  },
  {
    id: '6',
    question: 'Как подключить API?',
    answer: 'Перейдите в раздел "Настройки" → "API". Создайте новый ключ доступа. Используйте документацию API для интеграции. Все запросы должны содержать заголовок Authorization с вашим ключом.',
    category: 'Интеграции',
    tags: ['API', 'разработка'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'
  }
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1']);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '', category: '', image: '', video: '' });

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddQuestion = () => {
    console.log('Добавление вопроса:', newQuestion);
    setIsAddDialogOpen(false);
    setNewQuestion({ question: '', answer: '', category: '', image: '', video: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 gradient-text">База знаний</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Найдите ответы на все ваши вопросы в нашей интерактивной базе знаний
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="flex-1 relative">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Поиск по вопросам, ответам и тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg border-2 focus:border-primary"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity h-12 px-8">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить вопрос
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Добавить новый вопрос</DialogTitle>
                <DialogDescription>
                  Заполните форму чтобы добавить вопрос в базу знаний
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Вопрос</Label>
                  <Input
                    id="question"
                    placeholder="Введите вопрос..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Ответ</Label>
                  <Textarea
                    id="answer"
                    placeholder="Введите ответ..."
                    rows={4}
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    placeholder="Выберите категорию..."
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">URL изображения (опционально)</Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    value={newQuestion.image}
                    onChange={(e) => setNewQuestion({ ...newQuestion, image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="video">URL видео (опционально)</Label>
                  <Input
                    id="video"
                    placeholder="https://..."
                    value={newQuestion.video}
                    onChange={(e) => setNewQuestion({ ...newQuestion, video: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddQuestion} className="w-full gradient-bg">
                  Добавить вопрос
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="sticky top-4 border-2 shadow-lg animate-fade-in hover-scale">
              <CardHeader className="gradient-bg text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FolderTree" size={24} />
                  Каталог
                </CardTitle>
                <CardDescription className="text-white/80">
                  Навигация по темам
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <Icon name="Home" size={18} className="mr-2" />
                    Все категории
                    <Badge variant="secondary" className="ml-auto">{mockFAQs.length}</Badge>
                  </Button>
                  {mockCategories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <Button
                        variant={selectedCategory === category.name ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCategory(category.name);
                          if (category.subcategories) {
                            toggleCategory(category.id);
                          }
                        }}
                      >
                        <Icon name={category.icon as any} size={18} className="mr-2" />
                        {category.name}
                        {category.subcategories && (
                          <Icon
                            name={expandedCategories.includes(category.id) ? 'ChevronDown' : 'ChevronRight'}
                            size={16}
                            className="ml-auto"
                          />
                        )}
                        {!category.subcategories && (
                          <Badge variant="secondary" className="ml-auto">{category.count}</Badge>
                        )}
                      </Button>
                      {category.subcategories && expandedCategories.includes(category.id) && (
                        <div className="ml-6 space-y-1">
                          {category.subcategories.map((sub) => (
                            <Button
                              key={sub.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(sub.name)}
                            >
                              <Icon name={sub.icon as any} size={16} className="mr-2" />
                              {sub.name}
                              <Badge variant="secondary" className="ml-auto text-xs">{sub.count}</Badge>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between animate-fade-in">
              <p className="text-muted-foreground">
                Найдено результатов: <span className="font-bold text-foreground">{filteredFAQs.length}</span>
              </p>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <Icon name="X" size={16} className="mr-1" />
                  Сбросить фильтр
                </Button>
              )}
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-2 rounded-xl bg-white shadow-md hover:shadow-xl transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-start gap-4 text-left flex-1">
                      <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                        <Icon name="MessageCircleQuestion" size={24} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {faq.question}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Icon name="Folder" size={12} className="mr-1" />
                            {faq.category}
                          </Badge>
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <p className="text-base leading-relaxed text-foreground/80 pl-14">
                        {faq.answer}
                      </p>
                      {faq.image && (
                        <div className="pl-14">
                          <img
                            src={faq.image}
                            alt="Иллюстрация"
                            className="rounded-lg shadow-md w-full max-w-md hover-scale"
                          />
                        </div>
                      )}
                      {faq.video && (
                        <div className="pl-14">
                          <div className="aspect-video rounded-lg overflow-hidden shadow-md max-w-2xl">
                            <iframe
                              src={faq.video}
                              title="Видео"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                      <div className="pl-14 flex gap-2">
                        <Button variant="outline" size="sm">
                          <Icon name="ThumbsUp" size={16} className="mr-1" />
                          Полезно
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Share2" size={16} className="mr-1" />
                          Поделиться
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQs.length === 0 && (
              <Card className="text-center py-12 border-2 animate-fade-in">
                <CardContent>
                  <Icon name="SearchX" size={64} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground mb-6">
                    Попробуйте изменить поисковый запрос или выбрать другую категорию
                  </p>
                  <Button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                    Сбросить все фильтры
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
