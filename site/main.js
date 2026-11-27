const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root = document.documentElement;
root.style.setProperty('--accent', SITE.accent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };

/* ═══ рендер ═══ */
$('prompt').textContent = SITE.prompt;
$('name').innerHTML = '<span>' + esc(SITE.handle) + '</span>';
$('bio').innerHTML = SITE.bio;
$('avatar').src = SITE.avatar;
if (SITE.avatarWebp) $('avatarWebp').srcset = SITE.avatarWebp; else $('avatarWebp').remove();

const allLinks = SITE.links;
const linkHTML = (l, i) => {
  const ext = /^https?:/.test(l.href), mail = l.href.startsWith('mailto:');
  return `<a class="btn${i === 0 ? ' main' : ''}" href="${esc(l.href)}"${ext ? ' target="_blank" rel="noopener me"' : ''}${mail ? ' data-copy="' + esc(l.href.slice(7)) + '"' : ''}>${esc(l.label)}${ext ? ' <span aria-hidden="true">↗</span>' : ''}</a>`;
};
$('links').innerHTML = $('links2').innerHTML = allLinks.map(linkHTML).join('');
$('ctaText').textContent = SITE.contact || '';
if (!SITE.contact) $('contact-s').remove();
$('hint').innerHTML = matchMedia('(hover: hover)').matches ? 'натисни <kbd>/</kbd> — відкриється термінал' : '';
$('year').textContent = new Date().getFullYear();
$('fname').textContent = SITE.handle;
$('ftext').textContent = FOOTER;

