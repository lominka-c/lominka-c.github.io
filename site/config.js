/* ════════════════════════════════════════════════════════
   КОНФІГ — увесь контент сайту тут. HTML чіпати не треба.
   Додати пункт = скопіювати рядок у потрібному списку.
   ════════════════════════════════════════════════════════ */
const SITE = {
  handle:  'lominka',
  prompt:  'lominka@dev',
  accent:  '#ff5fa8',             // головний колір (рожевий)
  tz:      'Europe/Kyiv',         // годинник у шапці
  location:'Львів',
  avatar:  '../avatar.jpg',         // шлях до фото (файл лежить поруч з index.html)
  avatarWebp: 'avatar.webp',      // легша версія фото (необовʼязково, можна прибрати)
  bio: `Бекенд, залізо й трохи хаосу. Пишу на <b>Python, Dart, C++</b>,
        паяю мікроконтролери і знаходжу те, що забули закрити.
        Люблю розбирати системи — іноді буквально, іноді в сенсі безпеки.`,
  typewriter: [
    'build_backend.py', 'flutter_app.dart', 'hardware_ctrl.cpp',
    'osint_recon.sh', 'find_vulnerabilities()',
    'brew install coffee --at=2am', 'sudo rm -rf *'
  ],
  links: [
    { label: 'telegram', href: 'https://t.me/lominka_dev' },
    { label: 'github',   href: 'https://github.com/lominka-c' },
    { label: 'me@lominka.dev', href: 'mailto:me@lominka.dev' },   // клік по пошті = копіювання адреси
  ],
  contact: 'Є ідея, баг чи залізяка, яку треба оживити? Пиши — відповідаю швидко, особливо після 2 ночі.',
};

const SKILLS = [
  // [назва, коротко, теги]
  ['Python',        'бекенди, боти, автоматизація', 'FastAPI, aiogram'],
  ['Dart / Flutter','мобільні застосунки та UI',    'Android, iOS'],
  ['C++',           'мікроконтролери, embedded',    'ESP-IDF, Arduino'],
  ['SQL',           'реляційні БД, запити',         'PostgreSQL, SQLite'],
  ['API',           'REST, авторизація, інтеграції','HTTP, WebSocket'],
  ['Tasker',        'автоматизація Android',        'Android'],
];

const LAB = {
  main: {
    title: 'WEB-ресурси (private)',
    status: 'в роботі',
    desc: 'Розробка інтернет-застосунків. Деталі засекречені.',
    tags: ['HTML', 'CSS', 'JS', 'Python', 'Figma'],
  },
  inventory: ['Xiao ESP32-C3', 'ESP32-C3 Supermini', 'Raspberry Pi 4B', 'Arduino UNO', 'Модулі: IMU, RF, Relay, OLED…'],
  devices: [['Laptop', 'Lenovo LOQ 15IAX9'], ['Mobile', 'Samsung S24 Ultra'], ['VR', 'Meta Quest 3']],
};

const PROJECTS = [
  /* Поля: name, status, desc — обовʼязкові. Решта необовʼязкові:
     tags: ['A','B'] · progress: 0-100 (смужка, найкраще з wip) · year: '2025'
     link: 'https://…' (кнопка «відкрити») · log: [['info'|'cmd'|'ok','текст'], …] (термінал, для audit)
     Бонус: додай #demo до адреси сайту — побачиш усі статуси одразу. */
  { name: 'Energravity', status: 'wip', progress: 45,
    desc: 'Android-застосунок + бекенд. Концепт готовий, реалізація в процесі.',
    tags: ['Flutter', 'Python', 'FastAPI'] },
  { name: 'Smart Bike Alarm', status: 'abandoned',
    desc: 'Кастомна охоронка для велосипеда: власний брелок на Xiao ESP32-C3, сигналізація з LED-підсвіткою, вібросенсор, зумер, акселерометр, LoRa.',
    tags: ['ESP32-C3', 'LoRa', 'C++', 'Flutter'] },
  { name: 'Інші проєкти', status: 'abandoned',
    desc: 'Кілька ботів і API-сервісів, які не злетіли без просування. Код є, репо закриті.' },
  { name: 'Smaki Maki CRM', status: 'audit',
    desc: 'Критична вразливість у CRM мережі доставки.',
    log: [['info','target: crm.smakimaki.*'], ['cmd','exploit: auth bypass'], ['ok','full admin access granted']] },
  { name: 'Osama Sushi', status: 'audit',
    desc: 'Перехоплення API-токенів через небезпечну передачу на клієнті.',
    log: [['info','target: api.osamasushi.*'], ['cmd','intercept: bearer tokens'], ['ok','tokens captured']] },
];

