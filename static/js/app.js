/* =========================================================================
   Библиотека забытых миров — вся интерактивность сайта
   ---------------------------------------------------------------------------
   Разделы файла:
     1.  ДАННЫЕ: настроения, книги, вопросы оракула, сообщения генератора
     2.  СОСТОЯНИЕ: избранное (localStorage), фильтры, ответы оракула
     3.  УТИЛИТЫ: DOM-помощники, обложки, тосты
     4.  РЕНДЕР: коллекция, настроения, архив, модалка, оракул, генератор
     5.  СОБЫТИЯ: клики, поиск, клавиатура, прокрутка
     6.  АНИМАЦИИ: частицы, параллакс, появление секций
   Всё работает без сервера и без внешних API.
   ========================================================================= */
'use strict';

/* =========================== 1. ДАННЫЕ ================================== */

/* Настроения вместо жанров. Каждое имеет свой цвет и символ. */
const MOODS = [
  { id: 'vanish',    title: 'Хочу исчезнуть из реальности',     phrase: 'Дальше, чем твоя реальность',   color: '#75D9CF', symbol: '✦' },
  { id: 'feel',      title: 'Хочу почувствовать что-то настоящее', phrase: 'Близко к сердцу',             color: '#9D83D8', symbol: '✧' },
  { id: 'mystery',   title: 'Хочу разгадать тайну',             phrase: 'За каждым углом — улика',       color: '#D7B56D', symbol: '◈' },
  { id: 'heartbreak',title: 'Хочу немного разбить себе сердце', phrase: 'Красивая хрупкость',            color: '#D98A9A', symbol: '❧' },
  { id: 'wonder',    title: 'Хочу посмотреть на мир иначе',     phrase: 'Привычное — под новым углом',   color: '#8FB8E8', symbol: '◎' },
  { id: 'time',      title: 'Хочу оказаться в другом времени',  phrase: 'Века вместо минут',             color: '#C98F5A', symbol: '⏳' },
  { id: 'surprise',  title: 'Хочу удивиться',                   phrase: 'Сюжет, которого не ждали',      color: '#B79CE0', symbol: '❖' },
];

/* Теги-«черты» для оракула: что интересно и какой финал ближе. */
// secret — тайна, person — человек, idea — идея, adventure — приключение,
// light / ambiguous / unexpected / heavy — тип финала.

/* Каталог книг. Чтобы добавить книгу — просто допиши объект сюда.
   Поля:
     id          — уникальный ключ
     title       — название
     author      — автор
     genre       — направление
     moods       — массив id настроений (см. MOODS)
     traits      — массив черт для оракула
     description — 2–3 фразы без крупных спойлеров
     emotion     — эмоциональная характеристика
     atmosphere  — цветовая атмосфера [основной, глубокий, акцент]
     symbol      — декоративный знак на обложке                              */
