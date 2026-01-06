import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const initialCategories: Category[] = [
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

const initialFAQs: FAQItem[] = [
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

const iconOptions = [
  'Rocket', 'Settings', 'HelpCircle', 'Link', 'Star', 'Zap', 'UserPlus', 
  'AlertCircle', 'Wrench', 'Book', 'Code', 'Database', 'Shield', 'Users',
  'MessageCircle', 'Package', 'Activity', 'Bell', 'Briefcase', 'Calendar'
];

function SortableCategoryItem({ 
  category, 
  selectedCategory,
  expandedCategories,
  onSelect,
  onToggle,
  onEdit,
  onDelete
}: { 
  category: Category;
  selectedCategory: string | null;
  expandedCategories: string[];
  onSelect: (name: string) => void;
  onToggle: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div className="flex items-center gap-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <Icon name="GripVertical" size={16} className="text-muted-foreground" />
        </div>
        <Button
          variant={selectedCategory === category.name ? 'default' : 'ghost'}
          className="flex-1 justify-start"
          onClick={() => {
            onSelect(category.name);
            if (category.subcategories) {
              onToggle(category.id);
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
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(category)}
        >
          <Icon name="Edit" size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(category.id, category.name)}
        >
          <Icon name="Trash2" size={14} />
        </Button>
      </div>
      {category.subcategories && expandedCategories.includes(category.id) && (
        <div className="ml-6 space-y-1">
          {category.subcategories.map((sub) => (
            <div key={sub.id} className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start"
                onClick={() => onSelect(sub.name)}
              >
                <Icon name={sub.icon as any} size={16} className="mr-2" />
                {sub.name}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => onEdit(sub)}
              >
                <Icon name="Edit" size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(sub.id, sub.name)}
              >
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBase() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1']);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '', category: '', tags: '', image: '', video: '' });
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Folder', parentId: '' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredFAQs = faqs.filter(faq => {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      toast({
        title: "Порядок изменен",
        description: "Категории переставлены"
      });
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) {
      toast({
        title: "Ошибка",
        description: "Заполните вопрос и ответ",
        variant: "destructive"
      });
      return;
    }

    const newFaq: FAQItem = {
      id: Date.now().toString(),
      question: newQuestion.question,
      answer: newQuestion.answer,
      category: newQuestion.category || 'Общие',
      tags: newQuestion.tags.split(',').map(t => t.trim()).filter(t => t),
      image: newQuestion.image || undefined,
      video: newQuestion.video || undefined
    };

    setFaqs([...faqs, newFaq]);
    setIsAddDialogOpen(false);
    setNewQuestion({ question: '', answer: '', category: '', tags: '', image: '', video: '' });
    
    toast({
      title: "Успешно!",
      description: "Вопрос добавлен в базу знаний"
    });
  };

  const handleEditQuestion = () => {
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) {
      toast({
        title: "Ошибка",
        description: "Заполните вопрос и ответ",
        variant: "destructive"
      });
      return;
    }

    setFaqs(faqs.map(faq => faq.id === editingFaq.id ? editingFaq : faq));
    setIsEditDialogOpen(false);
    setEditingFaq(null);
    
    toast({
      title: "Успешно!",
      description: "Вопрос обновлен"
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
    toast({
      title: "Удалено",
      description: "Вопрос удален из базы знаний"
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({
        title: "Ошибка",
        description: "Введите название категории",
        variant: "destructive"
      });
      return;
    }

    const categoryToAdd: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: newCategory.icon,
      count: 0
    };

    if (newCategory.parentId) {
      setCategories(categories.map(cat => {
        if (cat.id === newCategory.parentId) {
          return {
            ...cat,
            subcategories: [...(cat.subcategories || []), categoryToAdd]
          };
        }
        return cat;
      }));
    } else {
      setCategories([...categories, categoryToAdd]);
    }

    setIsCategoryDialogOpen(false);
    setNewCategory({ name: '', icon: 'Folder', parentId: '' });
    
    toast({
      title: "Успешно!",
      description: "Категория добавлена"
    });
  };

  const handleEditCategory = () => {
    if (!editingCategory || !editingCategory.name) {
      toast({
        title: "Ошибка",
        description: "Введите название категории",
        variant: "destructive"
      });
      return;
    }

    const updateCategory = (cats: Category[]): Category[] => {
      return cats.map(cat => {
        if (cat.id === editingCategory.id) {
          return { ...editingCategory };
        }
        if (cat.subcategories) {
          return {
            ...cat,
            subcategories: updateCategory(cat.subcategories)
          };
        }
        return cat;
      });
    };

    setCategories(updateCategory(categories));
    setIsEditCategoryDialogOpen(false);
    setEditingCategory(null);
    
    toast({
      title: "Успешно!",
      description: "Категория обновлена"
    });
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const deleteFromCategories = (cats: Category[]): Category[] => {
      return cats
        .filter(cat => cat.id !== categoryId)
        .map(cat => ({
          ...cat,
          subcategories: cat.subcategories ? deleteFromCategories(cat.subcategories) : undefined
        }));
    };

    setCategories(deleteFromCategories(categories));
    
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    }
    
    toast({
      title: "Удалено",
      description: "Категория удалена"
    });
  };

  const openEditDialog = (faq: FAQItem) => {
    setEditingFaq({ ...faq });
    setIsEditDialogOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditCategoryDialogOpen(true);
  };

  const getAllCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.subcategories) {
        result = [...result, ...getAllCategories(cat.subcategories)];
      }
    });
    return result;
  };

  const allCategories = getAllCategories(categories);

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Добавить новый вопрос</DialogTitle>
                <DialogDescription>
                  Заполните форму чтобы добавить вопрос в базу знаний
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Вопрос *</Label>
                  <Input
                    id="question"
                    placeholder="Введите вопрос..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Ответ *</Label>
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
                  <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Теги (через запятую)</Label>
                  <Input
                    id="tags"
                    placeholder="тег1, тег2, тег3"
                    value={newQuestion.tags}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">URL изображения</Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    value={newQuestion.image}
                    onChange={(e) => setNewQuestion({ ...newQuestion, image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="video">URL видео</Label>
                  <Input
                    id="video"
                    placeholder="https://..."
                    value={newQuestion.video}
                    onChange={(e) => setNewQuestion({ ...newQuestion, video: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddQuestion} className="w-full gradient-bg">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить вопрос
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Редактировать вопрос</DialogTitle>
              <DialogDescription>
                Внесите изменения в вопрос
              </DialogDescription>
            </DialogHeader>
            {editingFaq && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-question">Вопрос *</Label>
                  <Input
                    id="edit-question"
                    placeholder="Введите вопрос..."
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-answer">Ответ *</Label>
                  <Textarea
                    id="edit-answer"
                    placeholder="Введите ответ..."
                    rows={4}
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Категория</Label>
                  <Select value={editingFaq.category} onValueChange={(value) => setEditingFaq({ ...editingFaq, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-tags">Теги (через запятую)</Label>
                  <Input
                    id="edit-tags"
                    placeholder="тег1, тег2, тег3"
                    value={editingFaq.tags.join(', ')}
                    onChange={(e) => setEditingFaq({ ...editingFaq, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image">URL изображения</Label>
                  <Input
                    id="edit-image"
                    placeholder="https://..."
                    value={editingFaq.image || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, image: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-video">URL видео</Label>
                  <Input
                    id="edit-video"
                    placeholder="https://..."
                    value={editingFaq.video || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, video: e.target.value || undefined })}
                  />
                </div>
                <Button onClick={handleEditQuestion} className="w-full gradient-bg">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Добавить категорию</DialogTitle>
              <DialogDescription>
                Создайте новую категорию или подкатегорию
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cat-name">Название *</Label>
                <Input
                  id="cat-name"
                  placeholder="Название категории"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cat-icon">Иконка</Label>
                <Select value={newCategory.icon} onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <Icon name={icon as any} size={16} />
                          {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cat-parent">Родительская категория (опционально)</Label>
                <Select value={newCategory.parentId} onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Без родителя (корневая)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без родителя (корневая)</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCategory} className="w-full gradient-bg">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить категорию
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Редактировать категорию</DialogTitle>
              <DialogDescription>
                Измените название или иконку категории
              </DialogDescription>
            </DialogHeader>
            {editingCategory && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-cat-name">Название *</Label>
                  <Input
                    id="edit-cat-name"
                    placeholder="Название категории"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cat-icon">Иконка</Label>
                  <Select value={editingCategory.icon} onValueChange={(value) => setEditingCategory({ ...editingCategory, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <Icon name={icon as any} size={16} />
                            {icon}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleEditCategory} className="w-full gradient-bg">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="sticky top-4 border-2 shadow-lg animate-fade-in hover-scale">
              <CardHeader className="gradient-bg text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="FolderTree" size={24} />
                    <CardTitle>Каталог</CardTitle>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Icon name="Plus" size={16} />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
                <CardDescription className="text-white/80">
                  Перетащите для изменения порядка
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
                    <Badge variant="secondary" className="ml-auto">{faqs.length}</Badge>
                  </Button>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={categories.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          selectedCategory={selectedCategory}
                          expandedCategories={expandedCategories}
                          onSelect={setSelectedCategory}
                          onToggle={toggleCategory}
                          onEdit={openEditCategoryDialog}
                          onDelete={handleDeleteCategory}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
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
                      <div className="pl-14 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Icon name="ThumbsUp" size={16} className="mr-1" />
                          Полезно
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Share2" size={16} className="mr-1" />
                          Поделиться
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Icon name="Edit" size={16} className="mr-1" />
                          Редактировать
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteQuestion(faq.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} className="mr-1" />
                          Удалить
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