const chips = t => t ? `<div class="chips">${(Array.isArray(t) ? t : t.split(/,\s*/)).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : '';
$('skills').innerHTML = SKILLS.map(([n, d, t]) => `<div class="card"><h3>${esc(n)}</h3><p>${esc(d)}</p>${chips(t)}</div>`).join('');

$('labMain').innerHTML = `<span class="state">${esc(LAB.main.status)}</span><h3>${esc(LAB.main.title)}</h3><p>${esc(LAB.main.desc)}</p>${chips(LAB.main.tags)}`;
$('inv').innerHTML = LAB.inventory.map(i => `<span class="chip">${esc(i)}</span>`).join('');
$('dev').innerHTML = LAB.devices.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');

const DEMO = [
  { name: 'Приклад: у розробці', status: 'wip', progress: 40, desc: 'Смужка прогресу і пунктирна рамка.', tags: ['Flutter'] },
  { name: 'Приклад: завершено', status: 'done', year: '2025', desc: 'Мʼятна картка з галочкою і кнопкою.', tags: ['Python'], link: 'https://github.com' },
  { name: 'Приклад: на паузі', status: 'paused', desc: 'Подвійна рамка — колись повернусь.' },
  { name: 'Приклад: ідея', status: 'idea', desc: 'Трохи нахилена картка з крапковою рамкою.' },
  { name: 'Приклад: закинуто', status: 'abandoned', desc: 'Викреслено й вицвіло.' },
  { name: 'Приклад: приватно', status: 'private', desc: 'Текст розмитий, поки не наведеш курсор.' },
];
const projList = PROJECTS.concat(location.hash === '#demo' ? DEMO : []);
const st = p => p.status in STATUSES ? p.status : 'private';
$('projects').innerHTML = projList.map(p => {
  const s = st(p);
  return `<article class="card s-${s}" data-s="${s}" data-label="${esc(STATUSES[s])}"${s === 'private' ? ' tabindex="0"' : ''}>
    <span class="state">${esc(STATUSES[s])}</span>${p.year ? `<span class="year">${esc(p.year)}</span>` : ''}
    <h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p>${chips(p.tags)}
    ${p.progress != null ? `<div class="bar" role="progressbar" aria-valuenow="${+p.progress}" aria-valuemin="0" aria-valuemax="100" title="${+p.progress}%"><i style="width:${+p.progress}%"></i></div>` : ''}
    ${p.log ? `<div class="log">${p.log.map(([k, x]) => `<div class="${k}">${{info:'[*]',cmd:'[!]',ok:'[✓]'}[k]} ${esc(x)}</div>`).join('')}</div>` : ''}
    ${p.link ? `<a class="btn sm" href="${esc(p.link)}" target="_blank" rel="noopener">відкрити ↗</a>` : ''}</article>`;
}).join('');

const used = Object.keys(STATUSES).filter(k => projList.some(p => st(p) === k));
const count = k => k === 'all' ? projList.length : projList.filter(p => st(p) === k).length;
if (used.length > 1) $('filters').innerHTML = ['all', ...used].map(k =>
  `<button type="button" class="fbtn${k === 'all' ? ' on' : ''}" aria-pressed="${k === 'all'}" data-k="${k}">${k === 'all' ? 'всі' : esc(STATUSES[k])} <small>${count(k)}</small></button>`).join('');
$('filters').onclick = e => {
  const b = e.target.closest('.fbtn'); if (!b) return;
  document.querySelectorAll('.fbtn').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  document.querySelectorAll('#projects .card').forEach(c => c.hidden = b.dataset.k !== 'all' && c.dataset.s !== b.dataset.k);
};
/* приватні картки: тап на телефоні відкриває/ховає текст */
$('projects').addEventListener('click', e => { const c = e.target.closest('.s-private'); if (c && !e.target.closest('a')) c.classList.toggle('open'); });

$('hobbies').innerHTML = HOBBIES.map(h => `<span>${esc(h)}</span>`).join('');

/* навігація по секціях + підсвітка активної */
const sections = [...document.querySelectorAll('main section')];
$('nav').innerHTML = sections.map(s => `<a href="#${s.id}">${esc(s.querySelector('h2').textContent.toLowerCase())}</a>`).join('');
if ('IntersectionObserver' in window) {
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navIO.observe(s));
}
addEventListener('scroll', () => $('top').classList.toggle('stuck', scrollY > 8), { passive: true });

/* поява карток при скролі */
if (!reduce && 'IntersectionObserver' in window) {
  const els = document.querySelectorAll('.card, .hobbies span, h2');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--d', (i % 4) * 60 + 'ms'); io.observe(el); });
}

/* тема: auto → light → dark */
const themes = ['auto', 'light', 'dark'], ticons = { auto: '◐', light: '☀', dark: '☾' };
let theme = store.get('theme') || 'auto';
const applyTheme = t => {
  theme = t;
  if (t === 'auto') delete root.dataset.theme; else root.dataset.theme = t;
  store.set('theme', t === 'auto' ? null : t);
  $('themeBtn').textContent = ticons[t]; $('themeBtn').title = 'тема: ' + t;
};
applyTheme(theme);
$('themeBtn').onclick = () => { applyTheme(themes[(themes.indexOf(theme) + 1) % 3]); toast('тема: ' + theme); };

/* копіювання пошти */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-copy]'); if (!a || e.ctrlKey || e.metaKey) return;
  if (!navigator.clipboard) return;
  e.preventDefault();
  navigator.clipboard.writeText(a.dataset.copy).then(() => toast('скопійовано: ' + a.dataset.copy), () => location.href = a.href);
});

const tick = () => $('clock').textContent = SITE.location + ' ' +
  new Date().toLocaleTimeString('uk-UA', { timeZone: SITE.tz, hour: '2-digit', minute: '2-digit' });
tick(); setInterval(tick, 10000);

(() => {
  const el = $('typing'), W = SITE.typewriter;
  if (reduce) { el.textContent = W[0]; return; }
  let w = 0, c = 0, del = false;
  (function step() {
    el.textContent = W[w].slice(0, c);
    if (!del && c === W[w].length) { del = true; return setTimeout(step, 1800); }
    if (del && c === 0) { del = false; w = (w + 1) % W.length; return setTimeout(step, 350); }
    c += del ? -1 : 1;
    setTimeout(step, del ? 30 : 70);
  })();
})();

/* ═══ міні-термінал ( / або кнопка >_ ) ═══ */
(() => {
  const dlg = $('term'), out = $('tout'), inp = $('tinput');
  if (!dlg.showModal) { $('termBtn').remove(); return; }
  const ps = SITE.prompt + ':~$';
  $('tps').textContent = ps; $('termTitle').textContent = SITE.prompt + ' — bash';
  const hist = []; let hi = 0;
  const print = (html, cls = '') => { out.insertAdjacentHTML('beforeend', `<div class="${cls}">${html}</div>`); out.scrollTop = out.scrollHeight; };
  const go = id => { dlg.close(); document.getElementById(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  const CMD = {
    help: ['список команд', () => Object.entries(CMD).map(([k, [d]]) => `<b>${k.padEnd(9)}</b> ${esc(d)}`).join('\n')],
    whoami: ['хто я', () => `${esc(SITE.handle)} · ${esc(SITE.location)}\n` + SITE.bio.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()],
    skills: ['що вмію', () => SKILLS.map(([n, d]) => `<b>${esc(n.padEnd(15))}</b> ${esc(d)}`).join('\n')],
    projects: ['проєкти', () => PROJECTS.map(p => `[${esc(STATUSES[st(p)])}] <b>${esc(p.name)}</b>`).join('\n')],
    lab: ['залізо', () => LAB.inventory.concat(LAB.devices.map(d => d.join(': '))).map(x => '· ' + esc(x)).join('\n')],
    contact: ['контакти', () => allLinks.map(l => `<a href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`).join('\n')],
    theme: ['змінити тему', () => { $('themeBtn').click(); return 'тема: ' + theme; }],
    goto: ['goto skills|lab|projects|hobbies', a => { const id = (a || '') + '-s'; if (!document.getElementById(id)) return 'нема такого розділу'; setTimeout(() => go(id), 150); return 'їду…'; }],
    date: ['котра година', () => new Date().toLocaleString('uk-UA', { timeZone: SITE.tz })],
    clear: ['очистити', () => { out.innerHTML = ''; return null; }],
    exit: ['закрити', () => { dlg.close(); return null; }],
  };
  const FUN = {
    sudo: 'lominka is not in the sudoers file. This incident will be reported.',
    ls: 'skills/  lab/  projects/  hobbies/  secrets/', 'cat': 'кіт не знайдений. він спить.',
    'cd secrets': 'permission denied', 'rm -rf /': 'ну і нащо? 🙃', coffee: '☕ brewing… done', hack: 'спершу responsible disclosure 😇',
    vim: 'тепер ти звідси не вийдеш. жартую — введи exit', ping: 'pong',
  };
  const run = line => {
    print(`<span class="pp">${esc(ps)}</span> ${esc(line)}`);
    const [c, ...a] = line.trim().split(/\s+/); if (!c) return;
    let r;
    if (CMD[c.toLowerCase()]) r = CMD[c.toLowerCase()][1](a.join(' '));
    else if (FUN[line.trim()] || FUN[c]) r = esc(FUN[line.trim()] || FUN[c]);
    else if (c === 'echo') r = esc(a.join(' '));
    else r = `${esc(c)}: command not found. спробуй <b>help</b>`;
    if (r != null) print(r, 'res');
  };
  const openT = () => { if (dlg.open) return; dlg.showModal(); if (!out.childElementCount) { print(`ласкаво просимо. введи <b>help</b>`, 'res'); } inp.focus(); };
  $('termBtn').onclick = openT;
  $('termClose').onclick = () => dlg.close();
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  addEventListener('keydown', e => {
    if ((e.key === '/' || e.key === '`') && !e.target.closest('input, textarea') && !dlg.open) { e.preventDefault(); openT(); }
  });
  $('tform').onsubmit = e => { e.preventDefault(); const v = inp.value; if (v.trim()) { hist.push(v); hi = hist.length; } inp.value = ''; run(v); };
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hi > 0) { inp.value = hist[--hi]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(CMD).filter(k => k.startsWith(inp.value)); if (m.length === 1) inp.value = m[0] + ' '; else if (m.length) print(m.join('  '), 'res'); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
})();