const BOOKS = [
  {
    id: 'master-margarita',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    genre: 'Мистическая сатира',
    moods: ['vanish', 'mystery', 'surprise'],
    traits: ['idea', 'unexpected', 'ambiguous'],
    description: 'В Москву приезжает загадочный иностранный консультант, и город постепенно сходит с ума: карточные фокусы, бал у сатаны, любовь, которая переживает всё. Роман одновременно смешит, пугает и тихо утешает — каждый читатель находит в нём свою полку.',
    emotion: 'Мистическая ирония, страсть и странное утешение',
    atmosphere: ['#1A0F22', '#3D1F35', '#D7B56D'],
    symbol: '☾',
  },
  {
    id: 'orwell-1984',
    title: '1984',
    author: 'Джордж Оруэлл',
    genre: 'Антиутопия',
    moods: ['wonder', 'feel'],
    traits: ['idea', 'heavy', 'ambiguous'],
    description: 'Мир, где прошлое переписывают ежедневно, а язык сокращают, чтобы людям было незачем думать. Обычный служащий решает полюбить то, что запрещено, — и это оказывается самым опасным поступком в истории.',
    emotion: 'Тревожная ясность и холодный ужас за человека',
    atmosphere: ['#101418', '#2B3A42', '#8FA8B8'],
    symbol: '◧',
  },
  {
    id: 'dune',
    title: 'Дюна',
    author: 'Фрэнк Герберт',
    genre: 'Научная фантастика',
    moods: ['vanish'],
    traits: ['adventure', 'idea'],
    description: 'На пустынной планете, где воду считают дороже жизни, рождается наследник великой судьбы. Это история о власти, религии и экологии — настолько огромная, что после неё привычная Земля кажется тесной.',
    emotion: 'Грандиозное одиночество посреди песков',
    atmosphere: ['#2A1A0A', '#8A5A24', '#E8C98F'],
    symbol: '☀',
  },
  {
    id: 'norwegian-wood',
    title: 'Норвежский лес',
    author: 'Харуки Мураками',
    genre: 'Психологическая проза',
    moods: ['feel', 'heartbreak'],
    traits: ['person', 'heavy'],
    description: 'Парень вспоминает студентство, двух девушек и тихое отчаяние 1960-х. Ничего сверхъестественного не происходит — и именно поэтому книга бьёт прямо в грудь: она написана из ткани настоящей жизни.',
    emotion: 'Мягкая грусть, тоска и первая взрослая любовь',
    atmosphere: ['#0F1A14', '#27443A', '#B7C9B7'],
    symbol: '❧',
  },
  {
    id: 'crime-punishment',
    title: 'Преступление и наказание',
    author: 'Фёдор Достоевский',
    genre: 'Классический роман',
    moods: ['feel', 'mystery'],
    traits: ['person', 'secret', 'heavy'],
    description: 'Бывший студент совершает убийство «по теории» и обнаруживает, что теория не выдерживает ни одного часа совести. Дальше — петербургская жара, нищета, допрос собственной души и попытка выйти на свет.',
    emotion: 'Душевная лихорадка и беспощадная честность',
    atmosphere: ['#170D0D', '#4A1F1F', '#C9A227'],
    symbol: '✠',
  },
  {
    id: 'name-of-the-rose',
    title: 'Имя розы',
    author: 'Умберто Эко',
    genre: 'Исторический детектив',
    moods: ['mystery', 'time'],
    traits: ['secret', 'idea'],
    description: 'Средневековый монастырь, где книги убивают: за закрытой библиотекой скрывается цепь загадочных смертей. Монах-францисканец расследует их — и оказывается, что самая опасная книга та, которую не должны читать.',
    emotion: 'Интеллектуальное напряжение и запах старой пергаментной пыли',
    atmosphere: ['#14100A', '#3A2F1C', '#C9B27A'],
    symbol: '⌘',
  },
  {
    id: 'little-prince',
    title: 'Маленький принц',
    author: 'Антуан де Сент-Экзюпери',
    genre: 'Притча',
    moods: ['wonder', 'heartbreak'],
    traits: ['idea', 'person'],
    description: 'Лётчик застревает в пустыне и встречает мальчика с другой планеты, который спорит о взрослых и дорожит одной розой. Книга кажется детской, пока на середине не становится абсолютно взрослой и абсолютно грустной.',
    emotion: 'Нежность, тоска и запах пустынного рассвета',
    atmosphere: ['#0D1524', '#2B4A7A', '#E8D9A8'],
    symbol: '★',
  },
  {
    id: 'hundred-years',
    title: 'Сто лет одиночества',
    author: 'Габриэль Гарсиа Маркес',
    genre: 'Магический реализм',
    moods: ['vanish', 'time', 'feel'],
    traits: ['adventure', 'idea'],
    description: 'Семья Буэндиа проживает век в городке, где дождь идёт четыре года, а мёртвые возвращаются просто поговорить. История одного рода превращается в историю целого континента — со смехом, кровью и вечным возвращением имён.',
    emotion: 'Круговорот нежности и обречённости',
    atmosphere: ['#101A10', '#2F5A35', '#E0C98F'],
    symbol: '❈',
  },
  {
    id: 'flowers-for-algernon',
    title: 'Цветы для Элджернона',
    author: 'Дэниел Киз',
    genre: 'Драма',
    moods: ['feel', 'heartbreak', 'surprise'],
    traits: ['person', 'heavy', 'unexpected'],
    description: 'Умственно отсталый человек проходит экспериментальную операцию и становится гением — как и белая мышь, которая прошла путь первой. Дневниковая форма книги хрустит, как лёд: ты заранее знаешь, куда всё движется, и всё равно не готов.',
    emotion: 'Поразительная доброта, обернувшаяся болью',
    atmosphere: ['#14101C', '#3A2F5A', '#C9B7E8'],
    symbol: '✧',
  },
  {
    id: 'lotr',
    title: 'Властелин колец',
    author: 'Дж. Р. Р. Толкин',
    genre: 'Эпическое фэнтези',
    moods: ['vanish', 'time'],
    traits: ['adventure', 'light'],
    description: 'Кольцо, которое нельзя уничтожить силой, должен донести туда, где оно было выковано, самый маленький житель Средиземья. Это путь через леса, горы и искушение — и самая подробная карта вымышленного мира, когда-либо написанная.',
    emotion: 'Тоска по несуществующему и верность до конца',
    atmosphere: ['#0F1512', '#2F4A3A', '#D7B56D'],
    symbol: '⚔',
  },
  {
    id: 'and-then-there-were-none',
    title: 'И никого не стало',
    author: 'Агата Кристи',
    genre: 'Детектив',
    moods: ['mystery', 'surprise'],
    traits: ['secret', 'unexpected'],
    description: 'Десять незнакомцев приглашены на уединённый остров, а в граммофоне звучит обвинение каждого в смерти. Гости исчезают по одному — и читатель вместе с ними пытается понять, кто здесь судья.',
    emotion: 'Холодный ужас и азарт безжалостной головоломки',
    atmosphere: ['#101014', '#33333F', '#E8E0D0'],
    symbol: '❖',
  },
  {
    id: 'dorian-gray',
    title: 'Портрет Дориана Грея',
    author: 'Оскар Уайльд',
    genre: 'Готический роман',
    moods: ['heartbreak', 'wonder', 'mystery'],
    traits: ['idea', 'person', 'ambiguous'],
    description: 'Юноша остаётся навсегда молодым, а его портрет стареет и уродуется за него. Роман-диалог о красоте, влиянии и о том, что случается с душой, когда ей позволено всё.',
    emotion: 'Золотой блеск, за которым трещит лак',
    atmosphere: ['#1A1207', '#4A3010', '#E8D098'],
    symbol: '♛',
  },
  {
    id: 'to-kill-a-mockingbird',
    title: 'Убить пересмешника',
    author: 'Харпер Ли',
    genre: 'Судебная драма',
    moods: ['feel', 'time'],
    traits: ['person', 'light'],
    description: 'Алабама 1930-х глазами восьмилетней Джин-Луизы: сосед в костюме-призраке, летние каникулы и процесс, который взрослые ведут не по правде. История о том, как научиться быть человеком, глядя на тех, кто этого не делает.',
    emotion: 'Тёплая справедливость и южное лето',
    atmosphere: ['#1A1508', '#4A4020', '#E0D0A0'],
    symbol: '🌱',
  },
  {
    id: 'solaris',
    title: 'Солярис',
    author: 'Станислав Лем',
    genre: 'Философская фантастика',
    moods: ['vanish', 'wonder', 'surprise'],
    traits: ['idea', 'ambiguous'],
    description: 'Океан на далёкой планете оказывается живым разумом, который отвечает людям не словами, а их собственными воспоминаниями. Книга честно признаёт: некоторые вопросы умнее нас — и не всякий контакт заканчивается пониманием.',
    emotion: 'Ошеломляющая немощь перед чужим умом',
    atmosphere: ['#061019', '#0F3A4A', '#75D9CF'],
    symbol: '◉',
  },
  {
    id: 'monte-cristo',
    title: 'Граф Монте-Кристо',
    author: 'Александр Дюма',
    genre: 'Исторический роман',
    moods: ['time', 'mystery', 'vanish'],
    traits: ['adventure', 'secret'],
    description: 'Молодого моряка предают и сажают в подземелье, где он проводит четырнадцать лет, выучив тайны острова. Сбежав, он возвращается с новым именем и планом мести, который разворачивается на десятилетия.',
    emotion: 'Неукротимая жажда справедливости, пахнущая морем',
    atmosphere: ['#0B1220', '#1F3A5F', '#D9C08F'],
    symbol: '⚓',
  },
  {
    id: 'heart-of-a-dog',
    title: 'Собачье сердце',
    author: 'Михаил Булгаков',
    genre: 'Сатирическая повесть',
    moods: ['surprise', 'wonder'],
    traits: ['idea', 'unexpected', 'light'],
    description: 'Профессор пересаживает собаке органы человека — и в доме появляется новый жилец с чудовищной энергией. Сатира, которая заставляет смеяться, пока не доходит, о чём на самом деле речь.',
    emotion: 'Хохот, переходящий в холодок',
    atmosphere: ['#141410', '#3D3A24', '#E0C97A'],
    symbol: '🐕',
  },
  {
    id: 'fahrenheit-451',
    title: '451 градус по Фаренгейту',
    author: 'Рэй Брэдбери',
    genre: 'Антиутопия',
    moods: ['wonder', 'vanish'],
    traits: ['idea', 'heavy'],
    description: 'В будущем пожарные сжигают книги — законно и с энтузиазмом. Один из них начинает замечать, что люди вокруг перестали думать, и это приводит его туда, где книги ещё хранят людей.',
    emotion: 'Горькое предупреждение и запах дыма',
    atmosphere: ['#1A0D08', '#5A1F0F', '#E8A96D'],
    symbol: '🔥',
  },
];