/* Статуси: ключ → підпис. Новий статус = рядок тут + блок .s-ключ у CSS (шукай «СТАТУСИ»). */
const STATUSES = {
  wip: 'у розробці', done: 'завершено', paused: 'на паузі',
  idea: 'ідея', abandoned: 'закинуто', private: 'приватно', audit: 'security audit',
};

const HOBBIES = ['OSINT', 'hardware', 'VR (Quest 3)', 'PC gaming', 'pentesting', 'RF / wireless', 'коти', 'кава о 2 ночі'];

const FOOTER = 'зроблено у Львові';

/* ════ ПАСХАЛКИ ═════════════════════════════════════════
   Додати = скопіювати рядок. Поля:
   say  — текст у спливайці          fx — ефект або список: 'confetti' 'cat' 'hue' 'shake' 'flip' 'spin' 'rain:🍕'
   type:'click'  target — CSS-селектор, times — скільки кліків поспіль, gap — пауза між кліками (мс),
                 swap — на секунду підмінити текст елемента, cycle — тексти по кліках (довжина = times)
   type:'keys'   seq — слово або масив клавіш (друкуй на клавіатурі будь-де на сторінці)
   type:'idle'   seconds — через скільки секунд бездіяльності
   type:'longpress' target, ms — утримувати (дефолт 800)     type:'dblclick' target — подвійний клік/тап
   type:'time' seconds — через стільки секунд на сторінці    type:'return' visit — N-й візит (запамʼятовує браузер)
   type:'blur' title, say — коли перейшли на іншу вкладку (змінює заголовок вкладки)
   type:'bottom' — коли докрутили до кінця     type:'night' from/to — год. за київським часом, при заході
   На телефоні працюють click / longpress / dblclick / time / return / bottom / night / idle. keys — тільки з клавіатурою. */
const EGGS = [
  { type:'click', target:'#photo', times:5, say:'мяв. root-доступ видано 🐱', fx:'cat' },
  { type:'longpress', target:'#photo', say:'не тримай так довго, мені незручно 😳', fx:'shake' },
  { type:'dblclick', target:'#photo', say:'подвійний тап — ми не в інстаграмі ❤️', fx:'rain:❤️' },
  { type:'click', target:'#name', times:3, swap:'hacker', say:'ну привіт, hacker', fx:'shake' },
  { type:'click', target:'#clock', times:3, say:'час — ілюзія. кава — ні.', fx:'rain:☕' },
  { type:'click', target:'.card.s-abandoned', times:3, say:'F. хай спочиває з миром 🪦', fx:'rain:🕯️' },
  { type:'click', target:'.card.s-audit', times:3, say:'responsible disclosure, звісно 😇', fx:'hue' },
  { type:'click', target:'#egg', times:5, gap:6000, say:'status: OBEDIENT',
    cycle:['[ я думаю… ]','[ аналізую… ]','[ ініціалізація протоколу… ]','[ завантаження: 99% ]','[ КОМАНДУ ПРИЙНЯТО ]'] },
  { type:'keys', seq:['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
    say:'konami: god mode. ти точно перевіряв усе підряд', fx:['hue','confetti'] },
  { type:'keys', seq:'sudo', say:'lominka is not in the sudoers file. This incident will be reported.' },
  { type:'keys', seq:'rm -rf', say:'ну і нащо?', fx:'flip' },
  { type:'keys', seq:'слава україні', say:'Героям слава! 💙💛', fx:'rain:💙' },
  { type:'return', visit:3, say:'о, ти знову тут. третій раз — це вже дружба 🤝' },
  { type:'night', from:2, to:5, say:'о цій годині нормальні люди сплять. ми — ні.' },
  { type:'bottom', say:'дійшов до кінця. дякую, що дочитав' },
];

const CONSOLE_MSG = 'о, ти відкрив консоль.\nякщо знайшов баг — пиши, виправлю.\nякщо знайшов пасхалку — мовчи 🤫';