/* ═══ рушій пасхалок (конфіг — EGGS угорі файлу) ═══ */
let tt;
const toast = msg => { const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 3800); };
const rnd = (a, b) => a + Math.random() * (b - a);
const PAL = ['#ff5fa8', '#b99cff', '#5fd8ae', '#ffa66b', '#2b2140'];
const particles = (chars, n = 40) => { for (let i = 0; i < n; i++) {
  const s = document.createElement('span'); s.textContent = chars[i % chars.length];
  s.style.cssText = `position:fixed;top:-50px;left:${rnd(0, 100)}vw;font-size:${rnd(16, 34)}px;color:${PAL[i % PAL.length]};pointer-events:none;z-index:20`;
  document.body.append(s);
  s.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(115vh) rotate(${rnd(-540, 540)}deg)` }],
    { duration: rnd(1800, 3600), delay: rnd(0, 700), easing: 'cubic-bezier(.3,.6,.5,1)' }).onfinish = () => s.remove();
} };
const FX = {
  confetti: () => particles(['●', '■', '▲', '◆', '★'], 36),
  rain: e => particles([e || '✨'], 28),
  cat: () => { const s = document.createElement('span'); s.textContent = '🐈';
    s.style.cssText = 'position:fixed;bottom:12px;left:0;font-size:42px;pointer-events:none;z-index:20';
    document.body.append(s); s.animate([{ transform: 'translateX(-70px)' }, { transform: `translateX(${innerWidth + 70}px)` }], { duration: 4500 }).onfinish = () => s.remove(); },
  hue: () => { document.body.style.filter = 'hue-rotate(180deg) saturate(1.4)'; setTimeout(() => document.body.style.filter = '', 900); },
  shake: () => $('page').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }], { duration: 450 }),
  flip: () => $('page').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 1400, easing: 'ease-in-out' }),
  spin: () => $('photo').animate([{ transform: 'rotate(3deg)' }, { transform: 'rotate(723deg)' }], { duration: 900, easing: 'ease-in-out' }),
};
const fire = (e, el) => {
  if (e.say) toast(e.say);
  if (!reduce) [].concat(e.fx || []).forEach(x => { const [k, arg] = String(x).split(':'); FX[k] && FX[k](arg); });
  if (e.swap && el) { const n = el.querySelector('span') || el, old = n.textContent; n.textContent = e.swap; setTimeout(() => n.textContent = old, 1200); }
};

/* кліки */
const byTarget = {};
EGGS.filter(e => e.type === 'click').forEach(e => (byTarget[e.target] ||= []).push(e));
const state = {};
const restore = el => { if (el.dataset.o) el.textContent = el.dataset.o; };
document.addEventListener('click', ev => {
  for (const [sel, list] of Object.entries(byTarget)) {
    const el = ev.target.closest(sel); if (!el) continue;
    const st = state[sel] ||= { n: 0 };
    clearTimeout(st.t); st.n++;
    list.filter(e => e.times === st.n).forEach(e => fire(e, el));
    list.filter(e => e.cycle).forEach(e => { el.dataset.o ||= el.textContent; el.textContent = e.cycle[Math.min(st.n, e.cycle.length) - 1]; });
    if (st.n >= Math.max(...list.map(e => e.times))) { st.n = 0; st.t = setTimeout(() => restore(el), 4000); }
    else st.t = setTimeout(() => { st.n = 0; restore(el); }, Math.max(...list.map(e => e.gap || 2000)));
  }
});

/* клавіші */
let buf = [];
const KEYEGGS = EGGS.filter(e => e.type === 'keys').map(e => ({ e, seq: (Array.isArray(e.seq) ? e.seq : [...e.seq]).join('|') , len: Array.isArray(e.seq) ? e.seq.length : [...e.seq].length }));
addEventListener('keydown', ev => {
  if (ev.target.closest && ev.target.closest('input, textarea, [contenteditable]')) return;
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(ev.key)) return;
  buf.push(ev.key.length === 1 ? ev.key.toLowerCase() : ev.key); buf = buf.slice(-40);
  KEYEGGS.forEach(({ e, seq, len }) => { if (buf.slice(-len).join('|') === seq) { fire(e); buf = []; } });
});

/* бездіяльність, кінець сторінки, ніч */
EGGS.filter(e => e.type === 'idle').forEach(e => {
  let t; const arm = () => { clearTimeout(t); t = setTimeout(() => fire(e), e.seconds * 1000); };
  ['pointermove', 'keydown', 'scroll', 'click'].forEach(n => addEventListener(n, arm, { passive: true })); arm();
});
EGGS.filter(e => e.type === 'bottom').forEach(e => {
  let done = false;
  addEventListener('scroll', () => { if (!done && innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { done = true; fire(e); } }, { passive: true });
});
EGGS.filter(e => e.type === 'night').forEach(e => {
  const h = parseInt(new Date().toLocaleString('en-GB', { timeZone: SITE.tz, hour: '2-digit', hour12: false }), 10) % 24;
  if (h >= e.from && h < e.to) setTimeout(() => fire(e), 2500);
});
/* довгий тап, подвійний клік, час на сторінці, повторні візити, перехід на іншу вкладку */
const under = (ev, sel) => ev.target.closest && ev.target.closest(sel);
EGGS.filter(e => e.type === 'longpress').forEach(e => {
  let t;
  document.addEventListener('pointerdown', ev => { const el = under(ev, e.target); if (!el) return; clearTimeout(t); t = setTimeout(() => fire(e, el), e.ms || 800); });
  ['pointerup', 'pointercancel', 'pointermove'].forEach(n => document.addEventListener(n, () => clearTimeout(t), { passive: true }));
});
document.addEventListener('contextmenu', ev => { if (EGGS.some(e => e.type === 'longpress' && under(ev, e.target))) ev.preventDefault(); });
EGGS.filter(e => e.type === 'dblclick').forEach(e =>
  document.addEventListener('dblclick', ev => { const el = under(ev, e.target); if (el) fire(e, el); }));
EGGS.filter(e => e.type === 'time').forEach(e => setTimeout(() => fire(e), e.seconds * 1000));
let visits = 1;
visits = (+store.get('visits') || 0) + 1; store.set('visits', visits);
EGGS.filter(e => e.type === 'return' && e.visit === visits).forEach(e => setTimeout(() => fire(e), 3000));
EGGS.filter(e => e.type === 'blur').forEach(e => {
  const old = document.title;
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.title = e.title; else { document.title = old; if (e.say) toast(e.say); } });
});
console.log('%c' + CONSOLE_MSG, 'color:#ff5fa8;font:600 13px monospace');