/* Сообщения генератора «Удиви меня» */
const SURPRISE_MESSAGES = [
  'Эта история может оказаться не той, которую ты ожидал.',
  'Иногда нужно заблудиться, чтобы найти нужную страницу.',
  'Сегодня тебе стоит прочитать о том, чего ты ещё не понимаешь.',
  'Библиотека выбрала не случайно. Просто пока не скажет почему.',
  'Некоторые книги ждут годами. Эта ждала именно этого вечера.',
  'Возможно, ты откроешь её через год. Или сегодня.',
  'Порой книга находит читателя раньше, чем наоборот.',
  'Эта дверь откроется, только если ты войдёшь.',
];

/* Вопросы книжного оракула.
   moods   — сколько баллов даёт книге каждое настроение,
   traits  — сколько баллов даёт книге каждая черта,
   reasons — фраза-объяснение, если книга совпала с ответом.            */
const ORACLE_QUESTIONS = [
  {
    question: 'Какое ощущение тебе сейчас ближе?',
    options: [
      {
        label: 'Спокойствие',
        moods: { wonder: 2, feel: 1 },
        traits: {},
        reasons: {
          wonder: 'Тебе близок взгляд со стороны — эта книга показывает привычное иначе.',
          feel: 'В спокойном состоянии хорошо читать о человеке, а не о событиях.',
        },
      },
      {
        label: 'Тревога',
        moods: { mystery: 2, heartbreak: 1 },
        traits: {},
        reasons: {
          mystery: 'Тревогу лучше проживать в виде головоломки: у неё есть решение.',
          heartbreak: 'Иногда помогает читать о чужой боли — своя отступает на второй план.',
        },
      },
      {
        label: 'Любопытство',
        moods: { mystery: 2, surprise: 2 },
        traits: {},
        reasons: {
          mystery: 'Любопытство требует тайны — эта книга спрятала ответ в середине.',
          surprise: 'Ты ищешь неизвестное, а эта книга как раз скрывает поворот, которого не ждёшь.',
        },
      },
      {
        label: 'Желание сбежать от реальности',
        moods: { vanish: 3 },
        traits: {},
        reasons: {
          vanish: 'Ты хочешь исчезнуть — эта книга откроет портал туда, где тебя не найдут.',
        },
      },
    ],
  },
  {
    question: 'Где ты хотел бы оказаться?',
    options: [
      {
        label: 'В старинном городе',
        moods: { time: 2, mystery: 2 },
        traits: {},
        reasons: {
          time: 'Камни, улочки и давно ушедшие эпохи — эта книга держит именно такой воздух.',
          mystery: 'Старые города прячут тайны в каждом фундаменте.',
        },
      },
      {
        label: 'В далёком будущем',
        moods: { vanish: 3 },
        traits: {},
        reasons: {
          vanish: 'Далёкое будущее — самый дальний порог, за которым исчезнуть проще всего.',
        },
      },
      {
        label: 'В обычной жизни',
        moods: { feel: 3, heartbreak: 1 },
        traits: {},
        reasons: {
          feel: 'Обычная жизнь — самое непростое место; эта книга живёт именно там.',
          heartbreak: 'В обычной жизни случаются самые незаметные и самые сильные потери.',
        },
      },
      {
        label: 'В совершенно невозможном мире',
        moods: { vanish: 2, surprise: 3 },
        traits: {},
        reasons: {
          vanish: 'Невозможный мир прячет твоё имя где-то на полке.',
          surprise: 'Ты хочешь удивиться — этот мир не подчиняется ничему, кроме собственной логики.',
        },
      },
    ],
  },
  {
    question: 'Что тебе интереснее?',
    options: [
      {
        label: 'Тайна',
        moods: { mystery: 3 },
        traits: { secret: 2 },
        reasons: {
          mystery: 'Ты пришёл за тайной — в этой книге она разворачивается шаг за шагом.',
          secret: 'Эта книга построена вокруг секрета, который не отпускает до последней страницы.',
        },
      },
      {
        label: 'Человек',
        moods: { feel: 2, heartbreak: 2 },
        traits: { person: 2 },
        reasons: {
          feel: 'Тебе важен человек, а не сюжет — эта книга состоит из людей.',
          heart: 'Портрет человека здесь важнее событий — и тем больнее.',
          person: 'Главное здесь — душа героя, и именно её книга показывает без фильтров.',
        },
      },
      {
        label: 'Идея',
        moods: { wonder: 3 },
        traits: { idea: 2 },
        reasons: {
          wonder: 'Идея способна изменить оптику — после этой книги мир выглядит иначе.',
          idea: 'Тебе нужна мысль, за которую можно зацепиться; здесь она выдержит вес.',
        },
      },
      {
        label: 'Большое приключение',
        moods: { vanish: 2, time: 2 },
        traits: { adventure: 3 },
        reasons: {
          vanish: 'Приключение — это способ исчезнуть из привычной жизни на пару сотен страниц.',
          time: 'Большое приключение почти всегда ведёт в чужой век.',
          adventure: 'Эта книга — дорога: она длинная, опасная и стоит того.',
        },
      },
    ],
  },
  {
    question: 'Какой финал тебе ближе?',
    options: [
      {
        label: 'Светлый',
        moods: { wonder: 1 },
        traits: { light: 3 },
        reasons: {
          light: 'Тебе нужен финал, после которого можно выдохнуть — этот выдох здесь есть.',
          wonder: 'Свет здесь скорее тихий, чем слепящий — как раз для твоего настроения.',
        },
      },
      {
        label: 'Неоднозначный',
        moods: { wonder: 1 },
        traits: { ambiguous: 3 },
        reasons: {
          ambiguous: 'Эта книга заканчивается вопросом — и не обещает ответа.',
          wonder: 'Неоднозначный финал заставляет смотреть на историю ещё раз.',
        },
      },
      {
        label: 'Неожиданный',
        moods: { surprise: 2 },
        traits: { unexpected: 3 },
        reasons: {
          surprise: 'Финал здесь не тот, который ты описал себе в начале.',
          unexpected: 'Последние страницы перевернут всё, что ты думал о геро.',
        },
      },
      {
        label: 'Эмоционально тяжёлый',
        moods: { heartbreak: 2 },
        traits: { heavy: 3 },
        reasons: {
          heavy: 'Ты готов к тяжёлому финалу — этот не облегчит, но будет честным.',
          heartbreak: 'Иногда хочется поплакать по-настоящему; эта история даст повод.',
        },
      },
    ],
  },
];

