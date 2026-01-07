import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
    name: 'Общие вопросы',
    icon: 'Info',
    count: 9
  },
  {
    id: '2',
    name: 'Вопросы о ремонте',
    icon: 'Wrench',
    count: 5
  },
  {
    id: '3',
    name: 'Ремонт смартфонов и планшетов',
    icon: 'Smartphone',
    count: 6
  },
  {
    id: '4',
    name: 'Ремонт ноутбуков и компьютеров',
    icon: 'Laptop',
    count: 8
  },
  {
    id: '5',
    name: 'Ремонт принтеров и МФУ',
    icon: 'Printer',
    count: 6
  },
  {
    id: '6',
    name: 'Ремонт телевизоров',
    icon: 'Tv',
    count: 5
  }
];

const initialFAQs: FAQItem[] = [
  // Общие вопросы
  { id: '1', question: 'Какой режим работы сервиса?', answer: 'С понедельника по пятницу, с 9.00 до 19.00 часов. В субботу с 10.00 до 16.00 часов. Воскресенье - выходной.', category: 'Общие вопросы', tags: ['режим работы', 'график'] },
  { id: '2', question: 'Сколько делается диагностика оборудования?', answer: 'Диагностика такого оборудования как: смартфоны, планшеты – делается в течении 1 рабочего дня. Диагностика компьютеров, ноутбуков, телевизоров, принтеров и МФУ – делается от 1 до 3 рабочих дней. Но мы всегда стараемся сделать диагностику, как можно быстрее.', category: 'Общие вопросы', tags: ['диагностика', 'сроки'] },
  { id: '3', question: 'Почему мастер не общается с клиентами?', answer: 'Согласно регламенту компании все общение с клиентами осуществляют менеджеры. Они занимаются сопровождением клиента по вопросам ремонта, на всех этапах выполнения заказа. Мастер производит ремонт приходящих изделий в ремонт. В связи с большим потоком заказов, мастер не может производить ремонт оборудования и общаться с клиентами одновременно. Квалификация менеджеров позволяет вести сопровождение клиента на всех этапах выполнения заказа и решать все вопросы связанные с работой сервисного центра.', category: 'Общие вопросы', tags: ['мастер', 'менеджер', 'общение'] },
  { id: '4', question: 'Почему ремонт затянулся?', answer: 'Иногда в оборудовании присутствуют скрытые дефекты, которые невозможно было определить при первичном осмотре. Некоторые дополнительные неисправности можно определить только тогда, кода будет произведен ремонт изделия. В некоторых случаях бывает задержка поставки деталей на заказ по вине транспортной компании. Наши менеджеры стараются оперативно решать все возникающие вопросы, а мастера максимально быстро производить ремонт.', category: 'Общие вопросы', tags: ['сроки', 'задержка'] },
  { id: '5', question: 'Если после диагностики ремонт техники не целесообразен, могу ли я отказаться от ремонта?', answer: 'Да, но только в случае если ремонт еще не начат. Если ремонт согласован и начат, то при отказе от ремонта клиенту будет выставлен счет за разборку, сборку устройства. А также монтаж и демонтаж установленных запчастей, согласно прейскуранту.', category: 'Общие вопросы', tags: ['отказ', 'диагностика'] },
  { id: '6', question: 'Возможен ли срочный ремонт за 1-2 часа?', answer: 'К сожалению, загруженность сервисного центра очень высокая. Все заказы делаются после осмотра диагностики от 1 до 3 рабочих дней. Если для ремонта требуется дополнительное время, то сроки ремонта согласовываются менеджером во время телефонного звонка или в письменном виде. В целях контроля качества, все разговоры с клиентами записываются.', category: 'Общие вопросы', tags: ['срочный ремонт', 'сроки'] },
  { id: '7', question: 'Зачем вам мой пароль от смартфона?', answer: 'Вы можете не давать сотрудникам сервисного центра свой пароль от смартфона. Но тогда мы не сможем проверить все функции телефона после ремонта. В дальнейшем может потребоваться дополнительное время, для дополнительного ремонта.', category: 'Общие вопросы', tags: ['пароль', 'смартфон', 'безопасность'] },
  { id: '8', question: 'Почему так важно при каких обстоятельствах произошла поломка устройства?', answer: 'Дополнительная информация о причине возникновения неисправности, очень помогает мастеру при осмотре-диагностике. Дополнительная информация помогает сократить время осматра изделия и принятия решения о возможном ремонте.', category: 'Общие вопросы', tags: ['диагностика', 'информация'] },
  { id: '9', question: 'Может ли другой человек забрать мой заказ?', answer: 'Нет, с клиентом заключается персональный договор оказания услуг. Клиент является уполномоченным лицом для принятия решений по данному договору. Заказ может быть выдан другому лицу, только при наличии у него нотариальной доверенности от клиента.', category: 'Общие вопросы', tags: ['выдача', 'доверенность'] },

  // Вопросы о ремонте
  { id: '10', question: 'Какая гарантия на ремонт?', answer: 'Гарантия стандартная, среди большинства сервисных центров и составляет 30 дней.', category: 'Вопросы о ремонте', tags: ['гарантия'] },
  { id: '11', question: 'Почему вы не возвращаете старую деталь?', answer: 'Возврат неисправной детали клиенту носит заявительный характер. Для возврата неисправной детали клиенту нужно сообщить менеджеру о выдаче неисправной детали, до момента выдачи изделия из ремонта. В противном случае неисправная деталь утилизируется и претензии по ней не принимаются.', category: 'Вопросы о ремонте', tags: ['детали', 'возврат'] },
  { id: '12', question: 'Почему стоимость ремонта высокая?', answer: 'Стоимость ремонта слаживается из стоимости работы и детали. Мы стараемся использовать только оригинальные детали в работе. Высокая квалификация мастера и оригинальные детали дают превосходный результат. Мы работаем напрямую с федеральными поставщиками запчастей. Поэтому стоимость ремонта является приемлемой.', category: 'Вопросы о ремонте', tags: ['цена', 'стоимость'] },
  { id: '13', question: 'До ремонта в телефоне работало всё, а сейчас некоторые функции не работают.', answer: 'Некоторые неисправности могут иметь скрытые дефекты, которые невозможно обнаружить без разборки оборудования и они могут влиять на работу других компонентов, и выполняемых функций. Возможными причинами отказа работоспособности некоторых функций могут являться: заводской брак деталей, нарушение условий эксплуатации, попадание на деталь токопроводящей жидкости, в результате механического воздействие на изделие. В любом случае наш мастер сделает осмотр изделия, а наш менеджер согласует с вами возможные варианты ремонта, если это возможно.', category: 'Вопросы о ремонте', tags: ['функции', 'неисправность'] },
  { id: '14', question: 'Вы поставили оригинальную деталь, но она перестала работать через неделю', answer: 'Современные модели смартфонов имеют сложную конструкцию. Все компоненты между собой взаимосвязаны. Возможными причинами отказа работоспособности детали могут являться: заводской брак, нарушение условий эксплуатации, попадание на деталь токопроводящей жидкости, результатом механическое воздействие на деталь. В любом случае наш мастер сделает осмотр и проверку установленной детали. В случае обнаружения заводского брака, деталь будет замена с продлением гарантийного срока, включая время нахождения оборудования в ремонте.', category: 'Вопросы о ремонте', tags: ['гарантия', 'детали', 'брак'] },

  // Ремонт смартфонов и планшетов
  { id: '15', question: 'Нет изображения на экране? Что делать?', answer: 'В 90% случаев отсутствие изображения на экране смартфона или планшета является неисправность самого экрана. В редких случаях отсутствие изображения может являться причиной механического воздействия на устройство, повреждение коннекторов, шлейфов. Способ устранения неисправности – замена экрана, замена коннекторов и шлейфов. Точное заключение может сделать наш специалист после осмотра изделия.', category: 'Ремонт смартфонов и планшетов', tags: ['экран', 'дисплей'] },
  { id: '16', question: 'Не идет зарядка на смартфоне или планшете?', answer: 'В данном случае возможными причинами такой неисправности может являться повреждение разъема зарядки, платы зарядки, межплатного шлейфа или электрическая проблема материнской платы. Способ устранения неисправности – электрический ремонт с заменой компонентов. Точное заключение может сделать наш специалист после осмотра изделия.', category: 'Ремонт смартфонов и планшетов', tags: ['зарядка', 'разъем'] },
  { id: '17', question: 'Не слышу никого при разговоре?', answer: 'Неисправен разговорный динамик или присутствует электрическая неисправность в материнской плате.', category: 'Ремонт смартфонов и планшетов', tags: ['динамик', 'звук'] },
  { id: '18', question: 'Меня не слышит другой абонент при разговоре?', answer: 'Требуется замена микрофона или нижней платы. В редких случаях требуется электрический ремонт материнской платы.', category: 'Ремонт смартфонов и планшетов', tags: ['микрофон', 'связь'] },
  { id: '19', question: 'Планшет стал медленно работать.', answer: 'Возможно на планшете установлена старая версия программного обеспечения. Требуется обновление, если это обновление выпушено производителем.', category: 'Ремонт смартфонов и планшетов', tags: ['производительность', 'ПО'] },
  { id: '20', question: 'Забыли пароль блокировки экрана, как быть? Останутся ли данные?', answer: 'К сожалению при замене/разблокировке программного обеспечения данные не сохраняются.', category: 'Ремонт смартфонов и планшетов', tags: ['пароль', 'разблокировка'] },

  // Ремонт ноутбуков и компьютеров
  { id: '21', question: 'Ноутбук/системный блок перестал включаться, что могло произойти?', answer: 'Возможно неисправно зарядное устройство или поврежден разъем зарядки. 2. Электрическая проблема в материнской плате.', category: 'Ремонт ноутбуков и компьютеров', tags: ['включение', 'питание'] },
  { id: '22', question: 'Ноутбук перестал заряжаться, что могло произойти?', answer: '1. Возможно неисправно зарядное устройство или поврежден разъем зарядки. 2. Электрическая проблема в материнской плате.', category: 'Ремонт ноутбуков и компьютеров', tags: ['зарядка', 'батарея'] },
  { id: '23', question: 'Ноутбук сильно стал греться', answer: 'Требуется чистка системы охлаждения, замена термо пасты. Проверка и тестирование всех компонентов ноутбука.', category: 'Ремонт ноутбуков и компьютеров', tags: ['перегрев', 'охлаждение'] },
  { id: '24', question: 'Зачем технически обслуживать ноутбук/системный блок ведь он работает?', answer: 'При работе любое устройство создает электромагнитное поле и нагревается. Регулярное обслуживание продлевает срок службы устройства и предотвращает серьезные поломки.', category: 'Ремонт ноутбуков и компьютеров', tags: ['обслуживание', 'профилактика'] },
  { id: '25', question: 'Пропало изображение на ноутбуке', answer: 'Причиной может быть неисправность матрицы, либо электрическая проблема материнской платы или видеокарты.', category: 'Ремонт ноутбуков и компьютеров', tags: ['дисплей', 'матрица'] },
  { id: '26', question: 'После попадания жидкости на клавиатуру можно ли её заменить?', answer: 'Да, можно. Большинство клавиатур есть у нас в наличии.', category: 'Ремонт ноутбуков и компьютеров', tags: ['клавиатура', 'жидкость'] },
  { id: '27', question: 'Системный блок не стартует', answer: 'Причин данной неисправности может быть несколько: Ошибка загрузки операционной системы, неисправность жесткого диска, электрическая проблема. Более точное заключение можно сделать только после осмотра-диагностики.', category: 'Ремонт ноутбуков и компьютеров', tags: ['загрузка', 'старт'] },
  { id: '28', question: 'Системный блок после загрузки выдает синий экран и грустный смайлик', answer: 'В такой ситуации причиной возникновения синего экрана или других ошибок может быть неисправность жесткого диска, перегрев системы, неисправность видеокарты или других компонентов. Более точное заключение можно сделать только после осмотра-диагностики.', category: 'Ремонт ноутбуков и компьютеров', tags: ['BSOD', 'ошибка'] },

  // Ремонт принтеров и МФУ
  { id: '29', question: 'Принтер/мфу при включении издает странные звуки, скрипит', answer: 'Требуется техническое обслуживание принтера/мфу. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['звуки', 'механика'] },
  { id: '30', question: 'Принтер/мфу при печати зажевывает бумагу, захватывает 2-3- листа сразу', answer: 'Требуется ремонт или профилактика механизма подачи бумаги. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['бумага', 'замятие'] },
  { id: '31', question: 'Принтер/мфу при попытке печати не захватывает бумагу', answer: 'Требуется замена роликов захвата бумаги или ремонт механизма захвата бумаги. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['подача бумаги', 'ролики'] },
  { id: '32', question: 'Принтер/мфу плохо стал пропечатывать страницу', answer: 'Требуется замена картриджа. В некоторых случаях требуется замена вала заряда и печки. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['качество печати', 'картридж'] },
  { id: '33', question: 'Принтер/мфу перестал видеть ноутбук/персональный компьютер', answer: 'Такая неисправность может возникнуть при повреждении разъема USB, сбое в работа программного обеспечении принтера или электрической неисправности материнской платы. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['подключение', 'USB'] },
  { id: '34', question: 'МФУ выдает ошибку сканера', answer: 'При такой ошибке частой неисправностью является поломка блока сканера или его компонентов. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт принтеров и МФУ', tags: ['сканер', 'ошибка'] },

  // Ремонт телевизоров
  { id: '35', question: 'Телевизор перестал включаться', answer: 'При такой неисправности требуется электрический ремонт. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт телевизоров', tags: ['включение', 'питание'] },
  { id: '36', question: 'У телевизора пропало изображение, но звук есть', answer: 'Типичной неисправностью является выход из строя модулей подсветки. Иногда может быть и сопутствующая неисправность материнской платы. Такой ремонт производиться на базе сервисного центра. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт телевизоров', tags: ['изображение', 'подсветка'] },
  { id: '37', question: 'У телевизора появились полосы на экране после удара/падения, это можно отремонтировать?', answer: 'Да, если механически не повреждена матрица (не разбита). Ремонт достаточно дорогой. Требуется отправка телевизора, в наш главный офис в Москве. Такой ремонт может длится более 30 дней.', category: 'Ремонт телевизоров', tags: ['экран', 'полосы', 'матрица'] },
  { id: '38', question: 'Телевизор поработает минут 20 и выключается, что может быть?', answer: 'Возможные причины данной неисправности: нестабильная работа блока питания или материнской платы. Требуется сложный электрический ремонт на базе сервисного центра. Боле точную информацию мы сможем предоставить после осмотра оборудования нашим специалистом.', category: 'Ремонт телевизоров', tags: ['выключается', 'перегрев'] },
  { id: '39', question: 'Телевизор после обновления ПО перестал корректно работать', answer: 'Требуется обновление или полная перепрошивка программного обеспечения телевизора. После осмотра оборудования нашим специалистом, мы вам предложим оптимальный способ устранения данной неисправности.', category: 'Ремонт телевизоров', tags: ['ПО', 'прошивка'] }
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
  onDelete,
  isAdmin
}: { 
  category: Category;
  selectedCategory: string | null;
  expandedCategories: string[];
  onSelect: (name: string) => void;
  onToggle: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
  isAdmin: boolean;
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
        {isAdmin && (
          <>
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
          </>
        )}
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
              {isAdmin && (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBase() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
          {isAdmin && (
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
          )}
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
                <Select value={newCategory.parentId || 'none'} onValueChange={(value) => setNewCategory({ ...newCategory, parentId: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Без родителя (корневая)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без родителя (корневая)</SelectItem>
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
                  {isAdmin && (
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Icon name="Plus" size={16} />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
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
                          isAdmin={isAdmin}
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
                        {isAdmin && (
                          <>
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
                          </>
                        )}
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