/* =========================== 2. СОСТОЯНИЕ =============================== */

const STORAGE_KEY = 'llw-favorites-v1';

/* Проверяем поддержку localStorage — в приватных режимах он может бывать
   выключен, и тогда сайт не должен падать с ошибкой. */
function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch (e) {
    return new Set();
  }
}

const state = {
  favorites: loadFavorites(),
  query: '',
  genre: 'all',
  mood: 'all',
  sort: 'title',
  favoritesOnly: false,
  oracle: { step: 0, answers: [null, null, null, null] },
  lastRandomId: null,
};

function saveFavorites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.favorites]));
  } catch (e) {
    /* тихо игнорируем: сайт продолжает работать без сохранения */
  }
}

/* =========================== 3. УТИЛИТЫ ================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function moodById(id) {
  return MOODS.find((m) => m.id === id);
}

function bookById(id) {
  return BOOKS.find((b) => b.id === id);
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* CSS-обложка: градиент из цветов книги, авторская типографика, знак.
   Не требует интернета и никогда не «сломается», в отличие от внешних картинок.
   Вариант композиции обложки выбирается детерминированно из id книги —
   так полка выглядит разнообразно, а обложка не «меняется» при перерисовке. */
/* Путь к папке с иллюстрациями вычисляется из адреса самого app.js —
   работает и под Flask (/static/...), и при открытии файла напрямую. */
const ART_BASE = (function () {
  const s = document.querySelector('script[src*="app.js"]');
  return s ? s.src.replace(/js\/app\.js.*$/, '') : '/static/';
})();

function artUrl(book) {
  return `${ART_BASE}images/art/${book.id}.svg`;
}

function coverVariant(book) {
  let hash = 0;
  for (let i = 0; i < book.id.length; i += 1) hash = (hash * 31 + book.id.charCodeAt(i)) % 997;
  return (hash % 4) + 1; // 4 композиции обложек
}

function coverMarkup(book, extraClass = '') {
  const [c1, c2, accent] = book.atmosphere;
  const variant = `cover-v${coverVariant(book)}`;
  return `
    <div class="cover ${variant} ${extraClass}"
         style="--cv-1:${c1}; --cv-2:${c2}; --cv-accent:${accent}">
      <div class="cover-grain" aria-hidden="true"></div>
      <img class="cover-art" src="${artUrl(book)}" alt="" aria-hidden="true" decoding="async">
      <span class="cover-watermark" aria-hidden="true">${book.symbol}</span>
      <span class="cover-rule" aria-hidden="true"></span>
      <span class="cover-title">${escapeHTML(book.title)}</span>
      <span class="cover-author">${escapeHTML(book.author)}</span>
      <span class="cover-corner" aria-hidden="true"></span>
    </div>`;
}

function moodChipsMarkup(book) {
  return book.moods
    .map((id) => {
      const m = moodById(id);
      if (!m) return '';
      return `<span class="chip chip-mood" style="--chip-color:${m.color}">${m.symbol} ${m.title.toLowerCase()}</span>`;
    })
    .join('');
}

function favoriteBtnMarkup(book, small = false) {
  const active = state.favorites.has(book.id);
  const cls = `fav-btn${active ? ' is-active' : ''}${small ? ' fav-btn-sm' : ''}`;
  const label = active ? 'Удалить из избранного' : 'Добавить в избранное';
  return `
    <button class="${cls}" type="button" data-fav="${book.id}" aria-pressed="${active}" aria-label="${label}: ${escapeHTML(book.title)}" title="${label}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3.5 L14.4 9 L20.2 9.6 L15.9 13.5 L17.2 19.2 L12 16.2 L6.8 19.2 L8.1 13.5 L3.8 9.6 L9.6 9 Z"/>
      </svg>
    </button>`;
}

function portalBtnMarkup(book, variant = '') {
  return `<button class="btn btn-gold btn-sm ${variant}" type="button" data-portal="${book.id}">Открыть портал</button>`;
}

let toastTimer = null;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 2200);
}

/* =========================== 4. РЕНДЕР ================================== */

/* ---------- Карточка книги в коллекции ---------- */
function bookCardMarkup(book, index) {
  const isFav = state.favorites.has(book.id);
  // Чередуем композиции: некоторые карточки широкие, часть — с крупным заголовком
  const variant = index % 7 === 3 ? 'card-wide' : (index % 7 === 5 ? 'card-tall' : '');
  return `
    <article class="book-card ${variant}${isFav ? ' is-favorite' : ''}" data-book="${book.id}">
      <div class="card-cover-wrap">
        ${coverMarkup(book)}
        <div class="card-glow" aria-hidden="true"></div>
        <div class="card-fav">${favoriteBtnMarkup(book, true)}</div>
      </div>
      <div class="card-body">
        <span class="card-index" aria-hidden="true">№ ${String(index + 1).padStart(2, '0')}</span>
        <p class="card-genre">${escapeHTML(book.genre)}</p>
        <h3 class="card-title">${escapeHTML(book.title)}</h3>
        <p class="card-author">${escapeHTML(book.author)}</p>
        <p class="card-desc">${escapeHTML(book.description)}</p>
        <p class="card-emotion"><span aria-hidden="true">◈</span> ${escapeHTML(book.emotion)}</p>
        <div class="card-actions">
          ${portalBtnMarkup(book)}
          ${favoriteBtnMarkup(book)}
        </div>
      </div>
    </article>`;
}

/* ---------- Коллекция с фильтрами, поиском и сортировкой ---------- */
function getFilteredBooks() {
  const q = state.query.trim().toLowerCase();

  let list = BOOKS.filter((b) => {
    // поиск по названию, автору, жанру и описанию
    const haystack = `${b.title} ${b.author} ${b.genre} ${b.description}`.toLowerCase();
    if (q && !haystack.includes(q)) return false;
    // жанр
    if (state.genre !== 'all' && b.genre !== state.genre) return false;
    // настроение
    if (state.mood !== 'all' && !b.moods.includes(state.mood)) return false;
    // только избранные
    if (state.favoritesOnly && !state.favorites.has(b.id)) return false;
    return true;
  });

  // сортировка
  if (state.sort === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  } else if (state.sort === 'author') {
    list.sort((a, b) => a.author.localeCompare(b.author, 'ru'));
  } else if (state.sort === 'favorites') {
    list.sort((a, b) => {
      const fa = state.favorites.has(a.id) ? 0 : 1;
      const fb = state.favorites.has(b.id) ? 0 : 1;
      return fa - fb || a.title.localeCompare(b.title, 'ru');
    });
  }
  return list;
}

function renderCollection() {
  const grid = $('#booksGrid');
  const empty = $('#searchEmpty');
  const countEl = $('#resultsCount');
  const list = getFilteredBooks();

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
    countEl.textContent = 'Ничего не найдено';
  } else {
    empty.hidden = true;
    grid.innerHTML = list.map((b, i) => bookCardMarkup(b, i)).join('');
    countEl.textContent = `Найдено книг: ${list.length} из ${BOOKS.length}`;
  }
}

/* ---------- Раздел «Выбери настроение» ---------- */
function renderMoodGrid() {
  const grid = $('#moodGrid');
  grid.innerHTML = MOODS.map((m) => `
    <button class="mood-card" type="button" data-mood="${m.id}"
            style="--mood-color:${m.color}"
            aria-pressed="${state.mood === m.id}">
      <span class="mood-symbol" aria-hidden="true">${m.symbol}</span>
      <span class="mood-title">${m.title}</span>
      <span class="mood-phrase">${m.phrase}</span>
      <span class="mood-count">${BOOKS.filter((b) => b.moods.includes(m.id)).length} книг</span>
    </button>`).join('');
}

function renderMoodRecommend() {
  const box = $('#moodRecommend');
  const resetBtn = $('#moodResetBtn');

  if (state.mood === 'all') {
    box.innerHTML = `
      <p class="mood-hint">
        <span aria-hidden="true">✧</span>
        Выбери настроение — и здесь появятся книги, которые ему соответствуют.
      </p>`;
    resetBtn.hidden = true;
    return;
  }

  const m = moodById(state.mood);
  const books = BOOKS.filter((b) => b.moods.includes(state.mood));
  box.innerHTML = `
    <div class="mood-rec-head" style="--mood-color:${m.color}">
      <span class="mood-rec-symbol" aria-hidden="true">${m.symbol}</span>
      <h3>${m.title}</h3>
      <p>${books.length} ${pluralize(books.length, ['книга ждёт', 'книги ждут', 'книг ждут'])} тебя на полке: «${m.phrase.toLowerCase()}».</p>
    </div>
    <ul class="mood-rec-list">
      ${books.map((b) => `
        <li class="mood-rec-item" data-book="${b.id}">
          ${coverMarkup(b, 'cover-mini')}
          <div class="mood-rec-info">
            <p class="mood-rec-title">${escapeHTML(b.title)}</p>
            <p class="mood-rec-author">${escapeHTML(b.author)}</p>
            <p class="mood-rec-desc">${escapeHTML(b.description)}</p>
            <div class="mood-rec-actions">
              ${portalBtnMarkup(b)}
              ${favoriteBtnMarkup(b, true)}
            </div>
          </div>
        </li>`).join('')}
    </ul>`;
  resetBtn.hidden = false;
}

/* Простое склонение слов после числа */
function pluralize(n, forms) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

/* ---------- Архив (избранное) ---------- */
function renderArchive() {
  const grid = $('#archiveGrid');
  const empty = $('#archiveEmpty');
  const countEl = $('#archiveCount');
  const favs = BOOKS.filter((b) => state.favorites.has(b.id));

  countEl.textContent = String(favs.length);

  if (favs.length === 0) {
    grid.innerHTML = '';
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = favs.map((b, i) => bookCardMarkup(b, i)).join('');
  }
}

/* ---------- Модальное окно книги ---------- */
let modalLastFocused = null;

function openBookModal(bookId) {
  const book = bookById(bookId);
  if (!book) return;

  const modal = $('#bookModal');
  const content = $('#modalContent');

  content.innerHTML = `
    <div class="modal-grid">
      <div class="modal-cover">${coverMarkup(book, 'cover-large')}</div>
      <div class="modal-info">
        <p class="modal-genre">${escapeHTML(book.genre)}</p>
        <h2 class="modal-title" id="modalTitle">${escapeHTML(book.title)}</h2>
        <p class="modal-author">${escapeHTML(book.author)}</p>
        <div class="modal-chips">${moodChipsMarkup(book)}</div>
        <p class="modal-desc">${escapeHTML(book.description)}</p>
        <p class="modal-emotion"><span aria-hidden="true">◈</span> ${escapeHTML(book.emotion)}</p>
        <p class="modal-atmosphere">
          <span class="atm-dot" style="background:${book.atmosphere[0]}"></span>
          <span class="atm-dot" style="background:${book.atmosphere[1]}"></span>
          <span class="atm-dot" style="background:${book.atmosphere[2]}"></span>
          цветовая атмосфера
        </p>
        <div class="modal-actions">
          ${favoriteBtnMarkup(book)}
          <button class="btn btn-ghost" type="button" data-modal-close>Назад к коллекции</button>
        </div>
      </div>
    </div>`;

  modalLastFocused = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => {
    modal.classList.add('is-open');
    $('#modalCloseBtn').focus();
  });
}

function closeBookModal() {
  const modal = $('#bookModal');
  if (modal.hidden) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  const finish = () => { modal.hidden = true; };
  if (reduceMotion) finish(); else setTimeout(finish, 220);
  if (modalLastFocused && modalLastFocused.focus) modalLastFocused.focus();
}

/* ---------- Генератор «Удиви меня» ---------- */
function openSurprise() {
  const overlay = $('#surpriseOverlay');
  const ritual = $('#surpriseRitual');
  const result = $('#surpriseResult');

  overlay.hidden = false;
  document.body.classList.add('no-scroll');
  ritual.hidden = false;
  result.hidden = true;
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  // время «ритуала» сокращается для тех, кто просил меньше анимаций
  const delay = reduceMotion ? 60 : 1100;
  setTimeout(() => {
    ritual.hidden = true;
    renderSurpriseResult();
    result.hidden = false;
    requestAnimationFrame(() => result.classList.add('is-show'));
  }, delay);
}

function closeSurprise() {
  const overlay = $('#surpriseOverlay');
  if (overlay.hidden) return;
  overlay.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  const finish = () => { overlay.hidden = true; };
  if (reduceMotion) finish(); else setTimeout(finish, 250);
}

function renderSurpriseResult() {
  // случайная книга, но не та же, что была в прошлый раз
  let pick;
  do {
    pick = BOOKS[Math.floor(Math.random() * BOOKS.length)];
  } while (BOOKS.length > 1 && pick.id === state.lastRandomId);
  state.lastRandomId = pick.id;

  const message = SURPRISE_MESSAGES[Math.floor(Math.random() * SURPRISE_MESSAGES.length)];

  $('#surpriseResult').innerHTML = `
    <div class="surprise-flip">
      <p class="surprise-message">«${message}»</p>
      <article class="surprise-card">
        <div class="surprise-cover">${coverMarkup(pick, 'cover-large')}</div>
        <div class="surprise-info">
          <p class="card-genre">${escapeHTML(pick.genre)}</p>
          <h3 class="surprise-title">${escapeHTML(pick.title)}</h3>
          <p class="card-author">${escapeHTML(pick.author)}</p>
          <p class="surprise-desc">${escapeHTML(pick.description)}</p>
          <div class="surprise-actions">
            ${portalBtnMarkup(pick)}
            <button class="btn btn-ghost btn-sm" type="button" id="surpriseAgainBtn">Попробовать ещё раз</button>
          </div>
        </div>
      </article>
    </div>`;

  $('#surpriseAgainBtn').addEventListener('click', () => {
    const result = $('#surpriseResult');
    result.classList.remove('is-show');
    const ritual = $('#surpriseRitual');
    ritual.hidden = false;
    setTimeout(() => {
      ritual.hidden = true;
      renderSurpriseResult();
      result.hidden = false;
      requestAnimationFrame(() => result.classList.add('is-show'));
    }, reduceMotion ? 40 : 700);
  });
}

/* ---------- Книжный оракул ---------- */
function renderOracle() {
  const { step, answers } = state.oracle;
  const q = ORACLE_QUESTIONS[step];
  const total = ORACLE_QUESTIONS.length;

  $('#oracleStepLabel').textContent = `Вопрос ${step + 1} из ${total}`;
  $('#oracleProgressBar').style.width = `${((step) / total) * 100}%`;
  $('#oracleQuestion').textContent = q.question;

  const chosen = answers[step];
  $('#oracleOptions').innerHTML = q.options.map((opt, i) => `
    <button class="oracle-option${chosen === i ? ' is-selected' : ''}" type="button"
            data-option="${i}" aria-pressed="${chosen === i}">
      <span class="oracle-option-mark" aria-hidden="true"></span>
      <span class="oracle-option-text">${opt.label}</span>
    </button>`).join('');

  $('#oracleBackBtn').hidden = step === 0;
}

/* Подсчёт баллов: за каждым ответом оракула закреплены настроения и черты,
   у каждой книги — свои. Книги с одинаковым максимумом баллов перемешиваются. */
function computeOracleResult() {
  const scores = new Map(BOOKS.map((b) => [b.id, 0]));

  state.oracle.answers.forEach((optIndex, qIndex) => {
    if (optIndex === null) return;
    const opt = ORACLE_QUESTIONS[qIndex].options[optIndex];
    BOOKS.forEach((b) => {
      let s = 0;
      Object.entries(opt.moods).forEach(([m, w]) => { if (b.moods.includes(m)) s += w; });
      Object.entries(opt.traits).forEach(([t, w]) => { if (b.traits.includes(t)) s += w; });
      scores.set(b.id, scores.get(b.id) + s);
    });
  });

  const max = Math.max(...scores.values());
  const best = BOOKS.filter((b) => scores.get(b.id) === max);
  return best[Math.floor(Math.random() * best.length)];
}

/* Объяснение: собираем фразы из ответов, с которыми книга совпала */
function buildOracleReason(book) {
  const parts = [];
  state.oracle.answers.forEach((optIndex, qIndex) => {
    if (optIndex === null) return;
    const opt = ORACLE_QUESTIONS[qIndex].options[optIndex];
    let matched = null;
    Object.keys(opt.moods).some((m) => {
      if (book.moods.includes(m) && opt.reasons[m]) { matched = opt.reasons[m]; return true; }
      return false;
    });
    if (!matched) {
      Object.keys(opt.traits).some((t) => {
        if (book.traits.includes(t) && opt.reasons[t]) { matched = opt.reasons[t]; return true; }
        return false;
      });
    }
    if (matched) parts.push(matched);
  });
  if (parts.length === 0) {
    parts.push('Ответы оракула сложились так, что эта книга оказалась ближе остальных.');
  }
  return parts.slice(0, 3).join(' ');
}

function showOracleResult() {
  const book = computeOracleResult();
  const reason = buildOracleReason(book);

  $('#oracleProgressBar').style.width = '100%';
  $('#oracleStageQuiz').hidden = true;
  $('#oracleStageResult').hidden = false;

  $('#oracleResultBody').innerHTML = `
    <article class="oracle-book">
      <div class="oracle-book-cover">${coverMarkup(book, 'cover-large')}</div>
      <div class="oracle-book-info">
        <h3 class="oracle-book-title">${escapeHTML(book.title)}</h3>
        <p class="card-author">${escapeHTML(book.author)}</p>
        <div class="modal-chips">${moodChipsMarkup(book)}</div>
        <p class="oracle-book-desc">${escapeHTML(book.description)}</p>
        <p class="oracle-book-why"><strong>Почему именно она:</strong> ${escapeHTML(reason)}</p>
        <div class="surprise-actions">
          ${portalBtnMarkup(book)}
        </div>
      </div>
    </article>`;
}

function restartOracle() {
  state.oracle = { step: 0, answers: [null, null, null, null] };
  $('#oracleStageResult').hidden = true;
  $('#oracleStageQuiz').hidden = false;
  renderOracle();
}

/* ---------- Избранное: переключение ---------- */
function toggleFavorite(bookId) {
  const book = bookById(bookId);
  if (!book) return;

  if (state.favorites.has(bookId)) {
    state.favorites.delete(bookId);
    showToast(`«${book.title}» убрана из архива`);
  } else {
    state.favorites.add(bookId);
    showToast(`«${book.title}» сохранена в архив ✦`);
  }
  saveFavorites();

  // обновляем только нужные части интерфейса, без перерисовки всего сайта
  renderCollection();
  renderArchive();
  if (state.mood !== 'all') renderMoodRecommend();

  // синхронизируем кнопки в открытой модалке
  const modal = $('#bookModal');
  if (!modal.hidden) {
    const btn = $('.fav-btn', modal);
    if (btn && btn.dataset.fav === bookId) {
      const active = state.favorites.has(bookId);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', `${active ? 'Удалить из' : 'Добавить в'} избранное: ${book.title}`);
    }
  }
}

/* =========================== 5. СОБЫТИЯ ================================= */

function scrollToSection(sel) {
  const el = $(sel);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function initEvents() {
  /* --- Кнопки первого экрана --- */
  $('#heroOpenLibrary').addEventListener('click', () => scrollToSection('#collection'));
  $('#heroSurpriseBtn').addEventListener('click', openSurprise);

  /* --- Шапка: поиск и «Найти свой мир» --- */
  $('#headerSearchBtn').addEventListener('click', () => {
    scrollToSection('#collection');
    setTimeout(() => $('#searchInput').focus(), reduceMotion ? 0 : 500);
  });
  const openOracle = () => {
    scrollToSection('#oracle');
    setTimeout(() => {
      const first = $('.oracle-option');
      if (first) first.focus();
    }, reduceMotion ? 0 : 600);
  };
  $('#headerCtaBtn').addEventListener('click', openOracle);
  $('#mobileCtaBtn').addEventListener('click', () => { closeMobileMenu(); openOracle(); });

  /* --- Бургер-меню --- */
  $('#burgerBtn').addEventListener('click', () => {
    const menu = $('#mobileMenu');
    const open = menu.hidden;
    menu.hidden = !open;
    $('#burgerBtn').setAttribute('aria-expanded', String(open));
  });
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', closeMobileMenu));

  // «Исследовать» в меню дополнительно фокусирует поиск
  $$('[data-nav="explore"]').forEach((a) => {
    a.addEventListener('click', () => {
      closeMobileMenu();
      setTimeout(() => $('#searchInput').focus(), reduceMotion ? 0 : 500);
    });
  });

  /* --- Настроения --- */
  $('#moodGrid').addEventListener('click', (e) => {
    const card = e.target.closest('[data-mood]');
    if (!card) return;
    state.mood = state.mood === card.dataset.mood ? 'all' : card.dataset.mood;
    syncMoodControls();
    renderMoodGrid();
    renderMoodRecommend();
    renderCollection();
  });

  $('#moodResetBtn').addEventListener('click', () => {
    state.mood = 'all';
    syncMoodControls();
    renderMoodGrid();
    renderMoodRecommend();
    renderCollection();
  });

  /* --- Поиск, сортировка, фильтры --- */
  $('#searchInput').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderCollection();
  });

  $('#sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderCollection();
  });

  $('#moodSelect').addEventListener('change', (e) => {
    state.mood = e.target.value;
    renderMoodGrid();
    renderMoodRecommend();
    renderCollection();
  });

  $('#favoritesOnlyToggle').addEventListener('change', (e) => {
    state.favoritesOnly = e.target.checked;
    renderCollection();
  });

  $('#genreChips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-genre]');
    if (!chip) return;
    state.genre = chip.dataset.genre;
    renderGenreChips();
    renderCollection();
  });

  $('#searchEmptyReset').addEventListener('click', resetAllFilters);

  /* --- Архив: «Отправиться на поиски» --- */
  $('#archiveGoSearch').addEventListener('click', () => scrollToSection('#collection'));

  /* --- Оракул --- */
  $('#oracleOptions').addEventListener('click', (e) => {
    const opt = e.target.closest('[data-option]');
    if (!opt) return;
    const i = Number(opt.dataset.option);
    state.oracle.answers[state.oracle.step] = i;
    // короткая пауза на анимацию выбора, затем следующий вопрос или результат
    setTimeout(() => {
      if (state.oracle.step < ORACLE_QUESTIONS.length - 1) {
        state.oracle.step += 1;
        renderOracle();
        const first = $('.oracle-option');
        if (first) first.focus();
      } else {
        showOracleResult();
      }
    }, reduceMotion ? 0 : 250);
  });

  $('#oracleBackBtn').addEventListener('click', () => {
    if (state.oracle.step > 0) {
      state.oracle.step -= 1;
      renderOracle();
    }
  });

  $('#oracleRestartBtn').addEventListener('click', restartOracle);

  /* --- Глобальные клики: избранное, порталы, закрытие модалки --- */
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      toggleFavorite(favBtn.dataset.fav);
      return;
    }
    const portal = e.target.closest('[data-portal]');
    if (portal) {
      openBookModal(portal.dataset.portal);
      return;
    }
    if (e.target.closest('[data-modal-close]')) {
      closeBookModal();
    }
  });

  /* --- Модальное окно: закрытие --- */
  $('#modalCloseBtn').addEventListener('click', closeBookModal);
  $('#bookModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeBookModal(); // клик по затемнению
  });

  /* --- Оверлей генератора --- */
  $('#surpriseCloseBtn').addEventListener('click', closeSurprise);
  $('#surpriseOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSurprise();
  });

  /* --- Escape: закрывает всё, что открыто --- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#bookModal').hidden) closeBookModal();
    else if (!$('#surpriseOverlay').hidden) closeSurprise();
    else if (!$('#mobileMenu').hidden) closeMobileMenu();
  });

  /* --- Ловушка фокуса в модалках (чтобы Tab не «уходил» за затемнение) --- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const dialog = !$('#bookModal').hidden ? $('#bookModalDialog')
      : (!$('#surpriseOverlay').hidden ? $('#surpriseDialog') : null);
    if (!dialog) return;
    const focusables = $$('button, [href], input, select, [tabindex]:not([tabindex="-1"])', dialog)
      .filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* --- Кнопка «наверх» --- */
  $('#toTopBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

function closeMobileMenu() {
  $('#mobileMenu').hidden = true;
  $('#burgerBtn').setAttribute('aria-expanded', 'false');
}

function resetAllFilters() {
  state.query = '';
  state.genre = 'all';
  state.mood = 'all';
  state.favoritesOnly = false;
  state.sort = 'title';
  $('#searchInput').value = '';
  $('#sortSelect').value = 'title';
  $('#moodSelect').value = 'all';
  $('#favoritesOnlyToggle').checked = false;
  renderGenreChips();
  renderMoodGrid();
  renderMoodRecommend();
  renderCollection();
}

/* Синхронизация выпадающего списка настроений с карточками настроений */
function syncMoodControls() {
  $('#moodSelect').value = state.mood;
}

/* Чипсы жанров формируются из реальных данных — добавили книгу, чип появился сам */
function renderGenreChips() {
  const genres = [...new Set(BOOKS.map((b) => b.genre))].sort((a, b) => a.localeCompare(b, 'ru'));
  const chips = [{ id: 'all', label: 'Все направления' },
    ...genres.map((g) => ({ id: g, label: g }))];
  $('#genreChips').innerHTML = chips.map((c) => `
    <button class="genre-chip${state.genre === c.id ? ' is-active' : ''}" type="button"
            data-genre="${escapeHTML(c.id)}" aria-pressed="${state.genre === c.id}">
      ${escapeHTML(c.label)}
    </button>`).join('');
}

/* =========================== 6. АНИМАЦИИ ================================ */

/* Парящие волшебные свечи — «заклинание Лумос» над главным экраном */
function initCandles() {
  if (reduceMotion) return;
  const box = $('#candleField');
  if (!box) return;
  const COUNT = 11;
  let html = '';
  for (let i = 0; i < COUNT; i += 1) {
    const left = 4 + (i * 92) / (COUNT - 1) + (Math.random() * 6 - 3); // равномерно + дрожь
    const top = 8 + Math.random() * 64;
    const scale = 0.65 + Math.random() * 0.7;
    const dur = 6 + Math.random() * 5;        // покачивание
    const flick = 1.6 + Math.random() * 1.4;  // мерцание пламени
    const delay = -Math.random() * 8;
    html += `<span class="candle" style="
      left:${left.toFixed(2)}%; top:${top.toFixed(2)}%;
      --cs:${scale.toFixed(2)};
      animation-duration:${dur.toFixed(2)}s;
      animation-delay:${delay.toFixed(2)}s;
      --flame-dur:${flick.toFixed(2)}s;"></span>`;
  }
  box.innerHTML = html;
}

/* Вкладочная панель «главы»: появление после героя + подсветка активной главы */
function initChapterDock() {
  const dock = $('#chapterDock');
  const tabs = $$('.dock-tab', dock);
  const sections = tabs
    .map((t) => ({ tab: t, el: $(`#${t.dataset.dock}`) }))
    .filter((x) => x.el);

  function update() {
    const y = window.scrollY;
    // показываем панель, когда читатель вошёл «вглубь библиотеки»
    dock.classList.toggle('is-visible', y > 520);

    // активная глава — последняя секция, пересёкшая верхнюю треть экрана
    const marker = y + window.innerHeight * 0.35;
    let active = sections[0];
    sections.forEach((s) => {
      if (s.el.offsetTop <= marker) active = s;
    });
    tabs.forEach((t) => {
      const isActive = active && t === active.tab;
      t.classList.toggle('is-active', isActive);
      if (isActive) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  }

  // мягкий переход по клику (CSS scroll-behavior не везде срабатывает при якорях)
  tabs.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(t.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* Светящиеся пылинки на главном экране */
function initParticles() {
  if (reduceMotion) return; // при «меньше анимаций» пылинки не нужны
  const box = $('#heroParticles');
  const COUNT = 26;
  let html = '';
  for (let i = 0; i < COUNT; i += 1) {
    const size = 1 + Math.random() * 2.6;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const dur = 9 + Math.random() * 14;
    const delay = -Math.random() * 20;
    const hue = Math.random();
    const color = hue < 0.55 ? '#D7B56D' : (hue < 0.85 ? '#75D9CF' : '#9D83D8');
    html += `<span class="particle" style="
      left:${left}%; top:${top}%;
      width:${size}px; height:${size}px;
      background:${color};
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      opacity:${0.25 + Math.random() * 0.5};"></span>`;
  }
  box.innerHTML = html;
}

/* Плавное появление секций при прокрутке */
function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}

/* Лёгкий параллакс героя + состояние шапки + кнопка «наверх» */
function initScrollEffects() {
  const header = $('#siteHeader');
  const toTop = $('#toTopBtn');
  const heroBook = $('#heroBook');
  const particles = $('#heroParticles');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 30);
      toTop.hidden = y < 700;

      if (!reduceMotion && y < window.innerHeight * 1.2) {
        // декоративные элементы движутся медленнее контента
        if (heroBook) heroBook.style.transform = `translateY(${y * 0.12}px)`;
        if (particles) particles.style.transform = `translateY(${y * 0.05}px)`;
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =========================== ИНИЦИАЛИЗАЦИЯ ============================== */

function init() {
  // выпадающий список настроений
  const moodSelect = $('#moodSelect');
  MOODS.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.symbol} ${m.title}`;
    moodSelect.appendChild(opt);
  });

  renderGenreChips();
  renderMoodGrid();
  renderMoodRecommend();
  renderCollection();
  renderArchive();
  renderOracle();

  $('#footerYear').textContent = String(new Date().getFullYear());

  initEvents();
  initParticles();
  initCandles();
  initChapterDock();
  initReveal();
  initScrollEffects();
}

// Ждём полной загрузки DOM — скрипт подключён с defer, но на всякий случай
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
