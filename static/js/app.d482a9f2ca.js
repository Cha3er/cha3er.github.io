'use strict';
/* ============================================================
   API BASE — GitHub Pages -> Cloudflare Tunnel
   На github.io адрес API берётся из ./api-url.json (рядом с сайтом,
   обновляется скриптом туннеля). Локально (localhost) — same-origin.
   Настройки в localStorage можно отменить: localStorage.removeItem('apiOverride')
   ============================================================ */
let API_BASE = '';
let apiReadyResolve = null;
const apiReady = new Promise((r) => { apiReadyResolve = r; });
const _rawFetch = window.fetch.bind(window);
(function loadApiBase() {
    const h = location.hostname;
    const override = ('' + (localStorage.getItem('apiOverride') || '')).trim();
    if (override) {
        API_BASE = override.replace(/\/+$/, '');
        apiReadyResolve(true);
        return;
    }
    // Абсолютный путь от корня сайта: на GitHub Pages страница может
    // открываться как 404.html на вложенном пути (например /watch/...),
    // относительный './api-url.json' там не находится и API разваливался.
    if (h.endsWith('.github.io') || h === 'cha3er.github.io') {
        _rawFetch(location.origin + '/api-url.json?t=' + Date.now(), { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no api-url.json'))))
            .then((j) => {
                if (j && j.api) API_BASE = String(j.api).trim().replace(/\/+$/, '');
                apiReadyResolve(!!API_BASE);
            })
            .catch(() => apiReadyResolve(false));
    } else {
        apiReadyResolve(true);
    }
})();
window.fetch = function (input, init) {
    try {
        if (typeof input === 'string' && API_BASE) {
            if (input.startsWith('/api/') || input.startsWith('/uploads/')) {
                input = API_BASE + input;
                init = { credentials: 'include', ...(init || {}) };
            }
        }
    } catch (e) { /* игнорируем — fallback на оригинальный fetch */ }
    return _rawFetch(input, init);
};
/* ============================================================
   ICONS
   ============================================================ */
const ICONS = {
    playFill: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z"/></svg>',
    heart: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    play: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
    bookmark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>',
    chevronLeft: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronRight: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    alert: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    flag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    film: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5"/></svg>',
    sparkles: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.8L19 9.5l-4.7 2L12 17l-1.9-5.5L5 9.5l5.1-1.7z"/></svg>',
    layers: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    clapper: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.4-2.2 1.5-2.5l13.1-3.6c1.1-.3 2.2.4 2.5 1.5Z"/><path d="m6.2 5.3 3.1 4"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    anime: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.39 12.06a10 10 0 1 1-8.45-8.45"/><path d="M21.39 12.06 12.34 12.66 21.39 12.06z"/><path d="m12.34 12.66 9.05-.6-6.44-6.44a1 1 0 0 0-1.71.55z"/></svg>',
    wand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};
function icon(name) { return ICONS[name] || ''; }

/* ============================================================
   STATE
   ============================================================ */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

let HOME_DATA = null;
let libraryState = safeParse(localStorage.getItem('mediaserver_library'), {});
let recentlyViewed = safeParse(localStorage.getItem('mediaserver_recent'), []);
let deletedState = safeParse(localStorage.getItem('mediaserver_deleted'), { library: {}, history: {}, progress: {} });
let accountUser = null;
let accountRevision = 0;
let accountMode = 'login';
let accountActionQueue = Promise.resolve();
let accountPendingActions = 0;
let accountPollTimer = null;

let currentItem = null;
let currentPlayerButtons = [];
let playerSources = [];          // [{key,label,icon,ok,url,mount,note}]
let activeSourceKey = '';
let playerSrcPanelOpen = false;
let titlePageRequestId = 0;
let extraRequestId = 0;
let hlsInstance = null;
let kinoboxHintTimer = null;
let searchDebounceTimer = null;
let searchRequestId = 0;
let currentGridType = null;
let titleOpen = false;
let savedScrollY = 0;
let randomTypes = new Set(['movie', 'series', 'anime', 'cartoon']);
let randomExcludeId = '';
let catalogGenres = new Set();

/* ===== Разовая миграция: оценки 10-бальной шкалы → 5-бальной ===== */
(function migrateRatings() {
    try {
        if (localStorage.getItem('mediaserver_rating_scale') === '5') return;
        const lib = safeParse(localStorage.getItem('mediaserver_library'), {});
        const ratings = lib.ratings || {};
        let changed = false;
        Object.values(ratings).forEach(e => {
            if (e && Number(e.rating) > 5) {
                // 6..10 → 4..5 (округляем в верхнюю половину), 6→4, 7→4.5, 8→5
                e.rating = Math.min(5, Math.round((e.rating / 10) * 5 * 2) / 2);
                changed = true;
            }
        });
        if (changed) {
            lib.ratings = ratings;
            localStorage.setItem('mediaserver_library', JSON.stringify(lib));
            libraryState = lib;
        }
        localStorage.setItem('mediaserver_rating_scale', '5');
    } catch (e) { }
})();

function safeParse(str, fallback) { try { const v = JSON.parse(str); return v == null ? fallback : v; } catch (e) { return fallback; } }

/* ============================================================
   HELPERS
   ============================================================ */
function img(url) {
    if (!url) return '';
    // локальные загруженные файлы — напрямую, без прокси
    if (url.startsWith('/uploads/')) return API_BASE ? API_BASE + url : url;
    return `${API_BASE}/api/img?url=${encodeURIComponent(url)}`;
}
function placeholderSvg(w, h) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#141417"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><g stroke="#3a3a42" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(${w / 2 - 14},${h / 2 - 14})"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5"/></g></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function normalizeClientTitle(v) { return String(v || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''); }
function itemKey(it) {
    if (it?.kinopoiskId) return `kp:${it.kinopoiskId}`;
    if (it?.tmdbId) return `tmdb:${it.tmdbId}:${it?.type || ''}`;
    if (it?.imdbId) return `imdb:${it.imdbId}`;
    return `title:${normalizeClientTitle(it?.title || '')}:${it?.year || ''}:${it?.type || ''}`;
}
function coarseTypeOf(t) {
    t = String(t || '').toLowerCase();
    if (t.includes('аним')) return 'anime';
    if (t.includes('сериал') || t.includes('series') || t === 'tv') return 'series';
    return 'movie';
}
function itemKeys(it) {
    it = it || {};
    const keys = [];
    if (it.kinopoiskId) keys.push(`kp:${it.kinopoiskId}`);
    if (it.imdbId) keys.push(`imdb:${it.imdbId}`);
    if (it.tmdbId) keys.push(`tmdb:${it.tmdbId}`);
    keys.push(itemKey(it));
    const tn = normalizeClientTitle(it.title || '');
    if (tn) keys.push(`title:${tn}:${String(it.year || '').slice(0, 4)}:${coarseTypeOf(it.type)}`);
    return keys;
}
function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function escapeAttr(v) { return escapeHtml(v).replace(/`/g, '&#96;'); }
function uniqueGenres(arr) {
    const seen = new Set();
    const out = [];
    (arr || []).forEach(g => {
        const name = (typeof g === 'string' ? g : (g.genre || g.name || '')).trim();
        if (name && !seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); out.push(name); }
    });
    return out;
}
function isInLibrary(type, it) { return !!(libraryState[type] && libraryState[type][itemKey(it)]); }

function ratingBadgesHtml(it) {
    const tmdb = Number(it.rating_tmdb), kp = Number(it.rating_kp), imdb = Number(it.rating_imdb);
    let parts = '';
    if (Number.isFinite(kp) && kp > 0) parts += `<span class="rating-pill">${icon('star')}<span style="color:#ff8a3d">KP</span> ${kp.toFixed(1)}</span>`;
    if (Number.isFinite(imdb) && imdb > 0) parts += `<span class="rating-pill">${icon('star')}<span style="color:#f5c518">IMDb</span> ${imdb.toFixed(1)}</span>`;
    if (Number.isFinite(tmdb) && tmdb > 0) parts += `<span class="rating-pill">${icon('star')}<span style="color:#2dd4bf">TMDB</span> ${tmdb.toFixed(1)}</span>`;
    return parts;
}
function statusBadgesHtml(it) {
    let parts = '';
    if (isInLibrary('favorites', it)) parts += `<span class="status-chip bg-marquee/80 text-white">${icon('heart')}</span>`;
    if (isInLibrary('watching', it)) parts += `<span class="status-chip bg-tmdbc/85 text-black">Смотрю</span>`;
    if (isInLibrary('planned', it)) parts += `<span class="status-chip bg-goldHi/90 text-black">Буду смотреть</span>`;
    if (isInLibrary('watched', it)) parts += `<span class="status-chip bg-ok/90 text-black">Просмотрено</span>`;
    if (isInLibrary('onhold', it)) parts += `<span class="status-chip bg-amber-500/90 text-black">Отложено</span>`;
    if (isInLibrary('dropped', it)) parts += `<span class="status-chip bg-red-500/85 text-white">Брошено</span>`;
    return parts;
}
function typeLabel(it) { return it.type || ''; }

/* ============================================================
   TOASTS
   ============================================================ */
function toast(msg, kind) {
    const host = $('#toastHost');
    const el = document.createElement('div');
    el.className = 'toast text-sm px-4 py-2.5 rounded-xl border shadow-card ' + (kind === 'error' ? 'bg-marquee/15 border-marquee/40 text-[#c4b5fd]' : 'bg-surface2 border-border text-ink');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s ease'; setTimeout(() => el.remove(), 320); }, 2600);
}

/* ============================================================
   ССЫЛКИ И РОУТИНГ
   ============================================================ */
function typeSlug(it) {
    const t = String((it && it.type) || '').toLowerCase();
    if (t.includes('аним')) return 'anime';
    if (t.includes('сериал')) return 'series';
    return 'film';
}
function titleHref(it) {
    const kp = String((it && it.kinopoiskId) || '').trim();
    if (/^\d+$/.test(kp)) return `/${typeSlug(it)}/${kp}/`;
    return '/t/' + encodeURIComponent(itemKey(it));
}
function handleCardActivate(ev, key) {
    if (ev.button !== 0) return true;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return true;
    ev.preventDefault();
    navigateToTitle(key);
    return false;
}
function openTitleByKey(key) { navigateToTitle(key); }

function showMainViews() {
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    if (currentGridType) {
        $('#gridView').classList.remove('hidden');
        $('#homeView').classList.add('hidden');
    } else {
        $('#gridView').classList.add('hidden');
        $('#homeView').classList.remove('hidden');
    }
}

function showTitleView() {
    savedScrollY = window.scrollY;
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#titleView').classList.remove('hidden');
    titleOpen = true;
    window.scrollTo(0, 0);
}

function hideTitlePageSilently() {
    const wasOpen = titleOpen;
    destroyPlayer();
    staffHoverRemoveCard();
    currentItem = null;
    titlePageRequestId++;
    extraRequestId++;
    $('#titleView').classList.add('hidden');
    $('#titleModalBody').innerHTML = '';
    titleOpen = false;
    // при возврате показываем ту вкладку, из которой открыли тайтл
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/profile') {
        $('#profileView')?.classList.remove('hidden');
    } else if (path === '/anime') {
        $('#animeView')?.classList.remove('hidden');
    } else if (path === '/settings') {
        $('#settingsView')?.classList.remove('hidden');
    } else {
        showMainViews();
    }
    if (wasOpen) window.scrollTo(0, savedScrollY || 0);
}

function leaveTitleIfNeeded(nextGridType) {
    if ($('#titleView').classList.contains('hidden')) return;
    if (nextGridType !== undefined) currentGridType = nextGridType;
    // адрес в браузере выставит вызывающая функция (openCatalog / openLibrary / поиск)
    hideTitlePageSilently();
}

function navigateToTitle(key) {
    const it = getRegistered(key);
    const target = it ? titleHref(it) : ('/t/' + encodeURIComponent(key));
    if (location.pathname !== target) history.pushState({ t: key }, '', target);
    loadTitlePage(key);
}

async function loadTitlePage(key) {
    const reqId = ++titlePageRequestId;
    showTitleView();
    destroyPlayer();
    $('#titleModalBody').innerHTML = titleSkeletonHTML();

    let it = getRegistered(key);
    // Если в кэше неполная карточка (нет описания/постера) — дозагружаем с сервера
    if (it && (!it.description || !it.poster || !(it.genres || []).length)) {
        try {
            const res = await fetch(`/api/title/by-key?key=${encodeURIComponent(key)}`);
            if (res.ok) {
                const full = await res.json();
                if (full && full.title) {
                    it = full;
                    registerItem(full);
                }
            }
        } catch (e) { /* остаётся кэшированная версия */ }
    }
    if (!it) {
        try {
            const res = await fetch(`/api/title/by-key?key=${encodeURIComponent(key)}`);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            it = await res.json();
            registerItem(it);
        } catch (e) {
            if (reqId !== titlePageRequestId) return;
            $('#titleModalBody').innerHTML = `<div class="flex flex-col items-center justify-center py-28 gap-4 text-muted"><span class="text-warn">${icon('alert')}</span><p>Не удалось открыть тайтл.</p><button class="btn-primary px-5 h-10 rounded-xl text-sm" onclick="goHome()">На главную</button></div>`;
            return;
        }
    }
    if (reqId !== titlePageRequestId) return;
    await openTitleModal(it);
}

function closeTitleModal() {
    const fromGridType = currentGridType;
    hideTitlePageSilently();
    if (location.pathname.startsWith('/t/') ||
        /^\/(film|series|anime)\/\d+\/?$/.test(location.pathname)) {
        // возвращаемся в раздел, из которого открыли тайтл
        const backPath = fromGridType === 'catalog' ? '/catalog' : libraryRoute(fromGridType);
        history.pushState({}, '', backPath);
    }
}

function titleBack() {
    if (history.state && history.state.t) history.back();
    else closeTitleModal();
}

window.addEventListener('popstate', () => routeFromLocation());

/* ===== URL-адреса разделов (ссылки, F5, кнопки «назад») ===== */
const LIBRARY_ROUTES = {
    '/favorites': 'favorites',
    '/watching': 'watching',
    '/planned': 'planned',
    '/watched': 'watched',
    '/onhold': 'onhold',
    '/dropped': 'dropped',
    '/history': 'history',
};
function libraryRoute(type) {
    for (const p in LIBRARY_ROUTES) if (LIBRARY_ROUTES[p] === type) return p;
    return '/';
}
function pushRoute(path) {
    if (location.pathname !== path) history.pushState({}, '', path);
}

async function routeFromLocation() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    let m = path.match(/^\/(film|series|anime)\/(\d+)$/);
    if (m) return loadTitlePage('kp:' + m[2]);
    m = path.match(/^\/t\/(.+)$/);
    if (m) {
        let key = m[1];
        try { key = decodeURIComponent(key); } catch (e) { }
        return loadTitlePage(key);
    }
    m = path.match(/^\/actor\/(\d+)$/);
    if (m) return loadStaffPage(m[1]);
    if (path === '/random') {             // «Случайное» — модалка поверх страницы
        hideTitlePageSilently();
        showRandomModal();
        return;
    }
    closeRandomModalSilent();
    hideTitlePageSilently();
    if (path === '/') {
        const q = new URLSearchParams(location.search).get('q');
        if (q && q.trim()) { showAllSearchResults(q.trim(), true); return; }
    }
    if (path === '/anime') { openAnime(true); return; }
    if (path === '/catalog') { openCatalog(true); return; }
    if (path === '/list') { openList(true); return; }
    if (LIBRARY_ROUTES[path]) { openLibrary(LIBRARY_ROUTES[path], true); return; }
    if (path === '/profile') { openProfile(true); return; }
    if (path === '/settings') { openSettings(true); return; }
    if (currentGridType === 'search') { showMainViews(); return; }   // поиск живёт на «/»
    currentGridType = null;
    stopSearchUpdates();
    hideCatalogChrome();
    showMainViews();
    setActiveNav('home');
}

/* ============================================================
   CARD REGISTRY + CARD
   ============================================================ */
const ITEM_REGISTRY = new Map();
const ITEM_REGISTRY_CAP = 600;
function registerItem(it) {
    const k = itemKey(it);
    if (ITEM_REGISTRY.has(k)) ITEM_REGISTRY.delete(k);
    ITEM_REGISTRY.set(k, it);
    if (ITEM_REGISTRY.size > ITEM_REGISTRY_CAP) ITEM_REGISTRY.delete(ITEM_REGISTRY.keys().next().value);
    return k;
}
function getRegistered(k) { return ITEM_REGISTRY.get(k); }

function typeKeyOf(it) {
    const t = String((it && it.type) || '').toLowerCase();
    if (t.includes('аним')) return 'anime';
    if (t.includes('мульт')) return 'cartoon';
    if (t.includes('сериал')) return 'series';
    return 'movie';
}

/* один рейтинг на карточке: KP → IMDb → TMDB, цвет по значению */
function cardRatingHtml(it) {
    const kp = Number(it.rating_kp), imdb = Number(it.rating_imdb), tmdb = Number(it.rating_tmdb);
    let val = 0;
    if (Number.isFinite(kp) && kp > 0) val = kp;
    else if (Number.isFinite(imdb) && imdb > 0) val = imdb;
    else if (Number.isFinite(tmdb) && tmdb > 0) val = tmdb;
    if (!val) return '';
    const cls = val >= 7 ? 'rating-pill--hi' : (val >= 5 ? 'rating-pill--mid' : 'rating-pill--low');
    return `<span class="rating-pill ${cls}">${icon('star')} ${val.toFixed(1)}</span>`;
}

/* мета-строка под названием: год · тип (цветной) · жанры */
function cardMetaHtml(it) {
    const parts = [];
    if (it.year) parts.push(`<span>${escapeHtml(String(it.year))}</span>`);
    if (it.type) parts.push(`<span class="cm-type cm-type--${typeKeyOf(it)}">${escapeHtml(it.type)}</span>`);
    const genres = uniqueGenres(it.genres || []).slice(0, 2).join(', ');
    if (genres) parts.push(`<span class="cm-genres">${escapeHtml(genres)}</span>`);
    if (!parts.length) return '';
    return `<p class="card-meta">${parts.join('<span class="cm-sep">·</span>')}</p>`;
}

function isNewRelease(it) {
    const y = parseInt(String(it.year || '').slice(0, 4), 10);
    return Number.isFinite(y) && y >= new Date().getFullYear();
}

function renderCard(it, opts) {
    opts = opts || {};
    const key = registerItem(it);
    const safeKey = escapeAttr(key);
    const href = escapeAttr(titleHref(it));
    const poster = img(it.poster) || placeholderSvg(300, 450);
    const removeBtnHtml = opts.removable ? `
<button class="w-7 h-7 rounded-full bg-black/65 hover:bg-marquee flex items-center justify-center backdrop-blur transition shrink-0"
title="Удалить из истории" aria-label="Удалить из истории"
onclick="event.preventDefault();event.stopPropagation();removeHistory('${safeKey}')">${icon('trash')}</button>` : '';
    const newBadge = isNewRelease(it) ? `<span class="status-chip card-new">New</span>` : '';
    const statusHtml = statusBadgesHtml(it);
    const rightStackHtml = (removeBtnHtml || newBadge || statusHtml)
        ? `<div class="card-badges absolute top-2 right-2 z-10 flex flex-col gap-1 items-end max-w-[62%]">${removeBtnHtml}${newBadge}${statusHtml}</div>`
        : '';
    const ratingHtml = cardRatingHtml(it);
    const desc = (it.description || '').trim();
    const quickHtml = `
<div class="card-quick">
 <button type="button" class="cq-btn cq-fav${isInLibrary('favorites', it) ? ' is-on' : ''}" title="В избранное" aria-label="В избранное"
  onclick="event.preventDefault();event.stopPropagation();cardQuickAction('favorites','${safeKey}')">${icon('heart')}</button>
 <button type="button" class="cq-btn cq-watch${isInLibrary('watching', it) ? ' is-on' : ''}" title="Смотрю" aria-label="Отметить «смотрю»"
  onclick="event.preventDefault();event.stopPropagation();cardQuickAction('watching','${safeKey}')">${icon('play')}</button>
 <button type="button" class="cq-btn cq-plan${isInLibrary('planned', it) ? ' is-on' : ''}" title="Буду смотреть" aria-label="Буду смотреть"
  onclick="event.preventDefault();event.stopPropagation();cardQuickAction('planned','${safeKey}')">${icon('bookmark')}</button>
</div>`;
    return `
<a class="poster-card card-focusable" draggable="false" href="${href}" data-ckey="${safeKey}"
aria-label="${escapeAttr(it.title)}${it.year ? ', ' + escapeAttr(it.year) : ''}"
onclick="return handleCardActivate(event, '${safeKey}')">
<div class="poster-wrap">
<img src="${poster}" alt="" loading="lazy" class="poster-img" onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
<div class="poster-scrim"></div>
<div class="poster-spotlight"></div>
<div class="poster-ring"></div>
 ${ratingHtml ? `<div class="absolute top-2 left-2 right-20 flex flex-wrap gap-1">${ratingHtml}</div>` : ''}
 ${rightStackHtml}
<div class="card-play">${icon('playFill')}</div>
 ${quickHtml}
 ${desc ? `<div class="card-info"><p class="ci-title">${escapeHtml(it.title)}</p><p class="ci-desc">${escapeHtml(desc)}</p></div>` : ''}
 <div class="absolute bottom-0 left-0 right-0 p-2.5">
 <p class="text-[13px] font-semibold leading-snug line-clamp-2 text-ink">${escapeHtml(it.title)}</p>
  ${cardMetaHtml(it)}
  ${opts.role ? `<p class="text-[10px] text-faint mt-0.5 truncate">${escapeHtml(opts.role)}</p>` : ''}
 </div>
</div>
</a>`;
}

/* ===== Быстрые действия на карточках (кнопки при наведении) ===== */
const CQ_TOASTS = {
    favorites: ['Добавлено в избранное', 'Убрано из избранного'],
    watching: ['Отмечено: смотрю', 'Снят статус «смотрю»'],
    planned: ['Добавлено в «буду смотреть»', 'Убрано из «буду смотреть»'],
};
function cardQuickAction(type, key) {
    const it = getRegistered(key);
    if (!it) return;
    const was = isInLibrary(type, it);
    // главная/каталог/поиск — лёгкий режим: карточка обновляется на месте,
    // ленты не перерисовываются (ховер и прокрутка не сбиваются)
    window._cardQuickLite = !(currentGridType && LIBRARY_META[currentGridType]);
    try { setLibraryStatus(type, it); } finally { window._cardQuickLite = false; }
    refreshCardQuickState(key);
    const msg = (CQ_TOASTS[type] || [])[was ? 1 : 0];
    if (msg) toast(msg);
}
/* кнопки и бейджи одной карточки — на месте, без перерисовки сетки */
function refreshCardQuickState(key) {
    const it = getRegistered(key);
    if (!it) return;
    $$('.poster-card[data-ckey="' + CSS.escape(key) + '"]').forEach(card => {
        const badges = card.querySelector('.card-badges');
        if (badges) {
            const keep = [];
            const rm = badges.querySelector('button[title="Удалить из истории"]');
            if (rm) keep.push(rm.outerHTML);
            const nw = badges.querySelector('.card-new');
            if (nw) keep.push(nw.outerHTML);
            badges.innerHTML = keep.join('') + statusBadgesHtml(it);
        }
        const q = card.querySelector('.card-quick');
        if (q) {
            const set = (cls, on) => { const b = q.querySelector(cls); if (b) b.classList.toggle('is-on', !!on); };
            set('.cq-fav', isInLibrary('favorites', it));
            set('.cq-watch', isInLibrary('watching', it));
            set('.cq-plan', isInLibrary('planned', it));
        }
    });
}


/* ============================================================
   SKELETON GENERATORS
   ============================================================ */
function titleSkeletonHTML() {
    return `
<div class="tp-wrap">
<div class="tp-grid">
<aside>
  <div class="tp-sticky">
    <div class="tp-poster skeleton"></div>
    <div class="h-12 rounded-xl skeleton"></div>
    <div class="grid grid-cols-2 gap-2">
      <div class="h-9 rounded-xl skeleton"></div>
      <div class="h-9 rounded-xl skeleton"></div>
    </div>
    <div class="h-9 rounded-xl skeleton"></div>
    <div class="h-9 rounded-xl skeleton"></div>
  </div>
</aside>
<div class="min-w-0 space-y-6">
  <div class="h-3.5 w-64 skeleton rounded"></div>
  <div class="h-12 md:h-16 w-4/5 skeleton rounded-xl"></div>
  <div class="flex gap-2 flex-wrap">
    <div class="h-9 w-28 skeleton rounded-lg"></div>
    <div class="h-9 w-24 skeleton rounded-lg"></div>
    <div class="h-9 w-24 skeleton rounded-lg"></div>
    <div class="h-9 w-20 skeleton rounded-lg"></div>
  </div>
  <div class="flex gap-2 flex-wrap">${'<div class="h-8 w-24 rounded-full skeleton"></div>'.repeat(5)}</div>
  <div class="space-y-2">
    <div class="h-4 w-full skeleton rounded"></div>
    <div class="h-4 w-11/12 skeleton rounded"></div>
    <div class="h-4 w-4/6 skeleton rounded"></div>
  </div>
</div>
</div>
<div class="mt-10 md:mt-14">
<div class="h-6 w-40 skeleton rounded mb-4"></div>
<div class="player-shell">
  <div class="player-frame skeleton"></div>
  <div class="player-panel"><div class="h-8 w-64 skeleton rounded-lg"></div></div>
</div>
</div>
</div>`;
}

function cardSkeletonHTML() {
    return `
        <div class="poster-card">
            <div class="poster-wrap skeleton"></div>
            <div class="mt-2 h-3 w-full skeleton rounded"></div>
            <div class="mt-1.5 h-3 w-3/4 skeleton rounded"></div>
        </div>`;
}

function gridSkeletonHTML(count = 4) {
    const cards = Array.from({ length: count }, () => cardSkeletonHTML()).join('');
    return `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">${cards}</div>`;
}

function searchDropdownSkeletonHTML() {
    return `
        <div class="px-3 py-2">
            ${Array.from({ length: 4 }, () => `
                <div class="flex items-center gap-3 p-2 rounded-xl">
                    <div class="w-11 h-16 skeleton rounded-lg shrink-0"></div>
                    <div class="flex-1 min-w-0 space-y-2">
                        <div class="h-3 w-3/4 skeleton rounded"></div>
                        <div class="h-2 w-1/2 skeleton rounded"></div>
                    </div>
                </div>`).join('')}
        </div>`;
}

/* ============================================================
   CAROUSELS / HOME
   ============================================================ */
const HOME_SECTIONS = [
    { key: 'trending', title: 'В тренде', icon: 'sparkles' },
    { key: 'anime', title: 'Аниме', icon: 'anime' },
    { key: 'popular', title: 'Популярное сейчас', icon: 'film' },
    { key: 'topRated', title: 'Лучшие по рейтингу', icon: 'star' },
    { key: 'newReleases', title: 'Новинки', icon: 'wand' },
    { key: 'series', title: 'Популярные сериалы', icon: 'layers' },
    { key: 'topSeries', title: 'Лучшие сериалы', icon: 'star' },
];

function renderRow(rowKey, title, iconName, items) {
    if (!items || !items.length) return '';
    return `
<section class="row-group relative" aria-label="${escapeAttr(title)}">
<div class="flex items-center gap-2.5 mb-3 px-0.5">
<span class="row-head-ic">${icon(iconName)}</span>
<h2 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">${escapeHtml(title)}</h2>
<div class="row-head">
<button type="button" class="row-head-btn" onclick="scrollRow(this,-1)" aria-label="Прокрутить назад">${icon('chevronLeft')}</button>
<button type="button" class="row-head-btn" onclick="scrollRow(this,1)" aria-label="Прокрутить вперёд">${icon('chevronRight')}</button>
</div>
</div>
<div class="row-scroller hide-scrollbar" data-row="${rowKey}">
 ${items.map(it => `<div class="w-[132px] sm:w-[150px] md:w-[168px]">${renderCard(it)}</div>`).join('')}
</div>
</section>`;
}
function scrollRow(btn, dir) {
    const row = btn.closest('.row-group').querySelector('.row-scroller');
    row.scrollBy({ left: dir * Math.max(480, row.clientWidth * 0.85), behavior: 'smooth' });
}

function renderHistoryRow() {
    const valid = (recentlyViewed || []).filter(x => x && x.title).slice(0, 20);
    if (!valid.length) return '';
    return renderRow('history', 'Вы недавно смотрели', 'clock', valid);
}

function fmtWatch(sec) {
    sec = Math.floor(Number(sec) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}
function continueItems() {
    const data = safeParse(localStorage.getItem('mediaserver_progress'), {});
    const rows = [];
    for (const [key, p] of Object.entries(data || {})) {
        if (p && Number(p.time) > 60) rows.push({ key, ...p });
    }
    rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return rows.slice(0, 12);
}
function renderContinueRow() {
    const rows = continueItems();
    if (!rows.length) return '';
    const items = rows
        .map(p => getRegistered(p.key) || (recentlyViewed || []).find(x => itemKey(x) === p.key))
        .filter(x => x && x.title);
    if (!items.length) return '';
    return renderRow('continue', 'Продолжить просмотр', 'play', items);
}

function renderHome() {
    const box = $('#homeSections');
    if (!HOME_DATA) { return; }
    const parts = [renderContinueRow(), ...HOME_SECTIONS.map(s => renderRow(s.key, s.title, s.icon, HOME_DATA[s.key]))];
    parts.push(renderHistoryRow());
    // не теряем прокрутку лент при перерисовке главной
    const savedScrolls = {};
    $$('#homeSections .row-scroller').forEach(r => { savedScrolls[r.dataset.row] = r.scrollLeft; });
    box.innerHTML = parts.filter(Boolean).join('');
    $$('#homeSections .row-scroller').forEach(r => {
        if (savedScrolls[r.dataset.row] != null) r.scrollLeft = savedScrolls[r.dataset.row];
    });
    $('#homeSections').classList.remove('hidden');

    const trendItems = ((HOME_DATA.trending || []).concat(HOME_DATA.popular || []))
        .filter(x => x && x.title)
        .filter((x, i, arr) => arr.findIndex(y => itemKey(y) === itemKey(x)) === i)
        .slice(0, 3);
    if (trendItems.length) {
        heroSlides = trendItems;
        heroBuildDots();
        $('#hero').classList.toggle('is-slider', heroSlides.length > 1);
        heroShow(0, true);
            heroPrewarm();
        $('#heroSkeleton').classList.add('hidden');
        $('#hero').classList.remove('hidden');
    } else {
        heroSlides = [];
        $('#hero').classList.remove('is-slider');
        $('#heroSkeleton').classList.add('hidden');
    }
    enableDragScroll('.row-scroller');
    updateRowArrows();
    requestAnimationFrame(updateRowArrows);
    ensureTooltips();
}
function updateHeroFavBtn() {
    const btn = $('#heroFavBtn'); if (!btn || !window._heroKey) return;
    const it = getRegistered(window._heroKey);
    const fav = it && isInLibrary('favorites', it);
    btn.classList.toggle('is-active', !!fav);
    btn.querySelector('span').textContent = fav ? 'В избранном' : 'В избранное';
}
function heroToggleFavorite() {
    const it = getRegistered(window._heroKey);
    if (it) { setLibraryStatus('favorites', it); updateHeroFavBtn(); }
}
function openHero() { if (window._heroKey) navigateToTitle(window._heroKey); }

/* ===== Hero-слайдер: топ-3 трендовых ===== */
const HERO_INTERVAL = 10;   // сек до автопереключения
let heroTimer = null;
let heroPaused = false;
let heroSlideShownAt = 0;   // когда текущий слайд начал показ (для остатка при паузе)
let heroSlides = [];
let heroIdx = 0;

function heroMetaHtml(it) {
    const parts = [];
    const kp = Number(it.rating_kp), imdb = Number(it.rating_imdb), tmdb = Number(it.rating_tmdb);
    let val = 0;
    if (Number.isFinite(kp) && kp > 0) val = kp;
    else if (Number.isFinite(imdb) && imdb > 0) val = imdb;
    else if (Number.isFinite(tmdb) && tmdb > 0) val = tmdb;
    if (val > 0) {
        const cls = val >= 7 ? 'hi' : (val >= 5 ? 'mid' : 'low');
        parts.push(`<span class="hm-rating hm-rating--${cls}">${icon('star')} ${val.toFixed(1)}</span>`);
    }
    if (it.year) parts.push(`<span class="hm-item">${escapeHtml(String(it.year))}</span>`);
    if (it.type) parts.push(`<span class="hm-item">${escapeHtml(it.type)}</span>`);
    const genres = uniqueGenres(it.genres || []).slice(0, 3).join(', ');
    if (genres) parts.push(`<span class="hm-item">${escapeHtml(genres)}</span>`);
    return parts.join('<span class="hm-sep">·</span>');
}

/* DOM точек строится ОДИН раз на набор слайдов; при переключении
   меняются только классы — transition ширины/маргина проигрывается.
   (Пересборка innerHTML создавала элементы уже «готовыми» полосками —
   анимации не было.) */
function heroBuildDots() {
    const host = $('#heroDots'); if (!host) return;
    host.style.setProperty('--hero-interval', HERO_INTERVAL + 's');
    host.innerHTML = heroSlides.map((_, i) => `
<button type="button" class="hero-dot" aria-label="Слайд ${i + 1}" onclick="heroGo(${i})">
<span class="hero-pill"><span class="hero-fill"></span></span>
</button>`).join('');
}

/* Переключение — только класс is-active. Морфинг точки в полоску
   делает сам flex: сжатие старой полоски сдвигает соседей влево,
   рост новой компенсирует это — правый край растущей полоски
   неподвижен, левый тянется в освободившееся место. Никаких margin */
function heroUpdateDots() {
    const host = $('#heroDots'); if (!host) return;
    $$('.hero-dot', host).forEach((b, i) => {
        b.classList.toggle('is-active', i === heroIdx);
    });
}

/* перезапуск CSS-анимации заливки на живом элементе (без пересоздания) */
function heroRestartFill(btn) {
    const fill = btn.querySelector('.hero-fill'); if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;   // форс-рефлоу: анимация стартует заново
    fill.style.animation = '';
}

/* HERO, картинка: широкая обложка — на весь блок; вертикальный постер —
   размытый фон + чёткий постер целиком справа (класс is-poster, стили в app.css).
   Постер больше не обрезается */
function heroApplyImage(it) {
    const hero = $('#hero');
    const cover = it.cover && img(it.cover);
    const poster = it.poster && img(it.poster);
    if (cover) {
        hero.classList.remove('is-poster');
        $('#heroBg').src = cover;
        $('#heroImg').src = cover;
    } else {
        const src = poster || placeholderSvg(600, 900);
        hero.classList.add('is-poster');
        $('#heroBg').src = src;
        $('#heroImg').src = src;
    }
}

function heroShow(idx, instant) {
    if (!heroSlides.length) return;
    heroIdx = (idx + heroSlides.length) % heroSlides.length;
    const it = heroSlides[heroIdx];
    const apply = () => {
        registerItem(it);
        window._heroKey = itemKey(it);
        heroApplyImage(it);
        $('#heroTitle').textContent = it.title || '';
        $('#heroDesc').textContent = it.description || '';
        const meta = $('#heroMeta'); if (meta) meta.innerHTML = heroMetaHtml(it);
        updateHeroFavBtn();
        heroUpdateDots();
        heroSlideShownAt = performance.now();
        heroScheduleNext();   // в тот же кадр, что и старт заливки
    };
    if (instant) { apply(); return; }
    const hero = $('#hero');
    hero.classList.add('is-switching');
    setTimeout(() => {
        apply();
        hero.classList.remove('is-switching');
    }, 460);
}

function heroGo(i) { heroShow(i); }
function heroStep(d) { heroShow(heroIdx + d); }

/* таймер назначается из apply() heroShow — в тот же кадр, что и анимация
   полоски. Раньше интервал тикал от своего старта, а полоска рождалась
   на 320мс позже (fade) — отставание копилось, и полоска заполнялась
   заметно раньше переключения */
function heroScheduleNext() {
    clearTimeout(heroTimer);
    heroTimer = null;
    if (heroSlides.length < 2 || heroPaused) return;
    heroTimer = setTimeout(() => heroShow(heroIdx + 1), HERO_INTERVAL * 1000);
}

/* пауза при наведении: таймер стоп + заливка замирает (play-state: paused).
   Запоминаем СКОЛЬКО ПРОШЛО — при возобновлении досчитываем остаток,
   а не начинаем круг заново */
function heroPauseAuto() {
    if (heroPaused) return;
    heroPaused = true;
    if (heroTimer) { clearTimeout(heroTimer); heroTimer = null; }
    // сколько уже натикало с момента старта текущего слайда
    $('#heroDots')?.classList.add('is-paused');
}

function heroResumeAuto() {
    if (!heroPaused) return;
    heroPaused = false;
    $('#heroDots')?.classList.remove('is-paused');
    if (heroSlides.length >= 2) {
        const left = heroRemainingMs();
        clearTimeout(heroTimer);
        if (left <= 300) { heroShow(heroIdx + 1); return; }   // почти долилась — переключаем сразу
        heroTimer = setTimeout(() => heroShow(heroIdx + 1), left);
    }
}

/* сколько мс осталось до конца заливки: по getComputedStyle читаем
   текущий прогресс scaleX анимации заливки */
function heroRemainingMs() {
    const fill = $('#heroDots .hero-dot.is-active .hero-fill');
    if (!fill) return HERO_INTERVAL * 1000;
    try {
        const m = new DOMMatrixReadOnly(getComputedStyle(fill).transform);
        const progress = Math.min(1, Math.max(0, m.a));   // scaleX
        return (1 - progress) * HERO_INTERVAL * 1000;
    } catch (e) {
        const elapsed = performance.now() - (heroSlideShownAt || performance.now());
        return Math.max(0, HERO_INTERVAL * 1000 - elapsed);
    }
}

function bindHeroSlider() {
    const hero = $('#hero'); if (!hero) return;
    // каскад фолбэков: обложка → постер → заглушка (битая ссылка больше
    // не «залипает» предыдущей картинкой)
    const heroImg = $('#heroImg');
    if (heroImg) heroImg.onerror = () => {
        const it = heroSlides[heroIdx] || {};
        if (heroImg.dataset.fb !== 'poster') {
            heroImg.dataset.fb = 'poster';
            heroImg.src = (it.poster && img(it.poster)) || placeholderSvg(1280, 720);
        } else {
            heroImg.dataset.fb = 'ph';
            heroImg.src = placeholderSvg(1280, 720);
        }
    };
    $('#heroPrev')?.addEventListener('click', () => heroStep(-1));
    $('#heroNext')?.addEventListener('click', () => heroStep(1));
    // пауза автопрокрутки при наведении (и полоска-прогресс тоже встаёт на паузу — CSS)
    // пауза при наведении на hero, КРОМЕ самих точек: клик по точке уже
    // сам переключает, а пауза на точке сбивала ход заливки
    hero.addEventListener('pointerover', e => {
        if (e.target.closest('.hero-dot')) return;
        heroPauseAuto();
    });
    hero.addEventListener('pointerout', e => {
        if (e.target.closest('.hero-dot')) return;
        heroResumeAuto();
    });
    // драг мышью: потянул влево — следующий, вправо — предыдущий
    let sx = 0, sy = 0, dragging = false;
    hero.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        if (e.target.closest('button, a')) return;
        sx = e.clientX; sy = e.clientY; dragging = true;
    });
    hero.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
            dragging = false;
            heroStep(dx > 0 ? -1 : 1);
        }
    });
    window.addEventListener('pointerup', () => { dragging = false; }, { passive: true });
}

/* Прогрев топ-3: слайды без постера/описания/жанров догружаем с сервера
   (КП + каталог). Заполняются только ПУСТЫЕ поля — хорошие TMDB-данные
   не затираются. Текущий слайд перерисовывается на месте. */
async function heroPrewarm() {
    for (const it of heroSlides) {
        if (it.poster && it.description && (it.genres || []).length) continue;
        try {
            const res = await fetch(`/api/title/by-key?key=${encodeURIComponent(itemKey(it))}`);
            if (!res.ok) continue;
            const full = await res.json();
            if (!full || !full.title) continue;
            for (const f of ['poster', 'cover', 'description', 'original_title', 'rating_kp', 'rating_imdb']) {
                if (!it[f] && full[f]) it[f] = full[f];
            }
            if (!(it.genres || []).length && (full.genres || []).length) it.genres = full.genres;
            registerItem(it);
            if (heroSlides[heroIdx] === it) heroShow(heroIdx, true);
        } catch (e) { /* тихо: слайд останется как есть */ }
    }
}

async function loadHome(force) {
    $('#homeError').classList.add('hidden');
    const validCache = () => {
        try {
            const cached = sessionStorage.getItem('mediaserver_home_cache');
            const at = Number(sessionStorage.getItem('mediaserver_home_cache_at') || 0);
            if (!cached || Date.now() - at > 5 * 60 * 1000) return null;
            const d = JSON.parse(cached);
            return (d && Object.values(d).some(v => Array.isArray(v) && v.length)) ? d : null;
        } catch (e) { return null; }
    };
    try {
        if (!force) {
            const c = validCache();
            if (c) { HOME_DATA = c; renderHome(); return; }
        }
        const res = await fetch('/api/home', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        HOME_DATA = await res.json();
        const nonEmpty = HOME_DATA && Object.values(HOME_DATA).some(v => Array.isArray(v) && v.length);
        if (!nonEmpty) throw new Error('Пустая главная — повтор через секунду');
        try {
            sessionStorage.setItem('mediaserver_home_cache', JSON.stringify(HOME_DATA));
            sessionStorage.setItem('mediaserver_home_cache_at', String(Date.now()));
        } catch (e) { }
        renderHome();
    } catch (e) {
        console.error(e);
        $('#heroSkeleton').classList.add('hidden');
        $('#homeError').classList.remove('hidden');
        setTimeout(() => loadHome(true), 3000);
    }
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function hideCatalogChrome() {
    $('#catalogFilters')?.classList.add('hidden');
    $('#catalogFilters')?.classList.remove('open');
    $('#cfToggleRow')?.classList.add('hidden');
    $('#catalogWrap')?.classList.remove('is-catalog');
    $('#catalogMoreWrap')?.classList.add('hidden');
}
function setActiveNav(key) {
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === key));
    $('#topCatBtn')?.classList.toggle('active', key === 'catalog' || key === 'anime');
    $$('[data-bnav]').forEach(b => b.classList.toggle('is-active', b.dataset.bnav === key));
}
function goHome() {
    history.pushState({}, '', '/');   // чистим ?q= из URL поиска
    currentGridType = null;
    stopSearchUpdates();
    clearSearch();
    hideCatalogChrome();
    hideTitlePageSilently();
    setActiveNav('home');
    closeDrawer();
    window.scrollTo({ top: 0 });
    if (!HOME_DATA) loadHome();
    else renderHome();
}
function openDrawer() {
    const sb = $('#sidebar');
    if (sb.classList.contains('open')) return;   // уже открыт
    sb.classList.add('open');
    $('#drawerOverlay').classList.remove('hidden');
    $('#personsGrid')?.classList.add('hidden');
    $('#btnDrawer').setAttribute('aria-expanded', 'true');
    lockPageScroll();   // страница под меню не скроллится (единый менеджер)
}
function closeDrawer() {
    const sb = $('#sidebar');
    if (!sb.classList.contains('open')) return;  // закрыт — ничего не трогаем
    sb.classList.remove('open');
    $('#drawerOverlay').classList.add('hidden');
    $('#personsGrid')?.classList.add('hidden');
    $('#btnDrawer').setAttribute('aria-expanded', 'false');
    unlockPageScroll();
}

/* ===== Дропдауны шапки (стиль animeon) ===== */
function toggleTopDd(menuId, btn) {
    const m = document.getElementById(menuId); if (!m) return;
    const willOpen = m.classList.contains('hidden');
    closeTopDds();
    if (!willOpen) return;
    m.classList.remove('hidden');
    btn?.setAttribute('aria-expanded', 'true');
    if (menuId === 'acctMenu') calcAcctStats();
}
function closeTopDds() {
    ['topCatMenu', 'acctMenu'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
    ['topCatBtn', 'btnAccount'].forEach(id => document.getElementById(id)?.setAttribute('aria-expanded', 'false'));
}
function calcAcctStats() {
    const ratings = libraryState.ratings || {};
    const progressData = safeParse(localStorage.getItem('mediaserver_progress'), {});
    const localRt = safeParse(localStorage.getItem('mediaserver_runtime'), {});
    let totalMin = 0;
    new Set([...Object.keys(ratings), ...Object.keys(libraryState.watched || {})]).forEach(k => {
        totalMin += Number((progressData[k] || {}).runtime) || Number(localRt[k]) || 0;
    });
    const t = $('#acctStatTime'), r = $('#acctStatRatings'), w = $('#acctStatWatched');
    if (t) t.textContent = totalMin ? fmtMinutes(totalMin) : '—';
    if (r) r.textContent = Object.keys(ratings).length;
    if (w) w.textContent = Object.keys(libraryState.watched || {}).length;
}
function refreshHeaderAvatar() {
    const url = (window._profileData && window._profileData.avatar) || '';
    $$('.aon-avatar').forEach(av => {
        const img = av.querySelector('.js-av-img'), init = av.querySelector('.js-av-init'), guest = av.querySelector('.av-guest');
        if (!img || !init || !guest) return;
        if (accountUser && url) {
            img.onerror = () => { img.classList.add('hidden'); init.classList.remove('hidden'); };
            img.src = url;
            img.classList.remove('hidden'); init.classList.add('hidden'); guest.classList.add('hidden');
        } else if (accountUser) {
            img.classList.add('hidden');
            init.textContent = initials(accountUser.username);
            init.classList.remove('hidden'); guest.classList.add('hidden');
        } else {
            img.classList.add('hidden'); init.classList.add('hidden'); guest.classList.remove('hidden');
        }
    });
}

/* ===== Тултипы: капсула-подсказка при наведении (стиль animeon) =====
   Любому элементу достаточно добавить атрибут data-ttip="Текст" —
   при наведении покажется капсула. Пока используется у «Мой список» в шапке. */
let ttipHost = null, ttipShowT = null, ttipHideT = null;

function ttipHide() {
    clearTimeout(ttipShowT);
    clearTimeout(ttipHideT);
    ttipHost?.classList.remove('is-on');
}

function bindTooltips() {
    // на тач-устройствах ховера нет — тултипы не нужны
    if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (!ttipHost) {
        ttipHost = document.createElement('div');
        ttipHost.id = 'ttip';
        ttipHost.setAttribute('role', 'tooltip');
        document.body.appendChild(ttipHost);
        window.addEventListener('scroll', ttipHide, { passive: true });
        window.addEventListener('resize', ttipHide, { passive: true });
    }
    $$('[data-ttip]').forEach(el => {
        if (el._ttipBound) return;
        el._ttipBound = true;
        el.removeAttribute('title');          // нативный тултип не должен дублироваться
        el.addEventListener('mouseenter', () => {
            clearTimeout(ttipHideT);
            clearTimeout(ttipShowT);
            ttipShowT = setTimeout(() => {    // задержка появления, как у animeon
                ttipHost.textContent = el.dataset.ttip || '';
                ttipHost.classList.add('is-on');
                const r = el.getBoundingClientRect();
                const w = ttipHost.offsetWidth, h = ttipHost.offsetHeight;
                let left = Math.round(r.left + r.width / 2 - w / 2);
                left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
                let top = Math.round(r.bottom + 8);
                if (top + h > window.innerHeight - 8) top = Math.round(r.top - h - 8);  // снизу нет места — сверху
                ttipHost.style.left = left + 'px';
                ttipHost.style.top = Math.max(8, top) + 'px';
            }, 300);
        });
        el.addEventListener('mouseleave', () => {
            clearTimeout(ttipShowT);
            ttipHideT = setTimeout(ttipHide, 60);
        });
        el.addEventListener('pointerdown', ttipHide);   // клик — сразу спрятать
    });
}

/* Клик по кнопке «Каталог» в шапке — сразу открываем каталог,
   ховер по-прежнему раскрывает меню с «Аниме» и «Случайное».
   На тач-устройствах (ховера нет) клик открывает меню, как раньше. */
function topCatClick() {
    const canHover = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) { toggleTopDd('topCatMenu', document.getElementById('topCatBtn')); return; }
    closeTopDds();
    openCatalog();
}

const LIBRARY_META = {
    favorites: { title: 'Избранное', empty: 'Вы пока ничего не добавили в избранное.' },
    watching: { title: 'Смотрю', empty: 'Список того, что вы сейчас смотрите, пуст.' },
    planned: { title: 'Буду смотреть', empty: 'Отметьте тайтлы, которые хотите посмотреть позже.' },
    watched: { title: 'Просмотрено', empty: 'Здесь появятся тайтлы, которые вы отметите как просмотренные.' },
    history: { title: 'История просмотров', empty: 'Вы ещё ничего не открывали.' },
    onhold: { title: 'Отложено', empty: 'Здесь появятся тайтлы, просмотр которых вы отложили.' },
    dropped: { title: 'Брошено', empty: 'Здесь появятся тайтлы, которые вы бросили смотреть.' },
};
const GRID_HEAD_ICONS = {
    catalog: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',
    favorites: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    watching: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
    planned: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    watched: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    onhold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>',
    dropped: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    history: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
};
function setGridHeadIcon(type) {
    const el = $('#gridHeadIc');
    if (el) el.innerHTML = GRID_HEAD_ICONS[type] || GRID_HEAD_ICONS.catalog;
}
function libraryItems(type) {
    if (type === 'history') return recentlyViewed || [];
    return Object.values(libraryState[type] || {}).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).map(x => x.item).filter(Boolean);
}
function updateSidebarCounts() {
    const counts = {
        favorites: Object.keys(libraryState.favorites || {}).length,
        watching: Object.keys(libraryState.watching || {}).length,
        planned: Object.keys(libraryState.planned || {}).length,
        watched: Object.keys(libraryState.watched || {}).length,
        onhold: Object.keys(libraryState.onhold || {}).length,
        dropped: Object.keys(libraryState.dropped || {}).length,
    };
    for (const [k, v] of Object.entries(counts)) {
        $$('.cnt-' + k).forEach(el => el.textContent = v || '');
    }
}
function openLibrary(type, fromRouter) {
    stopSearchUpdates();
    currentGridType = type;
    leaveTitleIfNeeded(type);
    pushRoute(libraryRoute(type));
    closeDrawer();
    clearSearch();
    hideCatalogChrome();
    const meta = LIBRARY_META[type];
    $('#homeView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#gridView').classList.remove('hidden');
    $('#personsGrid')?.classList.add('hidden');
    $('#gridLoading').classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    setActiveNav(type);
    $('#gridTitle').textContent = meta.title;
    setGridHeadIcon(type);
    const crumb = $('#gridCrumb');
    if (crumb) crumb.innerHTML = '<a href="/" onclick="goHome();return false;">Главная</a><span class="sep">/</span><b>' + escapeHtml(meta.title) + '</b>';
    const items = libraryItems(type);
    $('#gridSubtitle').textContent = items.length ? `${items.length} ${pluralTitles(items.length)}` : '';
    renderGrid(items, { removable: type === 'history', emptyText: meta.empty });
    if (!fromRouter) window.scrollTo(0, 0);
}

/* ============================================================
   ПАГИНАЦИЯ (стиль animeon) — общий блок вместо «Загрузить ещё»
   ============================================================ */
function pgPages(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (cur >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', cur - 1, cur, cur + 1, '…', total];
}

function pgChev(dir) {
    return dir < 0
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
}

function paginationHtml(page, totalPages, goFn) {
    const prev = page > 1
        ? `<button type="button" class="pg-btn" aria-label="Предыдущая страница" onclick="${goFn}(${page - 1})">${pgChev(-1)}</button>`
        : `<span class="pg-btn pg-btn--off" aria-hidden="true">${pgChev(-1)}</span>`;
    const next = page < totalPages
        ? `<button type="button" class="pg-btn" aria-label="Следующая страница" onclick="${goFn}(${page + 1})">${pgChev(1)}</button>`
        : `<span class="pg-btn pg-btn--off" aria-hidden="true">${pgChev(1)}</span>`;
    const nums = pgPages(page, totalPages).map(n => {
        if (n === '…') return '<span class="pg-gap" aria-hidden="true">…</span>';
        if (n === page) return `<span class="pg-btn pg-btn--cur" aria-current="page">${n}</span>`;
        return `<button type="button" class="pg-btn" aria-label="Страница ${n}" onclick="${goFn}(${n})">${n}</button>`;
    }).join('');
    return `<nav class="pg-nav" aria-label="Пагинация">${prev}${nums}${next}</nav>`;
}

function renderPagination(host, st) {
    if (!host) return;
    st = st || {};
    const total = Math.max(0, Number(st.total) || 0);
    const per = Math.max(1, Number(st.per) || 1);
    let page = Math.max(1, Number(st.page) || 1);
    const totalPages = Math.max(1, Math.ceil(total / per));
    if (page > totalPages) page = totalPages;
    if (totalPages <= 1) {          // одна страница — блок не нужен (как раньше не было кнопки)
        host.classList.add('hidden');
        host.innerHTML = '';
        return;
    }
    host.classList.remove('hidden');
    const from = (page - 1) * per + 1;
    const to = Math.min(page * per, total);
    host.innerHTML = `
<div class="pg">
    <p class="pg-info">Показано <b>${from}–${to}</b> из <b>${total.toLocaleString('ru-RU')}${st.capped ? '+' : ''}</b></p>
    ${paginationHtml(page, totalPages, st.go)}
</div>`;
}

/* ============================================================
МОЙ СПИСОК: табы + карточки + drag&drop
============================================================ */
const TAB_ICONS = {
    watching: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>',
    planned: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>',
    watched: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    onhold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>',
    dropped: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    favorites: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
};
const LIST_TABS = [
    { key: 'watching', label: 'Смотрю' },
    { key: 'planned', label: 'Запланировано' },
    { key: 'watched', label: 'Просмотрено' },
    { key: 'onhold', label: 'Отложено' },
    { key: 'dropped', label: 'Брошено' },
    { key: 'favorites', label: 'Избранное' },
];
const LIST_META = {
    watching: 'Здесь появятся тайтлы, которые вы смотрите.',
    planned: 'Отметь тайтлы, которые хотите посмотреть позже.',
    watched: 'Здесь появятся просмотренные тайтлы.',
    onhold: 'Здесь появятся отложенные тайтлы.',
    dropped: 'Здесь появятся брошенные тайтлы.',
    favorites: 'Вы пока ничего не добавили в избранное.',
};
let listTab = localStorage.getItem('mediaserver_list_tab') || 'watching';

function openList(fromRouter) {
    stopSearchUpdates();
    pushRoute('/list');
    closeDrawer();
    hideTitlePageSilently();
    clearSearch();
    hideCatalogChrome();
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#titleView').classList.add('hidden');
    $('#listView').classList.remove('hidden');
    setActiveNav('list');
    renderList();
    if (!fromRouter) window.scrollTo(0, 0);
}

function setListTab(tab) {
    listTab = tab;
    localStorage.setItem('mediaserver_list_tab', tab);
    listPage = 1;
    renderList();
}

/* Случайный тайтл из библиотеки: приоритет — «буду смотреть» и «смотрю»
   (то, что ещё не просмотрено); если таких нет — из всех категорий */
function randomFromList() {
    const seen = new Set();
    const pool = [];
    ['planned', 'watching', 'favorites', 'watched', 'onhold', 'dropped'].forEach(cat => {
        libraryItems(cat).forEach(it => {
            const k = itemKey(it);
            if (it && it.title && !seen.has(k)) { seen.add(k); pool.push(it); }
        });
    });
    const fresh = pool.filter(it => !isInLibrary('watched', it));
    const final = fresh.length ? fresh : pool;
    if (!final.length) { toast('Список пуст — добавь тайтлы, чтобы было из чего выбирать'); return; }
    const it = final[Math.floor(Math.random() * final.length)];
    const key = registerItem(it);
    toast('🎲 Смотрим: ' + it.title);
    navigateToTitle(key);
}

const LS_PAGE_SIZE = 24;
let listPage = 1;
let listQuery = '';

function renderList() {
    const tabsHost = $('#listTabs'), grid = $('#listGrid');
    if (!tabsHost || !grid) return;
    const counts = {
        watching: Object.keys(libraryState.watching || {}).length,
        planned: Object.keys(libraryState.planned || {}).length,
        watched: Object.keys(libraryState.watched || {}).length,
        onhold: Object.keys(libraryState.onhold || {}).length,
        dropped: Object.keys(libraryState.dropped || {}).length,
        favorites: Object.keys(libraryState.favorites || {}).length,
    };
    if (!LIST_TABS.some(t => t.key === listTab)) listTab = 'watching';
    tabsHost.innerHTML = LIST_TABS.map(t => `
        <button type="button" class="list-tab t-${t.key} ${listTab === t.key ? 'is-active' : ''}" data-tab="${t.key}" onclick="setListTab('${t.key}')">
            <span class="t-ic">${TAB_ICONS[t.key]}</span>${t.label}<span class="cnt">${counts[t.key] || ''}</span>
        </button>`).join('');
    // поиск: подхватываем значение из input (оно живёт между перерисовками)
    const searchEl = $('#lsSearch');
    listQuery = searchEl ? searchEl.value.trim().toLowerCase() : '';
    let items;
    if (listQuery) {
        // глобальный поиск по всем отмеченным тайтлам сразу
        const seen = new Set();
        const all = ['watching', 'planned', 'watched', 'onhold', 'dropped', 'favorites']
            .flatMap(cat => libraryItems(cat).map(it => ({ it, cat, at: (libraryState[cat] || {})[itemKey(it)]?.updatedAt || 0 })));
        items = all
            .filter(({ it }) => {
                const k = itemKey(it);
                if (seen.has(k)) return false;
                seen.add(k);
                const hay = [it.title, it.original_title, ...(it.alternative_titles || [])].join(' ').toLowerCase();
                return hay.includes(listQuery);
            })
            .sort((a, b) => b.at - a.at)
            .map(({ it }) => it);
    } else {
        items = libraryItems(listTab);
    }
    // пагинация: держим страницу в допустимых пределах
    const listPages = Math.max(1, Math.ceil(items.length / LS_PAGE_SIZE));
    if (listPage > listPages) listPage = listPages;
    if (!items.length) {
        grid.innerHTML = '';
        $('#listEmptyText').textContent = listQuery ? `По запросу «${listQuery}» ничего не найдено.` : LIST_META[listTab];
        $('#listEmpty').classList.remove('hidden');
    } else {
        $('#listEmpty').classList.add('hidden');
        grid.innerHTML = items.slice((listPage - 1) * LS_PAGE_SIZE, listPage * LS_PAGE_SIZE).map(renderListCard).join('');
    }
    // блок переключения страниц (вместо «Загрузить ещё»)
    renderPagination($('#listMoreWrap'), {
        page: listPage,
        total: items.length,
        per: LS_PAGE_SIZE,
        go: 'gotoListPage',
    });
    bindListDnd();
    renderListHistory();
}

function gotoListPage(n) {
    listPage = Math.max(1, Number(n) || 1);
    renderList();
    const anchor = $('#listTabs') || $('#listGrid');
    if (anchor) window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 84), behavior: 'smooth' });
}

function clearLsSearch() {
    const el = $('#lsSearch');
    if (el) el.value = '';
    listQuery = '';
    $('#lsSearchClear')?.classList.add('hidden');
    listPage = 1;
    renderList();
}

function renderListCard(it) {
    const key = registerItem(it);
    const safeKey = escapeAttr(key);
    const rating = getUserRating(it);
    const cur = ['watching', 'planned', 'watched', 'onhold', 'dropped'].find(t => isInLibrary(t, it));
    const STAR = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
    const stars = Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        const fillW = (rating >= n) ? '100%' : (rating >= n - 0.5 && rating < n) ? '50%' : '0%';
        return `
        <span class="ls-star">
            <svg class="ls-star-bg" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5" stroke-linejoin="round"/></svg>
            <span class="ls-star-fill" style="width:${fillW}"><svg class="ls-star-on" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}" fill="#fbbf24" stroke="#fbbf24" stroke-width="1.5" stroke-linejoin="round"/></svg></span>
            <button type="button" class="ls-half ls-half--l" aria-label="Оценка ${n - 0.5} из 5" onclick="setLsRating('${safeKey}', ${n - 0.5})" onmouseenter="hoverLsRating(this, ${n - 0.5})"></button>
            <button type="button" class="ls-half ls-half--r" aria-label="Оценка ${n} из 5" onclick="setLsRating('${safeKey}', ${n})" onmouseenter="hoverLsRating(this, ${n})"></button>
        </span>`;
    }).join('');
    return `
    <div class="list-card" draggable="true" data-key="${safeKey}">
        <a href="${escapeAttr(titleHref(it))}" draggable="false" onclick="return handleCardActivate(event, '${safeKey}')" class="block">
            <div class="list-poster">
                <img src="${img(it.poster) || placeholderSvg(300, 450)}" alt="" draggable="false" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
            </div>
            <div class="p-2.5 pb-2">
                <p class="text-[13px] font-semibold leading-snug line-clamp-2 text-ink">${escapeHtml(it.title)}</p>
                <p class="text-[11px] text-muted mt-0.5">${escapeHtml(it.year || '')}${it.type ? ' · ' + escapeHtml(it.type) : ''}</p>
            </div>
        </a>
        <div class="px-2.5 pb-2.5 space-y-2">
            <div class="flex items-center justify-between gap-1.5">
                <span class="ls-stars" data-key="${safeKey}" onmouseleave="leaveLsRating(this)" role="group" aria-label="Ваша оценка">${stars}</span>
                ${rating ? `<button type="button" class="ls-rate-clear" onclick="clearLsRating('${safeKey}')" title="Убрать оценку" aria-label="Убрать оценку"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>` : ''}
            </div>
            <button type="button" class="ls-status-btn ${cur ? 'ls-status-btn--' + cur : 'ls-status-btn--none'}" onclick="toggleLsStatusMenu(this, '${safeKey}')">
                <span class="ws-status-ic ${cur ? WS_META[cur].cls : 'ws-ic-slate'}">${cur ? WS_ICONS[cur] : WS_ICONS.none}</span>
                <span class="flex-1 min-w-0 text-left truncate">${cur ? WS_META[cur].label : 'Выбрать статус'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;opacity:.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
        </div>
    </div>`;
}

/* ===== Мой список: оценка звёздами ===== */
function lsFills(starsEl, n) {
    if (!starsEl) return;
    starsEl.querySelectorAll('.ls-star').forEach((star, idx) => {
        const i = idx + 1;
        star.querySelector('.ls-star-fill').style.width =
            (n >= i) ? '100%' : (n >= i - 0.5 && n < i) ? '50%' : '0%';
    });
}
function hoverLsRating(half, n) { lsFills(half.closest('.ls-stars'), n); }
function leaveLsRating(starsEl) {
    const it = getRegistered(starsEl.dataset.key);
    lsFills(starsEl, it ? getUserRating(it) : 0);
}
function rateItemByKey(key, val) {
    const it = getRegistered(key);
    if (!it) return;
    const k = itemKey(it), now = Date.now();
    if (!libraryState.ratings) libraryState.ratings = {};
    if (val) libraryState.ratings[k] = { item: JSON.parse(JSON.stringify(it)), rating: val, updatedAt: now };
    else delete libraryState.ratings[k];
    saveLibrary();
    sendAccountAction('set_rating', { key: k, item: it, value: val || null });
}
function setLsRating(key, n) {
    const it = getRegistered(key);
    if (!it) return;
    const cur = getUserRating(it);
    rateItemByKey(key, cur === n ? 0 : n);   // повторный клик по той же половинке — снять оценку
    let starsEl = null;
    $$('.ls-stars').forEach(el => { if (el.dataset.key === key) starsEl = el; });
    lsFills(starsEl, getUserRating(it));
    if (cur !== n) toast('Оценка: ' + n + ' / 5');
}

function clearLsRating(key) {
    rateItemByKey(key, 0);
    renderList();
    toast('Оценка убрана');
}

/* ===== История просмотров (с прогрессом, стиль animeon) ===== */
const LS_HIST_PAGE = 12;
let lsHistPage = 1;

function historyWithProgress() {
    const prog = safeParse(localStorage.getItem('mediaserver_progress'), {});
    return (recentlyViewed || [])
        .filter(x => x && x.title)
        .map(x => {
            const p = Object.entries(prog || {}).find(([k]) => itemKeys(x).includes(k));
            return { item: x, prog: p ? p[1] : null };
        })
        .filter(e => e.prog && Number(e.prog.time) > 30)
        .sort((a, b) => (b.prog.updatedAt || 0) - (a.prog.updatedAt || 0));
}

function renderListHistory() {
    const sec = $('#lsHistorySection'), grid = $('#lsHistoryGrid');
    if (!sec || !grid) return;
    const rows = historyWithProgress();
    if (!rows.length) {
        sec.classList.remove('hidden');
        grid.innerHTML = '';
        $('#lsHistoryEmpty').classList.remove('hidden');
        $('#lsHistoryMoreWrap')?.classList.add('hidden');
        $('#lsHistoryCount').textContent = '';
        return;
    }
    $('#lsHistoryEmpty').classList.add('hidden');
    $('#lsHistoryCount').textContent = `${rows.length} записей`;
    const histPages = Math.max(1, Math.ceil(rows.length / LS_HIST_PAGE));
    if (lsHistPage > histPages) lsHistPage = histPages;
    grid.innerHTML = rows.slice((lsHistPage - 1) * LS_HIST_PAGE, lsHistPage * LS_HIST_PAGE).map(e => {
        const it = e.item, p = e.prog;
        const key = registerItem(it);
        const safeKey = escapeAttr(key);
        const ts = Number(p.updatedAt) || Number(it.historyUpdatedAt) || 0;
        const date = ts ? new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
        const ep = Number(p.episode) > 1 ? ` · серия ${p.episode}` : '';
        const cur = ['watching', 'planned', 'watched', 'onhold', 'dropped'].find(t => isInLibrary(t, it));
        return `
    <div class="list-card" data-key="${safeKey}">
        <a href="${escapeAttr(titleHref(it))}" draggable="false" onclick="return handleCardActivate(event, '${safeKey}')" class="block">
            <div class="list-poster">
                <img src="${img(it.poster) || placeholderSvg(300, 450)}" alt="" draggable="false" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
            </div>
            <div class="p-2.5 pb-2">
                <p class="text-[13px] font-semibold leading-snug line-clamp-2 text-ink">${escapeHtml(it.title)}</p>
                <p class="text-[11px] text-muted mt-0.5">${escapeHtml(it.year || '')}${it.type ? ' · ' + escapeHtml(it.type) : ''}</p>
            </div>
        </a>
        <div class="px-2.5 pb-2.5 space-y-2">
            <span class="ls-hist-date flex items-center gap-1.5 text-[11px] text-faint min-w-0" title="${escapeAttr(date + ep)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex:none"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span class="truncate">${escapeHtml(date)}${ep}</span>
            </span>
            <button type="button" class="ls-status-btn ${cur ? 'ls-status-btn--' + cur : 'ls-status-btn--none'}" onclick="toggleLsStatusMenu(this, '${safeKey}')">
                <span class="ws-status-ic ${cur ? WS_META[cur].cls : 'ws-ic-slate'}">${cur ? WS_ICONS[cur] : WS_ICONS.none}</span>
                <span class="flex-1 min-w-0 text-left truncate">${cur ? WS_META[cur].label : 'Выбрать статус'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;opacity:.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
        </div>
        <button type="button" class="hist-del" title="Убрать из истории" aria-label="Убрать из истории"
            onclick="removeHistory('${safeKey}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>`;
    }).join('');
    // блок переключения страниц (вместо «Загрузить ещё»)
    renderPagination($('#lsHistoryMoreWrap'), {
        page: lsHistPage,
        total: rows.length,
        per: LS_HIST_PAGE,
        go: 'gotoHistPage',
    });
    sec.classList.remove('hidden');
}

function gotoHistPage(n) {
    lsHistPage = Math.max(1, Number(n) || 1);
    renderListHistory();
    const anchor = $('#lsHistorySection');
    if (anchor) window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 84), behavior: 'smooth' });
}

function clearAllHistory() {
    if (!confirm('Очистить всю историю просмотров?')) return;
    recentlyViewed = [];
    saveRecent();
    sendAccountAction('history_remove', { key: '*', item: {} });
    lsHistPage = 1;
    renderList();
    updateSidebarCounts();
    toast('История очищена');
}

/* ===== Мой список: дропдаун статуса ===== */
function toggleLsStatusMenu(btn, key) {
    const m = $('#lsStatusMenu');
    if (!m.classList.contains('hidden') && m.dataset.key === key) { m.classList.add('hidden'); m.dataset.key = ''; return; }
    const it = getRegistered(key);
    if (!it) return;
    const cur = ['watching', 'planned', 'watched', 'onhold', 'dropped'].find(t => isInLibrary(t, it));
    m.innerHTML = ['watching', 'planned', 'watched', 'onhold', 'dropped'].map(st => `
        <button type="button" class="aon-item ${cur === st ? 'active' : ''}" onclick="applyLsStatus('${escapeAttr(key)}', '${st}')">
            <span class="ws-status-ic ${WS_META[st].cls}">${WS_ICONS[st]}</span>
            <span class="flex-1">${WS_META[st].label}</span>
        </button>`).join('')
        + `<div class="aon-sep"></div>
        <button type="button" class="aon-item" onclick="applyLsStatus('${escapeAttr(key)}', 'none')">
            <span class="ws-status-ic ws-ic-slate">${WS_ICONS.none}</span>
            <span class="flex-1">Не распределено</span>
        </button>
        <button type="button" class="aon-item danger" onclick="applyLsStatus('${escapeAttr(key)}', 'delete')">
            <span class="aon-icobox" style="background:rgba(244,63,94,.1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg></span>
            <span class="flex-1">Убрать из списка</span>
        </button>`;
    m.classList.remove('hidden');
    const r = btn.getBoundingClientRect();
    const mw = m.offsetWidth, mh = m.offsetHeight;
    let left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    let top = r.top - mh - 6;
    if (top < 8) top = Math.min(r.bottom + 6, window.innerHeight - mh - 8);
    m.style.left = Math.round(left) + 'px';
    m.style.top = Math.round(top) + 'px';
    m.dataset.key = key;
}
function applyLsStatus(key, st) {
    $('#lsStatusMenu')?.classList.add('hidden');
    const it = getRegistered(key);
    if (!it) return;
    if (st === 'delete') { removeFromList(key); return; }
    if (st === 'none') {
        ['watching', 'planned', 'watched', 'onhold', 'dropped'].forEach(t => {
            if (isInLibrary(t, it)) setLibraryStatus(t, it);
        });
        toast('Статус снят');
    } else {
        setLibraryStatus(st, it);
    }
    renderList();
}
function removeFromList(key) {
    $('#lsStatusMenu')?.classList.add('hidden');
    const it = getRegistered(key);
    if (!it) return;
    setLibraryStatus(listTab === 'favorites' ? 'favorites' : listTab, it);
    renderList();
    toast('Убрано из списка');
}

/* ===== Мой список: drag&drop с нижней панелью (стиль animeon) ===== */
let lsDragKey = null;

function bindListDnd() {
    $$('#listGrid .list-card').forEach(card => {
        card.addEventListener('dragstart', e => {
            lsDragKey = card.dataset.key;
            e.dataTransfer.setData('text/plain', lsDragKey);
            e.dataTransfer.effectAllowed = 'move';
            card.classList.add('dragging');
            // прячем стандартный «призрак» — рисуем свой клон
            try {
                if (!window._lsTransparent) {
                    window._lsTransparent = new Image();
                    window._lsTransparent.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }
                e.dataTransfer.setDragImage(window._lsTransparent, 0, 0);
            } catch (err) { }
            buildLsGhost(card);
            showLsDropBar(true);
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            showLsDropBar(false);
            destroyLsGhost();
            lsClearHotZone();
            lsDragKey = null;
        });
    });
}

function lsBadgeCls(st) {
    return {
        watching: 'g-badge--green', planned: 'g-badge--blue', watched: 'g-badge--violet',
        dropped: 'g-badge--red', onhold: 'g-badge--amber'
    }[st] || 'g-badge--slate';
}

function buildLsGhost(card) {
    const g = $('#lsDragGhost');
    if (!g) return;
    const it = getRegistered(card.dataset.key);
    const cur = it ? ['watching', 'planned', 'watched', 'onhold', 'dropped'].find(t => isInLibrary(t, it)) : null;
    const poster = card.querySelector('.list-poster img');
    g.innerHTML = `
        <img src="${poster ? poster.src : placeholderSvg(144, 216)}" alt="">
        <div class="g-body">
            <p class="g-title">${it ? escapeHtml(it.title) : ''}</p>
            <span class="g-badge ${cur ? lsBadgeCls(cur) : 'g-badge--slate'}" id="lsGhostBadge">${cur ? WS_META[cur].label : 'Без статуса'}</span>
        </div>`;
    g.classList.remove('hidden');
}
function destroyLsGhost() {
    const g = $('#lsDragGhost');
    if (g) { g.classList.add('hidden'); g.innerHTML = ''; g.style.transform = ''; }
}
function setLsGhostBadge(text, cls) {
    const b = $('#lsGhostBadge');
    if (b) { b.textContent = text; b.className = 'g-badge ' + (cls || ''); }
}
function lsGhostBadgeFor(zone) {
    const map = {
        watching: ['Смотрю', 'g-badge--green'],
        planned: ['Запланировано', 'g-badge--blue'],
        watched: ['Просмотрено', 'g-badge--violet'],
        dropped: ['Брошено', 'g-badge--red'],
        onhold: ['Отложено', 'g-badge--amber'],
        unsorted: ['Не распределено', 'g-badge--slate'],
        delete: ['Удалить', 'g-badge--red'],
    };
    return map[zone] || ['', ''];
}
function showLsDropBar(show) {
    $('#lsDropBar')?.classList.toggle('hidden', !show);
    if (!show) lsClearHotZone();
}
/* ===== Захват дропа: ближайшая зона по позиции курсора (стиль animeon) =====
   Не нужно точно наводить на квадрат — держи карточку в нижней части экрана,
   ближайшая зона по горизонтали подсветится сама. */
let lsHotZone = null;

function lsClearHotZone() {
    if (lsHotZone) { lsHotZone.classList.remove('is-hot'); lsHotZone = null; }
}

function lsSetHotZone(zone) {
    if (lsHotZone === zone) return;
    lsClearHotZone();
    lsHotZone = zone;
    zone.classList.add('is-hot');
    const [txt, cls] = lsGhostBadgeFor(zone.dataset.zone);
    setLsGhostBadge(txt, cls);
}

function lsFindNearestZone(clientX) {
    let best = null, bestDist = Infinity;
    $$('#lsDropRow .ls-zone').forEach(z => {
        const r = z.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const dist = Math.abs(clientX - cx);
        if (dist < bestDist) { bestDist = dist; best = z; }
    });
    return best ? { zone: best, dist: bestDist } : null;
}

function bindLsDropBar() {
    // Глобальный dragover: пока идёт перенос, вычисляем ближайшую зону
    document.addEventListener('dragover', e => {
        if (!lsDragKey) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const bar = $('#lsDropBar');
        if (!bar || bar.classList.contains('hidden')) return;
        const barRect = bar.getBoundingClientRect();

        // Захват: нижние 35% экрана ИЛИ панель + запас 120px сверху
        const inCapture = e.clientY > window.innerHeight * 0.45 ||
            (e.clientY >= barRect.top - 120 && e.clientY <= barRect.bottom + 20);

        if (!inCapture) {
            lsClearHotZone();
            return;
        }

        // Подсветить ближайшую по X (в пределах 30% ширины экрана от центра зоны)
        const near = lsFindNearestZone(e.clientX);
        if (near && near.dist < window.innerWidth * 0.3) {
            lsSetHotZone(near.zone);
        } else {
            lsClearHotZone();
            const it = lsDragKey && getRegistered(lsDragKey);
            const cur = it ? ['watching', 'planned', 'watched', 'onhold', 'dropped'].find(t => isInLibrary(t, it)) : null;
            setLsGhostBadge(cur ? WS_META[cur].label : 'Без статуса', cur ? lsBadgeCls(cur) : 'g-badge--slate');
        }
    }, false);

    // Глобальный drop: применяем подсвеченную зону
    document.addEventListener('drop', e => {
        if (!lsDragKey) return;
        e.preventDefault();
        const zone = lsHotZone;
        if (zone) {
            const key = e.dataTransfer.getData('text/plain') || lsDragKey;
            applyLsZone(key, zone.dataset.zone);
        }
        lsClearHotZone();
    }, false);

    // Прямой клик по зоне — на всякий случай (тач-фолбэк)
    $$('#lsDropRow .ls-zone').forEach(z => {
        z.addEventListener('dragover', e => e.preventDefault());
        z.addEventListener('drop', e => {
            e.preventDefault();
            const key = e.dataTransfer.getData('text/plain') || lsDragKey;
            applyLsZone(key, z.dataset.zone);
            lsClearHotZone();
        });
    });
}
function applyLsZone(key, zone) {
    const it = getRegistered(key);
    if (!it) return;
    if (zone === 'delete') { removeFromList(key); return; }
    if (zone === 'unsorted') {
        ['watching', 'planned', 'watched', 'onhold', 'dropped'].forEach(t => {
            if (isInLibrary(t, it)) setLibraryStatus(t, it);
        });
        toast('Статус снят');
    } else {
        setLibraryStatus(zone, it);
        toast('Перенесено: ' + WS_META[zone].label.toLowerCase());
    }
    renderList();
}

function pluralTitles(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'тайтл';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'тайтла';
    return 'тайтлов';
}
/* ============================================================
ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
============================================================ */
window.profileFilter = 0;

/* ============================================================
   НАСТРОЙКИ (стиль animeon)
   ============================================================ */
let settingsTab = 'profile';

const ST_ICONS = {
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-cap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    id: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg>',
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    userRound: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
    img: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>',
    key: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    link2: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
    devices: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96 3.15"/><path d="M7 19h5"/><rect width="6" height="10" x="16" y="12" rx="2"/></svg>',
    trash: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    upload: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>',
    crop: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
};

function openSettings(fromRouter) {
    if (!accountUser) {
        // при перезагрузке /settings аккаунт ещё догружается (initAccount
        // асинхронный) — ждём, а не ругаемся и не открываем модалку
        window._stWaits = (window._stWaits || 0) + 1;
        if (window._stWaits <= 5) {
            setTimeout(() => {
                if (location.pathname.replace(/\/+$/, '') === '/settings') openSettings(fromRouter);
            }, 250);
            return;
        }
        window._stWaits = 0;
        toast('Войди в аккаунт, чтобы открыть настройки');
        openAccountModal();
        return;
    }
    window._stWaits = 0;
    stopSearchUpdates();
    pushRoute('/settings');
    closeDrawer();
    hideTitlePageSilently();
    clearSearch();
    hideCatalogChrome();
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#titleView').classList.add('hidden');
    $('#settingsView').classList.remove('hidden');
    setActiveNav('settings');
    const qTab = new URLSearchParams(location.search).get('tab');
    if (qTab === 'account') settingsTab = 'account';
    else if (qTab === 'appearance') settingsTab = 'appearance';
    else if (qTab === 'profile') settingsTab = 'profile';
    renderSettings();
    if (!fromRouter) window.scrollTo(0, 0);
}

function setSettingsTab(tab) {
    settingsTab = tab;
    history.replaceState({}, '', '/settings?tab=' + tab);
    renderSettings();
}

function renderSettings() {
    const host = $('#settingsContent');
    if (!host || !accountUser) return;
    const p = window._profileData || {};
    const methodsCount = 1 + (accountUser.has_google ? 1 : 0);
    const navBtn = (tab, label, icon, hint) => `
        <button type="button" title="${hint}" class="${settingsTab === tab ? 'is-active' : ''}" onclick="setSettingsTab('${tab}')">
            <span class="st-nav-ic">${icon}</span>
            <span class="flex-1 min-w-0 truncate text-left">${label}</span>
            ${settingsTab === tab ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="st-nav-chev"><path d="m9 18 6-6-6-6"/></svg>' : ''}
        </button>`;
    host.innerHTML = `
<div class="st-head">
<nav class="st-crumb" aria-label="Хлебные крошки"><a href="/" onclick="goHome();return false;">Главная</a><span class="sep">/</span><b>Настройки</b></nav>
    <h1 class="st-title">Настройки</h1>
    <p class="st-sub">Управляйте своим профилем, внешним видом и аккаунтом</p>
</div>
<div class="st-mobnav" aria-label="Разделы настроек">
    <button type="button" class="st-pill ${settingsTab === 'profile' ? 'is-on' : ''}" onclick="setSettingsTab('profile')">${ST_ICONS.user}<span>Профиль</span></button>
    <button type="button" class="st-pill ${settingsTab === 'appearance' ? 'is-on' : ''}" onclick="setSettingsTab('appearance')">${ST_ICONS.eye}<span>Оформление</span></button>
    <button type="button" class="st-pill ${settingsTab === 'account' ? 'is-on' : ''}" onclick="setSettingsTab('account')">${ST_ICONS.shield}<span>Аккаунт</span></button>
</div>
<div class="st-layout">
    <aside class="st-side">
        <div class="st-usercard">
            <span class="st-uc-ava">${p.avatar ? `<img src="${p.avatar}" alt="">` : escapeHtml(initials(accountUser.username))}</span>
            <div class="min-w-0 flex-1">
                <p class="st-uc-name">${escapeHtml(accountUser.username)}</p>
                <p class="st-uc-mail">${escapeHtml(accountUser.email || 'почта не указана')}</p>
            </div>
        </div>
        <nav class="st-nav" aria-label="Разделы настроек">
        ${navBtn('profile', 'Профиль', ST_ICONS.user, 'Имя, описание, аватар и оформление')}
        ${navBtn('appearance', 'Оформление', ST_ICONS.eye, 'Свечение фона и внешний вид')}
        ${navBtn('account', 'Аккаунт', ST_ICONS.shield, 'Почта, пароль и способы входа')}
        </nav>
    </aside>
    <main class="st-main">
    ${settingsTab === 'profile' ? stProfileTab() : settingsTab === 'appearance' ? stAppearanceTab() : stAccountTab()}
    </main>
</div>`;
}

function stProfileTab() {
    const p = window._profileData || {};
    const bio = p.bio || '';
    return `
<section class="st-card">
    <div class="st-card-head">
        <h3>${ST_ICONS.eye}<span class="min-w-0">Предпросмотр профиля</span></h3>
        <p>Так вас видят другие пользователи</p>
    </div>
    <div class="st-preview">
        <div class="st-pr-banner" style="${p.banner ? `background-image:url('${p.banner}')` : ''}"></div>
        <div class="st-pr-body">
            <span class="st-pr-ava">${p.avatar ? `<img src="${p.avatar}" alt="">` : escapeHtml(initials(accountUser.username))}</span>
            <div class="min-w-0">
                <p class="st-pr-name">${escapeHtml(accountUser.username)}</p>
                ${accountUser.email ? `<p class="st-pr-bio">${escapeHtml(accountUser.email)}</p>` : ''}
            </div>
        </div>
    </div>
</section>
<section class="st-card">
    <div class="st-card-head">
        <h3>${ST_ICONS.id}<span class="min-w-0">Публичный профиль</span></h3>
        <p>Эта информация видна другим пользователям</p>
    </div>
    <div class="st-field">
        <label class="st-label" for="stUsername">Имя пользователя</label>
        <div class="st-input-wrap">
            <svg class="st-input-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input id="stUsername" class="st-input" maxlength="32" autocomplete="username" placeholder="username" value="${escapeAttr(accountUser.username)}">
        </div>
        <p class="st-hint">3–32 символа. Буквы (латиница, кириллица), цифры, «_» и «-»</p>
    </div>
    <div class="st-field">
        <label class="st-label" for="stBio">О себе</label>
        <textarea id="stBio" class="st-input st-bio" maxlength="500" rows="3" placeholder="Расскажите немного о себе..."
            oninput="$('#stBioCnt').textContent = this.value.length">${escapeHtml(bio)}</textarea>
        <p class="st-counter"><span id="stBioCnt">${bio.length}</span>/500</p>
    </div>
    <button type="button" class="st-save" onclick="saveSettingsProfile()">Сохранить</button>
</section>
<section class="st-card">
    <div class="st-card-head">
        <h3>${ST_ICONS.userRound}<span class="min-w-0">Аватар</span></h3>
        <p>Загрузите своё фото</p>
    </div>
    <div class="flex items-center gap-4 flex-wrap">
        <label class="st-avpick" title="Заменить">
            ${p.avatar ? `<img src="${p.avatar}" alt="Фото профиля">` : `<span class="st-av-empty">${escapeHtml(initials(accountUser.username))}</span>`}
            <span class="st-pick-hov">${ST_ICONS.crop}<span>Заменить</span></span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" onchange="uploadProfileImage('avatar', this)">
        </label>
        <div class="st-filebtns">
            ${p.avatar ? `<button type="button" class="st-filebtn st-filebtn--red" onclick="settingsClearImage('avatar')">${ST_ICONS.trash}Удалить</button>` : ''}
            <button type="button" class="st-filebtn" onclick="$('#avatarFileInput').click()">${ST_ICONS.upload}Выбрать файл</button>
        </div>
    </div>
    <p class="st-hint">Макс. 5МБ · JPEG, PNG, WebP, GIF</p>
</section>
<section class="st-card">
    <div class="st-card-head">
        <h3>${ST_ICONS.img}<span class="min-w-0">Баннер профиля</span></h3>
        <p>Отображается вверху страницы профиля</p>
    </div>
    <label class="st-banpick" title="Заменить">
        <div class="st-banner" style="${p.banner ? `background-image:url('${p.banner}')` : ''}"></div>
        <span class="st-pick-hov st-pick-hov--ban">${ST_ICONS.crop}<span>Заменить</span></span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" onchange="uploadProfileImage('banner', this)">
    </label>
    <div class="st-filebtns">
        ${p.banner ? `<button type="button" class="st-filebtn st-filebtn--red" onclick="settingsClearImage('banner')">${ST_ICONS.trash}Удалить</button>` : ''}
    </div>
    <p class="st-hint">Рекомендуется 1200×400 px · Макс. 5МБ</p>
</section>`;
}

function stAccountTab() {
    const hasGoogle = !!accountUser.has_google;
    const email = accountUser.email || '';
    const methodsCount = 1 + (hasGoogle ? 1 : 0);
    const pill = (ok, text) => `<span class="st-pillx ${ok ? 'st-pillx--ok' : 'st-pillx--warn'}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ok
            ? '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
            : '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'}</svg>
        <span class="truncate">${text}</span></span>`;
    const methodRow = (icon, name, sub, pillHtml, action) => `
        <div class="st-method">
            <span class="st-method-ic">${icon}</span>
            <div class="min-w-0 flex-1">
                <p class="st-method-name">${name}</p>
                <p class="st-method-sub">${sub}</p>
            </div>
            <div class="shrink-0 flex items-center gap-2">
                ${pillHtml}
                ${action || ''}
            </div>
        </div>`;
    return `
    <section class="st-card">
    <div class="st-card-head st-card-head--row">
        <div class="min-w-0">
            <h3>${ST_ICONS.shield}<span class="min-w-0">Способы входа</span></h3>
            <p>Чем можно зайти в аккаунт и что делать, если доступ потерян</p>
        </div>
        <span class="shrink-0 st-head-count">${methodsCount} способ${methodsCount === 1 ? '' : 'а'}</span>
    </div>
    ${methodsCount === 1 ? `
    <div class="st-warn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        <p>У вас один способ входа. Если потеряете к нему доступ, восстановить аккаунт будет нечем.</p>
    </div>` : ''}
    <div class="st-methods">
        ${methodRow('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
        'Почта и пароль', 'ник: ' + escapeHtml(accountUser.username) + (email ? ' · ' + escapeHtml(email) : ''),
        pill(true, 'Настроен'))}
        ${methodRow('<svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',
            'Google', hasGoogle ? 'Аккаунт Google привязан' : 'Быстрый вход одним кликом',
            pill(hasGoogle, hasGoogle ? 'Настроен' : 'Не настроен'),
            hasGoogle ? '' : `<button type="button" class="st-linkbtn" onclick="startGooglePopup(true)">Привязать</button>`)}
        ${methodRow('<svg width="16" height="16" viewBox="0 0 24 24" fill="#2AABEE"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
                'Telegram', 'Вход и уведомления через бота',
                pill(false, 'Скоро'))}
    </div>
</section>
<section class="st-card">
    <div class="st-card-head st-card-head--row">
        <div class="min-w-0">
            <h3>${ST_ICONS.mail}<span class="min-w-0">Email адрес</span></h3>
            <p>Адрес для входа и восстановления доступа</p>
        </div>
        <span class="shrink-0">${pill(true, 'Подтверждён')}</span>
    </div>
    ${email ? `
    <div class="st-emailbox">
        <p class="k">Текущий адрес</p>
        <p class="v">${escapeHtml(email)}</p>
        <svg class="ok" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    </div>` : `<p class="st-hint">Почта появится здесь после регистрации с почтой или привязки Google.</p>`}
</section>
<section class="st-card">
    <div class="st-card-head">
        <h3>${ST_ICONS.lock}<span class="min-w-0">Смена пароля</span></h3>
        <p>Минимум 8 символов, заглавная и строчная буквы, цифра</p>
    </div>
    <div class="st-field"><label class="st-label" for="stPassCur">Текущий пароль</label>
        <div class="st-input-wrap">
            <svg class="st-input-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input id="stPassCur" type="password" class="st-input st-input--pass" autocomplete="current-password" placeholder="••••••••">
            <button type="button" class="am-eye" onclick="togglePassById('stPassCur')" aria-label="Показать пароль"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
    </div>
    <div class="st-field"><label class="st-label" for="stPassNew">Новый пароль</label>
        <div class="st-input-wrap">
            <svg class="st-input-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input id="stPassNew" type="password" class="st-input st-input--pass" autocomplete="new-password" placeholder="Минимум 8 символов">
            <button type="button" class="am-eye" onclick="togglePassById('stPassNew')" aria-label="Показать пароль"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
    </div>
    <div class="st-field"><label class="st-label" for="stPassNew2">Подтвердите пароль</label>
        <div class="st-input-wrap">
            <svg class="st-input-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            <input id="stPassNew2" type="password" class="st-input st-input--pass" autocomplete="new-password" placeholder="••••••••">
            <button type="button" class="am-eye" onclick="togglePassById('stPassNew2')" aria-label="Показать пароль"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
    </div>
    <p id="stPassErr" class="st-error hidden"></p>
    <button type="button" class="st-save st-save--min" id="stPassSaveBtn" onclick="saveSettingsPassword()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Сменить пароль</button>
</section>
<section class="st-card st-card--danger">
    <div class="st-card-head">
        <h3>${ST_ICONS.warn}<span class="min-w-0">Опасная зона</span></h3>
        <p>Действия, которые нельзя отменить</p>
    </div>
    <div class="st-methods">
        <div class="st-method">
            <span class="st-method-ic st-method-ic--red"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96 3.15"/><path d="M7 19h5"/><rect width="6" height="10" x="16" y="12" rx="2"/></svg></span>
            <div class="min-w-0 flex-1">
                <p class="st-method-name">Выйти со всех устройств</p>
                <p class="st-method-sub">Завершит все сессии, кроме текущей</p>
            </div>
            <div class="shrink-0"><button type="button" class="st-danger-btn" onclick="settingsLogoutAll()">Выйти везде</button></div>
        </div>
        <div class="st-method">
            <span class="st-method-ic st-method-ic--red"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
            <div class="min-w-0 flex-1">
                <p class="st-method-name">Удалить аккаунт</p>
                <p class="st-method-sub">Библиотека и история будут стёрты безвозвратно</p>
            </div>
            <div class="shrink-0"><button type="button" class="st-danger-btn" onclick="confirmDeleteAccount()">Удалить</button></div>
        </div>
    </div>
</section>`;
}

async function saveSettingsProfile() {
    const username = ($('#stUsername')?.value || '').trim();
    const bio = $('#stBio')?.value || '';
    if (username !== accountUser.username && !/^[A-Za-zА-Яа-яЁё0-9_\-]{3,32}$/.test(username)) {
        toast('Никнейм: 3–32 символа — буквы, цифры, «_» и «-»', 'error');
        return;
    }
    const p = window._profileData || {};
    try {
        const res = await fetch('/api/account/profile', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, bio, banner: p.banner || '', avatar: p.avatar || '' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        applyAccountState(data);
        renderSettings();
        toast('✔ Профиль сохранён');
    } catch (e) { toast(e.message, 'error'); }
}

async function settingsClearImage(kind) {
    const p = window._profileData || {};
    try {
        const res = await fetch('/api/account/profile', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: accountUser.username, bio: p.bio || '',
                banner: kind === 'banner' ? '' : (p.banner || ''),
                avatar: kind === 'avatar' ? '' : (p.avatar || ''),
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        applyAccountState(data);
        refreshHeaderAvatar();
        renderSettings();
        toast(kind === 'avatar' ? 'Аватар удалён' : 'Баннер удалён');
    } catch (e) { toast(e.message, 'error'); }
}

async function saveSettingsPassword() {
    const btn = $('#stPassSaveBtn');
    if (btn && btn.disabled) return;              // защита от двойного сабмита
    if (btn) btn.disabled = true;
    const err = $('#stPassErr');
    err?.classList.add('hidden');
    try {
        const current = $('#stPassCur')?.value || '';
        const nw = $('#stPassNew')?.value || '';
        const nw2 = $('#stPassNew2')?.value || '';
        if (nw.length < 8 || !/[A-Z]/.test(nw) || !/[a-z]/.test(nw) || !/[0-9]/.test(nw)) {
            if (err) { err.textContent = 'Новый пароль не соответствует требованиям'; err.classList.remove('hidden'); }
            return;
        }
        if (nw !== nw2) {
            if (err) { err.textContent = 'Пароли не совпадают'; err.classList.remove('hidden'); }
            return;
        }
        const res = await fetch('/api/account/change-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current, new: nw }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        ['stPassCur', 'stPassNew', 'stPassNew2'].forEach(id => { const el = $('#' + id); if (el) el.value = ''; });
        toast('✔ Пароль изменён');
    } catch (e) {
        if (err) { err.textContent = e.message; err.classList.remove('hidden'); }
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function settingsLogoutAll() {
    if (!confirm('Выйти со всех устройств, кроме этого?')) return;
    try {
        const res = await fetch('/api/account/logout-all', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        toast(`Готово — завершено сессий: ${data.ended || 0}`);
    } catch (e) { toast(e.message, 'error'); }
}


function openProfile(fromRouter) {
    stopSearchUpdates();
    if (location.pathname !== '/profile') history.pushState({ profile: true }, '', '/profile');
    closeDrawer();
    hideTitlePageSilently();
    clearSearch();
    hideCatalogChrome();
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#titleView').classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#profileView').classList.remove('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    setActiveNav('profile');
    window._profileShowAllRatings = false;
    renderProfile();
    if (!fromRouter) window.scrollTo(0, 0);
}

function setProfileFilter(n) {
    window.profileFilter = n;
    renderProfile();
}

function renderProfile() {
    const host = $('#profileContent');
    if (!host) return;
    const d = window._profileData || {};
    const bio = d.bio || '';
    const banner = d.banner || '';
    const avatarUrl = d.avatar || '';
    const name = accountUser ? accountUser.username : 'Локальный профиль';
    const isOwn = !!accountUser;

    const ratings = libraryState.ratings || {};
    const entries = Object.entries(ratings)
        .map(([k, v]) => ({ key: k, ...v }))
        .filter(e => e && e.item && e.item.title)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const progressData = safeParse(localStorage.getItem('mediaserver_progress'), {});
    const localRt = safeParse(localStorage.getItem('mediaserver_runtime'), {});
    const runtimeOf = (k) => Number((progressData[k] || {}).runtime) || Number(localRt[k]) || 0;
    const keysForTime = new Set([...Object.keys(ratings), ...Object.keys(libraryState.watched || {})]);
    let totalMin = 0;
    keysForTime.forEach(k => { totalMin += runtimeOf(k); });

    const watching = Object.values(libraryState.watching || {})
        .map(x => x.item).filter(Boolean).slice(0, 6);
    const onholdCount = Object.keys(libraryState.onhold || {}).length;
    const droppedCount = Object.keys(libraryState.dropped || {}).length;
    const favoritesCount = Object.keys(libraryState.favorites || {}).length;
    const plannedCount = Object.keys(libraryState.planned || {}).length;
    const watchedCount = Object.keys(libraryState.watched || {}).length;
    const watchingCount = Object.keys(libraryState.watching || {}).length;
    const historyCount = (recentlyViewed || []).length;

    // последние 5 оценок для ленты
    const recentRatings = entries.slice(0, 5);

    const avatarInner = avatarUrl
        ? `<img src="${avatarUrl}" alt="" class="w-full h-full rounded-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <span class="w-full h-full rounded-full bg-marquee/20 flex items-center justify-center text-3xl font-bold font-display text-marqueeHi" style="display:none">${escapeHtml((name || '?').slice(0, 2).toUpperCase())}</span>`
        : `<span class="w-full h-full rounded-full bg-marquee/20 flex items-center justify-center text-3xl font-bold font-display text-marqueeHi">${escapeHtml((name || '?').slice(0, 2).toUpperCase())}</span>`;

    const dateStr = accountUser && accountUser.createdAt
        ? new Date(accountUser.createdAt * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    const isEditingBio = window._profileEditingBio === true;

    const sideStat = (label, value, onclick) => `
        <button type="button" ${onclick ? `onclick="${onclick}"` : ''}
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition text-left">
            <span class="text-sm text-muted">${label}</span>
            <span class="text-sm font-bold text-ink tabular-nums">${value}</span>
        </button>`;

    host.innerHTML = `
<!-- ===== БАННЕР ===== -->
<div class="profile-banner mb-4">
    ${banner ? `<img src="${banner}" alt="" onerror="this.style.display='none'">` : '<div class="profile-banner-empty">🎬</div>'}
    <div class="profile-banner-fade"></div>
    ${isOwn ? `
    <div class="absolute top-3 right-3 flex gap-2 z-10">
        <button onclick="$('#bannerFileInput').click()" class="btn-ghost h-9 px-3 rounded-xl text-xs flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            Сменить фон
        </button>
    </div>` : ''}
</div>

<!-- ===== ШАПКА ===== -->
<div class="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-10 mb-4">
    <div class="shrink-0 relative">
        <div class="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden profile-avatar-ring relative">
            ${avatarInner}
        </div>
        ${isOwn ? `
        <button onclick="$('#avatarFileInput').click()" class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-marquee border-2 border-bg flex items-center justify-center text-white hover:bg-marqueeHi transition" title="Сменить аватар">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>` : ''}
    </div>
    <div class="flex-1 min-w-0 text-center sm:text-left pb-1">
        <h1 class="font-display text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">${escapeHtml(name)}</h1>
        <div class="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm ${accountUser ? 'text-ok' : 'text-faint'}">
            <span class="w-1.5 h-1.5 rounded-full ${accountUser ? 'bg-ok' : 'bg-faint'} inline-block"></span>
            ${accountUser ? 'В сети' : 'Локальный профиль'}
        </div>
        ${dateStr ? `<p class="text-xs text-faint mt-1">На сайте с ${dateStr}</p>` : ''}
    </div>
</div>

<!-- ===== BIO ===== -->
${isEditingBio ? `
<div class="mb-6">
    <textarea id="bioEditTextarea" class="profile-bio-edit" rows="3" maxlength="500" placeholder="Расскажите о себе...">${escapeHtml(bio)}</textarea>
    <div class="flex gap-2 mt-2">
        <button onclick="saveBioEdit()" class="btn-primary h-9 px-4 rounded-xl text-sm">Сохранить</button>
        <button onclick="cancelBioEdit()" class="btn-ghost h-9 px-4 rounded-xl text-sm">Отмена</button>
    </div>
</div>` : bio ? `
<div class="mb-6 flex items-start gap-2 group">
    <p class="text-sm text-muted leading-relaxed flex-1 max-w-2xl whitespace-pre-line">${escapeHtml(bio)}</p>
    ${isOwn ? `<button onclick="startBioEdit()" class="shrink-0 w-8 h-8 rounded-lg btn-ghost flex items-center justify-center opacity-0 group-hover:opacity-100 transition" title="Редактировать">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
    </button>` : ''}
</div>` : isOwn ? `
<div class="mb-6">
    <button onclick="startBioEdit()" class="text-sm text-faint hover:text-muted transition flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Добавить описание
    </button>
</div>` : ''}

<!-- ===== ДВУХКОЛОНОЧНАЯ СЕТКА ===== -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

    <!-- ===== ГЛАВНАЯ КОЛОНКА ===== -->
    <div class="lg:col-span-8 space-y-4 lg:space-y-5">

        <!-- Сейчас смотрит -->
        ${watching.length ? `
        <div>
            <div class="flex items-center gap-2.5 mb-3 px-0.5">
                <span class="marquee-rule" style="width:22px"></span>
                <h3 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Сейчас смотрит</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${watching.map(it => {
        const key = registerItem(it);
        return `<a href="${escapeAttr(titleHref(it))}" onclick="return handleCardActivate(event, '${escapeAttr(key)}')"
                        class="profile-watching-card">
                        <img src="${img(it.poster) || placeholderSvg(100, 150)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(100,150)">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold text-ink line-clamp-2">${escapeHtml(it.title)}</p>
                            <p class="text-xs text-faint mt-0.5">${escapeHtml(it.year || '')}${it.type ? ' · ' + escapeHtml(it.type) : ''}</p>
                        </div>
                        <span class="text-faint shrink-0">${icon('chevronRight')}</span>
                    </a>`;
    }).join('')}
            </div>
        </div>` : ''}

        <!-- Последние оценки (лента) -->
        ${recentRatings.length ? `
        <div>
            <div class="flex items-center gap-2.5 mb-3 px-0.5">
                <span class="marquee-rule" style="width:22px"></span>
                <h3 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Последние оценки</h3>
                <button type="button" onclick="showAllRatings()" class="ml-auto text-xs font-medium text-goldHi hover:text-goldHi/80 transition">
                    Все оценки (${entries.length}) →
                </button>
            </div>
            <div class="rating-strip">
                ${recentRatings.map(e => {
        const key = registerItem(e.item);
                    const stars = '★'.repeat(Math.round(e.rating));
                    return `<a href="${escapeAttr(titleHref(e.item))}" onclick="return handleCardActivate(event, '${escapeAttr(key)}')"
                        class="rating-mini-card card-focusable">
                        <span class="rating-mini-poster">
                            <img src="${img(e.item.poster) || placeholderSvg(180, 270)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(180,270)">
                        </span>
                        <span class="rating-mini-score"><span class="stars">${stars}</span> ${e.rating}</span>
                        <span class="rating-mini-name">${escapeHtml(e.item.title)}</span>
                    </a>`;
    }).join('')}
                <button type="button" onclick="showAllRatings()" class="flex flex-col items-center justify-center w-[70px] shrink-0">
                    <span class="w-10 h-10 rounded-full border-2 border-border bg-surface flex items-center justify-center hover:border-marquee/50 transition">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </span>
                    <span class="text-[10px] text-faint mt-1.5 text-center">Все ${entries.length}</span>
                </button>
            </div>
        </div>` : `
        <div>
            <div class="flex items-center gap-2.5 mb-3 px-0.5">
                <span class="marquee-rule" style="width:22px"></span>
                <h3 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Оценки</h3>
            </div>
            <p class="text-muted text-sm py-8 text-center">Вы ещё не ставили оценки.<br>Откройте тайтл и нажмите на звёзды.</p>
        </div>`}

        <!-- Коллекции (заготовка) -->
        <div>
            <div class="flex items-center gap-2.5 mb-3 px-0.5">
                <span class="marquee-rule" style="width:22px"></span>
                <h3 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Коллекции</h3>
                <span class="text-xs text-faint">скоро</span>
            </div>
            <div class="bg-white/[.03] border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
                <div class="w-12 h-12 rounded-xl bg-marquee/10 border border-marquee/20 flex items-center justify-center text-marqueeHi">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <p class="text-sm text-muted">Создавайте подборки любимых тайтлов<br>и делитесь ими с друзьями</p>
            </div>
        </div>

    </div>

    <!-- ===== БОКОВАЯ КОЛОНКА ===== -->
    <div class="lg:col-span-4 space-y-4">

        <!-- Статистика (геймерский стиль) -->
        <div class="bg-white/[.03] border border-border rounded-2xl overflow-hidden">
            <div class="px-4 py-3 border-b border-border flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A67CFF" stroke-width="2"><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6M18 9h1.5a1 1 0 0 0 0-5H18M4 22h16"/></svg>
                <h3 class="font-display uppercase text-sm tracking-wide text-goldHi">Статистика</h3>
            </div>
            <div class="p-3 grid grid-cols-3 gap-2">
                <div class="stat-hex">
                    <div class="icon" style="background:rgba(124,77,255,.15);color:#A67CFF;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z"/></svg>
                    </div>
                    <span class="v">${entries.length}</span>
                    <span class="k">Оценок</span>
                </div>
                <div class="stat-hex">
                    <div class="icon" style="background:rgba(34,197,94,.12);color:#4ade80;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <span class="v">${totalMin ? fmtMinutes(totalMin) : '—'}</span>
                    <span class="k">Время</span>
                </div>
                <div class="stat-hex">
                    <div class="icon" style="background:rgba(45,212,191,.12);color:#2dd4bf;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <span class="v">${watchedCount}</span>
                    <span class="k">Просмотрено</span>
                </div>
            </div>
        </div>

        <!-- Библиотека -->
        <div class="bg-white/[.03] border border-border rounded-2xl overflow-hidden">
            <div class="px-4 py-3 border-b border-border flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A67CFF" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                <h3 class="font-display uppercase text-sm tracking-wide text-goldHi">Библиотека</h3>
            </div>
            <div class="py-1">
                ${sideStat('Смотрю', watchingCount, "openLibrary('watching')")}
                ${sideStat('Буду смотреть', plannedCount, "openLibrary('planned')")}
                ${sideStat('Просмотрено', watchedCount, "openLibrary('watched')")}
                ${sideStat('Отложено', onholdCount, "openLibrary('onhold')")}
                ${sideStat('Брошено', droppedCount, "openLibrary('dropped')")}
                ${sideStat('Избранное', favoritesCount, "openLibrary('favorites')")}
            </div>
        </div>

        <!-- Друзья (заготовка) -->
        <div class="bg-white/[.03] border border-border rounded-2xl overflow-hidden">
            <div class="px-4 py-3 border-b border-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A67CFF" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <h3 class="font-display uppercase text-sm tracking-wide text-goldHi">Друзья</h3>
                </div>
                <span class="text-xs text-faint tabular-nums">0</span>
            </div>
            <div class="friends-empty">
                <div class="icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <p class="text-sm text-faint">Пока никого</p>
                <p class="text-xs text-faint/60">Скоро: подписывайтесь на друзей<br>и смотрите их коллекции</p>
            </div>
        </div>

    </div>
</div>`;
}

function showAllRatings() {
    // переключаемся в полный режим: показываем фильтры и все карточки
    window._profileShowAllRatings = true;
    renderProfile();
}

function showAllRatings() {
    const ratings = libraryState.ratings || {};
    const entries = Object.entries(ratings)
        .map(([k, v]) => ({ key: k, ...v }))
        .filter(e => e && e.item && e.item.title)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    window._ratingsModalData = entries;
    window._ratingsModalFilter = 0;
    renderRatingsModal();
    $('#ratingsModal').classList.remove('hidden');
    lockPageScroll();
}

function closeRatingsModal() {
    $('#ratingsModal').classList.add('hidden');
    unlockPageScroll();
}

function setRatingsFilter(n) {
    window._ratingsModalFilter = n;
    renderRatingsModal();
}

function renderRatingsModal() {
    const entries = window._ratingsModalData || [];
    const filter = window._ratingsModalFilter || 0;
    const shown = filter ? entries.filter(e => e.rating === filter) : entries;
    const counts = {};
    entries.forEach(e => counts[e.rating] = (counts[e.rating] || 0) + 1);

    $('#ratingsModalCount').textContent = `${entries.length}`;

    const chips = [0, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5]
        .filter(n => n === 0 || counts[n])
        .map(n => `<button type="button" onclick="setRatingsFilter(${n})"
            class="btn-ghost text-xs font-semibold px-3 h-8 rounded-lg ${filter === n ? 'is-active' : ''}">
            ${n === 0 ? 'Все' : '★ ' + n}${counts[n] ? ' · ' + counts[n] : ''}</button>`).join('');
    $('#ratingsModalChips').innerHTML = chips;

    if (!shown.length) {
        $('#ratingsModalGrid').innerHTML = '';
        $('#ratingsModalEmpty').classList.remove('hidden');
    } else {
        $('#ratingsModalEmpty').classList.add('hidden');
        $('#ratingsModalGrid').innerHTML = shown.map(e => {
            const key = registerItem(e.item);
            return `<a href="${escapeAttr(titleHref(e.item))}" onclick="closeRatingsModal(); return handleCardActivate(event, '${escapeAttr(key)}')"
                class="poster-card card-focusable">
                <div class="poster-wrap">
                    <img src="${img(e.item.poster) || placeholderSvg(300, 450)}" alt="" loading="lazy" class="poster-img" onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
                    <div class="poster-scrim"></div>
                    <div class="poster-ring"></div>
                    <div class="absolute top-2 left-2 right-20 flex flex-wrap gap-1">
                        <span class="rating-pill">${icon('star')}<span style="color:#d946ef">${e.rating}</span></span>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-2.5">
                        <p class="text-[13px] font-semibold leading-snug line-clamp-2 text-ink">${escapeHtml(e.item.title)}</p>
                        <p class="text-[11px] text-muted mt-0.5">${escapeHtml(e.item.year || '')}</p>
                    </div>
                </div>
            </a>`;
        }).join('');
    }
}

function startBioEdit() {
    window._profileEditingBio = true;
    renderProfile();
    const ta = $('#bioEditTextarea');
    if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
}
function cancelBioEdit() {
    window._profileEditingBio = false;
    renderProfile();
}
async function saveBioEdit() {
    const ta = $('#bioEditTextarea');
    if (!ta) return;
    const bio = ta.value.trim();
    window._profileEditingBio = false;
    await saveProfileField('bio', bio);
}

async function uploadProfileImage(type, input) {
    if (!input.files || !input.files[0]) return;
    if (!accountUser) { toast('Войдите в аккаунт', 'error'); return; }
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
        toast('Файл больше 5 МБ', 'error');
        input.value = '';
        return;
    }
    const formData = new FormData();
    // префикс имени файла определяет папку (avatars/banners)
    formData.append('file', file, `${type}_${file.name}`);
    try {
        toast('Загружаю...');
        const res = await fetch('/api/account/upload', { method: 'POST', body: formData });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.detail || 'HTTP ' + res.status);
        }
        const d = await res.json();
        window._profileData = window._profileData || {};
        window._profileData[type === 'avatar' ? 'avatar' : 'banner'] = d.url;
        renderProfile();
        renderSettings();
        toast('✔ Загружено');
    } catch (e) { toast(e.message, 'error'); }
    input.value = '';
}

async function saveProfileField(field, value) {
    if (!accountUser) { toast('Войдите в аккаунт', 'error'); return; }
    try {
        const d = window._profileData || {};
        const body = { bio: d.bio || '', banner: d.banner || '', avatar: d.avatar || '' };
        body[field] = value;
        const res = await fetch('/api/account/profile', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const state = await res.json();
        window._profileData = { bio: state.bio || '', banner: state.banner || '', avatar: state.avatar || '' };
        renderProfile();
        toast('✔ Профиль обновлён');
    } catch (e) { toast(e.message, 'error'); }
}

function profileBack() {
    if (history.state && history.state.profile) history.back();
    else goHome();
}
/* ============================================================
АНИМЕ: РАЗДЕЛ + РАСПИСАНИЕ
============================================================ */
const ANIME_SECTIONS = [
    { key: 'airing', title: 'Выходит сейчас', icon: 'sparkles' },
    { key: 'popular', title: 'Популярное аниме', icon: 'film' },
    { key: 'top', title: 'Лучшее аниме', icon: 'star' },
    { key: 'fresh', title: 'Новинки аниме', icon: 'wand' },
];
let ANIME_DATA = null;
let animeTab = 'overview';
const ANIME_SCH = { day: 'today' };   // выбранный день расписания

function openAnime(fromRouter) {
    stopSearchUpdates();
    if (location.pathname !== '/anime') history.pushState({ anime: true }, '', '/anime');
    closeDrawer();
    hideTitlePageSilently();
    clearSearch();
    hideCatalogChrome();
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#titleView').classList.add('hidden');
    $('#animeView').classList.remove('hidden');
    $('#listView')?.classList.add('hidden');
    setActiveNav('anime');
    setAnimeTab(animeTab);
    loadAnime();
    if (!fromRouter) window.scrollTo(0, 0);
}

function setAnimeTab(tab) {
    animeTab = tab;
    $('#animeOverview')?.classList.toggle('hidden', tab !== 'overview');
    $('#animeSchedule')?.classList.toggle('hidden', tab !== 'schedule');
    const b1 = $('#animeTabOverview'), b2 = $('#animeTabSchedule');
    if (b1) { b1.classList.toggle('is-active', tab === 'overview'); b1.setAttribute('aria-selected', String(tab === 'overview')); }
    if (b2) { b2.classList.toggle('is-active', tab === 'schedule'); b2.setAttribute('aria-selected', String(tab === 'schedule')); }
}

async function loadAnime(force) {
    const validCache = () => {
        try {
            const cached = sessionStorage.getItem('mediaserver_anime_cache');
            const at = Number(sessionStorage.getItem('mediaserver_anime_cache_at') || 0);
            if (!cached || Date.now() - at > 10 * 60 * 1000) return null;
            return JSON.parse(cached);
        } catch (e) { return null; }
    };
    const draw = () => { try { renderAnime(); } catch (e) { console.error('[anime] render:', e); } };
    if (!force) {
        const c = validCache();
        if (c) { ANIME_DATA = c; draw(); return; }
    }
    $('#animeOverview').innerHTML = '<div class="h-40 skeleton rounded-2xl"></div>';
    $('#animeSchedule').innerHTML = '<div class="h-40 skeleton rounded-2xl"></div>';
    try {
        const res = await fetch('/api/anime/home', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        ANIME_DATA = await res.json();
        try {
            sessionStorage.setItem('mediaserver_anime_cache', JSON.stringify(ANIME_DATA));
            sessionStorage.setItem('mediaserver_anime_cache_at', String(Date.now()));
        } catch (e) { }
        draw();
    } catch (e) {
        console.error(e);
        $('#animeOverview').innerHTML = '<div class="text-center py-16"><p class="text-muted text-sm">Не удалось загрузить раздел. Проверьте соединение.</p></div>';
        $('#animeSchedule').innerHTML = '';
    }
}

/* текущий сезон для бейджа баннера */
/* сезон по японской конвенции: зима янв–март, весна апр–июнь,
   лето июл–сен, осень окт–дек (в декабре ещё осенний сезон) */
function animeSeasonLabel() {
    const m = new Date().getMonth() + 1;
    const season = (m <= 3) ? 'Зимний' : (m <= 6) ? 'Весенний' : (m <= 9) ? 'Летний' : 'Осенний';
    return `${season} сезон ${new Date().getFullYear()}`;
}

/* баннер аниме: первый из сегодняшнего расписания (иначе — топ) */
function renderAnimeHero() {
    const days = animeScheduleDays();
    const today = days.find(d => d.isToday);
    const pool = ((today && today.items) || []).concat(ANIME_DATA.top || [], ANIME_DATA.popular || []);
    const it = pool.find(x => x && x.title && x.poster && (x.description || '').trim().length > 40);
    if (!it) return '';
    const key = registerItem(it);
    const mal = Number(it.rating_mal);
    const malHtml = (Number.isFinite(mal) && mal > 0)
        ? `<span class="hm-rating hm-rating--${mal >= 7 ? 'hi' : (mal >= 5 ? 'mid' : 'low')}">${icon('star')} MAL ${mal.toFixed(1)}</span>` : '';
    const genres = uniqueGenres(it.genres || []).slice(0, 3).join(', ');
    const desc = (it.description || '').trim();
    return `
<section class="anime-hero" aria-label="Аниме сезона">
    <div class="ah-bg" style="background-image:url('${escapeAttr(img(it.poster) || '')}')"></div>
    <div class="ah-veil"></div>
    <div class="ah-body">
        <span class="ah-badge">${icon('sparkles')} ${escapeHtml(animeSeasonLabel())}</span>
        <h2 class="ah-title font-display">${escapeHtml(it.title)}</h2>
        <div class="hero-meta mt-2 mb-0">
            ${malHtml}
            ${it.year ? `<span class="hm-item">${escapeHtml(String(it.year))}</span>` : ''}
            ${it.is_ongoing ? `<span class="hm-item">Онгоинг</span>` : ''}
            ${genres ? `<span class="hm-item">${escapeHtml(genres)}</span>` : ''}
        </div>
        ${desc ? `<p class="ah-desc">${escapeHtml(desc)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-3 mt-5">
            <button class="btn-primary h-11 px-6 rounded-xl flex items-center gap-2 text-sm" onclick="navigateToTitle('${escapeAttr(key)}')">${icon('playFill')} Смотреть</button>
            <button class="btn-ghost h-11 px-5 rounded-xl flex items-center gap-2 text-sm" onclick="animeHeroFav('${escapeAttr(key)}')">${icon('heart')}<span>В избранное</span></button>
        </div>
    </div>
    <img class="ah-poster" src="${img(it.poster) || placeholderSvg(300, 450)}" alt="" loading="lazy" onerror="this.style.display='none'">
</section>`;
}
function animeHeroFav(key) {
    const it = getRegistered(key);
    if (!it) return;
    setLibraryStatus('favorites', it);
    toast(isInLibrary('favorites', it) ? 'Добавлено в избранное' : 'Убрано из избранного');
}

function renderAnime() {
    if (!ANIME_DATA) return;
    const hero = renderAnimeHero();
    const parts = ANIME_SECTIONS.map(s => renderRow(s.key, s.title, s.icon, ANIME_DATA[s.key])).filter(Boolean);
    $('#animeOverview').innerHTML = hero + (parts.length
        ? `<div class="anime-rows">${parts.join('')}</div>`
        : (hero ? '' : '<p class="text-muted text-sm py-16 text-center">Аниме пока не найдено в каталоге.</p>'));
    const days = animeScheduleDays();
    const today = days.find(d => d.isToday);
    $('#animeSubtitle').textContent = (today && today.items.length)
        ? `Сегодня выходит ${today.items.length} ${pluralTitles(today.items.length)}`
        : 'Подборки и расписание выхода серий';
    renderSchedule();
    enableDragScroll('#animeOverview .row-scroller');
}

function animeScheduleDays() {
    const sched = (ANIME_DATA && ANIME_DATA.schedule) || {};
    const clean = (arr) => (arr || []).filter(x => x && x.title);
    if (Array.isArray(sched.days) && sched.days.length) {
        return sched.days.map(d => ({
            key: String(d.key || d.label),
            label: d.label || '',
            date: d.date || null,
            items: clean(d.items),
            isToday: !!d.isToday,
        }));
    }
    const now = new Date();
    const shift = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
    return [
        { key: 'yesterday', label: 'Вчера', date: shift(-1), items: clean(sched.yesterday), isToday: false },
        { key: 'today', label: 'Сегодня', date: now, items: clean(sched.today), isToday: true },
        { key: 'tomorrow', label: 'Завтра', date: shift(1), items: clean(sched.tomorrow), isToday: false },
    ];
}

function schParseDate(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v) ? null : v;
    const d = new Date(typeof v === 'string' && v.length === 10 ? v + 'T00:00:00' : v);
    return isNaN(d) ? null : d;
}
function fmtSchDate(v) {
    const d = schParseDate(v);
    if (!d) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
}
function schDayShort(d, total) {
    const date = schParseDate(d.date);
    if (total >= 5 && date) {
        const wd = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        if (wd) return wd.toUpperCase();
    }
    return d.label;
}

function setScheduleDay(key) { ANIME_SCH.day = key; renderSchedule(); }

function renderSchedule() {
    const host = $('#animeSchedule');
    if (!host) return;
    const days = animeScheduleDays();
    if (!days.length || !days.some(d => d.items.length)) {
        host.innerHTML = '<div class="rounded-2xl border border-white/[.06] bg-white/[.02] py-14 text-center"><p class="text-muted text-sm">Расписание пока пустое.</p></div>';
        return;
    }
    if (!days.find(d => d.key === ANIME_SCH.day)) ANIME_SCH.day = 'today';
    if (!days.find(d => d.key === ANIME_SCH.day)) ANIME_SCH.day = (days.find(d => d.isToday) || days[0]).key;
    const cur = days.find(d => d.key === ANIME_SCH.day);

    host.innerHTML = `
<div class="sch-days" role="tablist" aria-label="Дни расписания">
    ${days.map(d => `
    <button type="button" class="sch-day ${d.key === ANIME_SCH.day ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''} ${d.items.length ? '' : 'is-empty'}"
        role="tab" aria-selected="${d.key === ANIME_SCH.day}" title="${escapeAttr(d.label)}" onclick="setScheduleDay('${escapeAttr(d.key)}')">
        <span class="d-name">${escapeHtml(schDayShort(d, days.length))}</span>
        <span class="d-date">${escapeHtml(fmtSchDate(d.date))}</span>
        <span class="d-cnt">${d.items.length || '—'}</span>
    </button>`).join('')}
</div>
 ${cur.items.length ? `
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6 md:mt-8">
    ${cur.items.map(it => renderScheduleCard(it, cur.isToday)).join('')}
</div>` : `
<p class="text-muted text-sm text-center py-14">В этот день запланированных выходов нет.</p>`}`;
}

function renderScheduleCard(it, isToday) {
    registerItem(it);
    const key = escapeAttr(itemKey(it));
    const href = escapeAttr(titleHref(it));
    const statusHtml = statusBadgesHtml(it);
    const ep = Number(it.episode);
    const epBadge = Number.isFinite(ep) && ep > 0
        ? `<span class="sch-ep ${isToday ? 'sch-ep--new' : ''}">EP ${ep}</span>`
        : (it.is_ongoing ? `<span class="sch-ep">Онгоинг</span>` : '');
    const time = it.publish_time || it.time || '';
    const malBadge = it.rating_mal
        ? `<span class="rating-pill">${icon('star')}<span style="color:#2dd4bf">MAL</span> ${Number(it.rating_mal).toFixed(1)}</span>`
        : '';
    const nextHtml = it.next_episode
        ? `<p class="sch-next">Далее: серия ${escapeHtml(String(it.next_episode))}${it.episodes_total ? ' из ' + escapeHtml(String(it.episodes_total)) : ''}</p>`
        : '';
    return `
<a class="poster-card card-focusable" href="${href}" aria-label="${escapeAttr(it.title)}"
onclick="return handleCardActivate(event, '${key}')">
<div class="poster-wrap">
<img src="${img(it.poster) || placeholderSvg(300, 450)}" alt="" loading="lazy" class="poster-img" onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
<div class="poster-scrim"></div>
<div class="poster-ring"></div>
<div class="absolute top-2 left-2 right-20 flex flex-wrap gap-1 items-start">
    ${malBadge}${epBadge}${time ? `<span class="sch-time">${icon('clock')} ${escapeHtml(String(time))}</span>` : ''}
</div>
 ${statusHtml ? `<div class="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">${statusHtml}</div>` : ''}
<div class="card-play">${icon('playFill')}</div>
<div class="absolute bottom-0 left-0 right-0 p-2.5">
<p class="text-[13px] font-semibold leading-snug line-clamp-2 text-ink">${escapeHtml(it.title)}</p>
 ${cardMetaHtml(it)}
 ${nextHtml}
</div>
</div>
</a>`;
}

function animeBack() {
    if (history.state && history.state.anime) history.back();
    else goHome();
}
function renderGrid(items, opts) {
    opts = opts || {};
    const grid = $('#gridGrid');
    if (!items.length) {
        grid.innerHTML = '';
        $('#gridEmptyText').textContent = opts.emptyText || 'Ничего не найдено.';
        $('#gridEmpty').classList.remove('hidden');
        return;
    }
    $('#gridEmpty').classList.add('hidden');
    grid.innerHTML = items.map(it => renderCard(it, { removable: !!opts.removable })).join('');
}
function removeHistory(key) {
    const target = recentlyViewed.find(x => itemKey(x) === key) || getRegistered(key) || {};
    const remKeys = new Set([...itemKeys(target), key]);
    recentlyViewed = recentlyViewed.filter(x => !itemKeys(x).some(k => remKeys.has(k)));
    saveRecent();
    markDeleted('history', key);
    if (currentGridType === 'history') openLibrary('history');
    sendAccountAction('history_remove', { key, item: target || {} });
    if (!$('#listView').classList.contains('hidden')) { renderListHistory(); }
}
function refreshVisibleLibrary() {
    updateSidebarCounts();
    if (!titleOpen && currentGridType && LIBRARY_META[currentGridType] && !window._cardQuickLite) openLibrary(currentGridType);
    if (currentItem) updateTitleModalActions();
    if (window._heroKey) updateHeroFavBtn();
    // динамическое обновление видимой страницы:
    if (!$('#listView').classList.contains('hidden')) renderList();
    if (!$('#homeView').classList.contains('hidden') && HOME_DATA && !window._cardQuickLite) renderHome();
}
/* ============================================================
   SEARCH
   ============================================================ */
function clearSearch() {
    $('#searchInput').value = '';
    $('#searchClearBtn').classList.add('hidden');
    hideSearchDropdown();
}
function hideSearchDropdown() {
    $('#searchDropdown').classList.add('hidden');
    $('#searchInput').setAttribute('aria-expanded', 'false');
}
function dismissSearchDropdown() {
    hideSearchDropdown();
    searchRequestId++;
    const dd = $('#searchDropdown'); if (dd) { dd.innerHTML = ''; dd.classList.remove('is-searching'); }
}
function onSearchInput(e) {
    const q = e.target.value.trim();
    $('#searchClearBtn').classList.toggle('hidden', !q);
    clearTimeout(searchDebounceTimer);
    window._searchRetries = 0;
    if (!q) { hideSearchDropdown(); return; }
    searchDebounceTimer = setTimeout(() => runSearch(q), 200);
}
async function runSearch(q, quiet) {
    const reqId = ++searchRequestId;
    const dd = $('#searchDropdown');
    const inGridView = currentGridType === 'search';
    if (!quiet && !inGridView) {
        dd.innerHTML = searchDropdownSkeletonHTML();
        dd.classList.add('is-searching');
        dd.classList.remove('hidden');
        $('#searchInput').setAttribute('aria-expanded', 'true');
    }
    if (inGridView && !(window._lastSearchResults || []).length) {
        $('#gridGrid').classList.add('hidden');
        $('#gridEmpty').classList.add('hidden');
        $('#gridLoading').innerHTML = gridSkeletonHTML(4);
        $('#gridLoading').classList.remove('hidden');
    }
    try {
        const res = await fetch(`/api/search/global?q=${encodeURIComponent(q)}`);
        if (reqId !== searchRequestId) return;
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (reqId !== searchRequestId) return;
        window._lastSearchResults = data;
        window._lastSearchQuery = q;
        $('#gridLoading').classList.add('hidden');
        $('#gridGrid').classList.remove('hidden');
        if (currentGridType === 'search') {
            hideSearchDropdown();
            $('#gridSubtitle').textContent = `«${q}» · найдено ${data.length}`;
            renderGrid(data, { emptyText: 'Ничего не найдено.' });
        } else {
            if (!data.length && (window._searchRetries || 0) < 3) {
                // пусто, но попытки остались: бэкенд ответил мгновенно,
                // значит внешний поиск ещё идёт в фоне — статус + повтор
                window._searchRetries = (window._searchRetries || 0) + 1;
                renderSearchPending(q);
                setTimeout(() => {
                    if (reqId === searchRequestId && $('#searchInput').value.trim() === q && currentGridType !== 'search') runSearch(q, true);
                }, 2200);
            } else {
                renderSearchDropdown(data, q);
                if (!quiet && data.length) {
                    setTimeout(() => {
                        if (reqId === searchRequestId && $('#searchInput').value.trim() === q && currentGridType !== 'search') runSearch(q, true);
                    }, 3500);
                }
            }
        }
    } catch (e) {
        if (reqId !== searchRequestId) return;
        $('#gridLoading').classList.add('hidden');
        dd.classList.remove('is-searching');
        if (!quiet && currentGridType !== 'search') {
            dd.innerHTML = `<div class="text-muted text-sm px-3 py-4">Ошибка поиска. Попробуйте ещё раз.</div>`;
        }
    }
}

/* пустой результат + фоновый поиск ещё идёт: показываем статус, а не «не найдено» */
function renderSearchPending(q) {
    const dd = $('#searchDropdown');
    dd.classList.add('is-searching');   // обводка: внешний поиск ещё идёт
    dd.innerHTML = `<div class="px-3 py-8 flex flex-col items-center gap-3">
        <span class="loader-spin"></span>
        <p class="text-sm text-muted">Ищем «${escapeHtml(q)}» во внешних источниках…</p>
    </div>
    <div id="searchPersons"></div>`;
    fetchPersonsForSearch(q, false);
}

function renderSearchDropdown(items, q) {
    const dd = $('#searchDropdown');
    dd.classList.remove('is-searching');
    if (!items.length) {
        dd.innerHTML = '<div id="searchPersons"></div>';
        fetchPersonsForSearch(q, true);
        return;
    }
    // фильтр по типам (появится в будущей версии полноценным, пока — заголовок с количеством)
    dd.innerHTML = `
        <div class="flex items-center gap-1.5 px-2 py-1.5 border-b border-border mb-1">
            <span class="text-[10px] font-display uppercase tracking-widest text-faint">Найдено</span>
            <span class="text-[10px] font-bold text-marqueeHi">${items.length} тайтлов</span>
        </div>`;
    const top = items.slice(0, 8);
    dd.innerHTML = top.map(it => {
        const key = registerItem(it);
        return `
<a role="option" href="${escapeAttr(titleHref(it))}"
onclick="hideSearchDropdown(); return handleCardActivate(event, '${escapeAttr(key)}')"
class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition">
<img src="${img(it.poster) || placeholderSvg(80, 120)}" class="w-11 h-16 object-cover rounded-lg bg-surface2 shrink-0" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(80,120)">
<span class="min-w-0 flex-1">
<span class="block text-sm font-medium text-ink line-clamp-1">${smMarkText(it.title, q)}</span>
<span class="block text-xs text-faint mt-0.5">${escapeHtml(it.year || '')}${it.year && it.type ? ' · ' : ''}${escapeHtml(it.type || '')}</span>
</span>
<span class="shrink-0 text-faint">${icon('chevronRight')}</span>
</a>`;
    }).join('')
        + '<div id="searchPersons"></div>'
        + (items.length > 8 ? `
<button onclick="showAllSearchResults('${escapeAttr(q)}')" class="w-full text-center text-xs font-medium text-goldHi hover:text-goldHi py-2.5 mt-1 border-t border-border">
Показать все результаты (${items.length})
</button>` : '');
    fetchPersonsForSearch(q, false);
    window._lastSearchResults = items;
}
function showAllSearchResults(q, fromRouter) {
    dismissSearchDropdown();
    stopSearchUpdates();
    currentGridType = 'search';
    hideCatalogChrome();
    leaveTitleIfNeeded('search');
    // поиск в URL: F5 / шеринк ссылки восстанавливает выдачу
    if (!fromRouter) history.pushState({}, '', '/?q=' + encodeURIComponent(q));
    $('#homeView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#gridView').classList.remove('hidden');
    setActiveNav('');
    $('#gridTitle').textContent = `Результаты поиска`;
    setGridHeadIcon('search');
    const crumb = $('#gridCrumb');
    if (crumb) crumb.innerHTML = '<a href="/" onclick="goHome();return false;">Главная</a><span class="sep">/</span><b>Результаты поиска</b>';
    const have = (window._lastSearchQuery === q) ? (window._lastSearchResults || []) : [];
    window._lastSearchQuery = q;
    window._lastSearchResults = have;
    $('#gridSubtitle').textContent = `«${q}»`;
    loadPersonsGrid(q);
    if (have.length) {
        $('#gridLoading').classList.add('hidden');
        $('#gridGrid').classList.remove('hidden');
        renderGrid(have, { emptyText: 'Ничего не найдено.' });
    } else {
        $('#gridGrid').classList.add('hidden');
        $('#gridEmpty').classList.add('hidden');
        $('#gridLoading').innerHTML = gridSkeletonHTML(4);
        $('#gridLoading').classList.remove('hidden');
        runSearch(q, true);
    }
    window.scrollTo(0, 0);
    startSearchUpdates(q);
}
let searchUpdatesTimer = null;
function stopSearchUpdates() {
    if (searchUpdatesTimer) { clearInterval(searchUpdatesTimer); searchUpdatesTimer = null; }
}
function startSearchUpdates(q) {
    stopSearchUpdates();
    const startedAt = Date.now();
    const tick = async () => {
        if (Date.now() - startedAt > 120000 || currentGridType !== 'search') { stopSearchUpdates(); return; }
        try {
            const known = (window._lastSearchResults || []).map(x => String(x.id || '')).filter(Boolean).join(',');
            const res = await fetch(`/api/search/global/updates?q=${encodeURIComponent(q)}&known=${encodeURIComponent(known)}`);
            if (!res.ok) return;
            const fresh = await res.json();
            if (Array.isArray(fresh) && fresh.length && currentGridType === 'search') {
                const knownIds = new Set((window._lastSearchResults || []).map(x => String(x.id || '')));
                const add = fresh.filter(x => !knownIds.has(String(x.id || '')));
                if (!add.length) return;
                add.forEach(it => registerItem(it));
                window._lastSearchResults = [...(window._lastSearchResults || []), ...add];
                $('#gridSubtitle').textContent = `«${q}» · найдено ${window._lastSearchResults.length}`;
                renderGrid(window._lastSearchResults, { emptyText: 'Ничего не найдено.' });
                $('#gridLoading').classList.add('hidden');
            }
        } catch (e) { /* тихо */ }
    };
    searchUpdatesTimer = setInterval(tick, 4000);
}

/* ============================================================
   МОДАЛЬНЫЙ ПОИСК (стиль animeon)
   ============================================================ */
const SM_ORDER = ['titles', 'people', 'users'];
let smMode = 'titles';
let smQuery = '';
let smResults = [];
let smSelected = -1;
let smReqId = 0;
let smDebounce = null;

/* ===== История поиска (localStorage, максимум 8) ===== */
function getSearchHistory() { return safeParse(localStorage.getItem('mediaserver_search_history'), []); }
function pushSearchHistory(q) {
    q = (q || '').trim();
    if (!q || q.length < 2) return;
    try {
        const h = getSearchHistory().filter(x => x !== q);
        h.unshift(q);
        localStorage.setItem('mediaserver_search_history', JSON.stringify(h.slice(0, 8)));
    } catch (e) { }
}
function smUseHistory(i) {
    const q = (window._smHist || [])[i] || '';
    if (!q) return;
    const inp = $('#smInput');
    if (inp) inp.value = q;
    smQuery = q;
    $('#smClear')?.classList.remove('hidden');
    smPerform();
}
function removeSearchHistory(i) {
    const q = (window._smHist || [])[i];
    if (q === undefined) return;
    try {
        localStorage.setItem('mediaserver_search_history',
            JSON.stringify(getSearchHistory().filter(x => x !== q)));
    } catch (e) { }
    smRender();
}
function clearSearchHistory() {
    try { localStorage.removeItem('mediaserver_search_history'); } catch (e) { }
    smRender();
}

/* ===== Единая блокировка скролла страницы (все модалки) =====
   Раньше каждая модалка делала document.body.style.overflow='hidden':
   - iOS Safari игнорирует overflow:hidden на body и страница тянется пальцем;
   - когда прокручиваемый блок докручен до края, скролл «протекает» на
     страницу (scroll chaining), и сайт уезжает из-под модалки;
   - модалки могли перетирать блокировку друг друга (A открыта, B закрылась —
     страница снова скроллится).
   Решение: единый менеджер со счётчиком. lockPageScroll() вешает на <html>
   класс sm-locked (глушит overflow html+body с !important), фиксирует body
   через position:fixed, сохраняя позицию скролла. unlockPageScroll()
   снимает блокировку только когда закрыта ПОСЛЕДНЯЯ модалка. */
let _pageLockCount = 0;
let _pageLockScrollY = 0;
function lockPageScroll() {
    const html = document.documentElement, body = document.body;
    if (_pageLockCount === 0) {
        _pageLockScrollY = window.scrollY || html.scrollTop || 0;
        html.classList.add('sm-locked');
        body.style.position = 'fixed';
        body.style.top = `-${_pageLockScrollY}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
    }
    _pageLockCount++;
}
function unlockPageScroll() {
    if (_pageLockCount === 0) return;   // ничего не заблокировано — no-op
    _pageLockCount--;
    if (_pageLockCount === 0) {
        const html = document.documentElement, body = document.body;
        html.classList.remove('sm-locked');
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        window.scrollTo(0, _pageLockScrollY);
    }
}
/* поиск использует тот же менеджер (имена оставлены для совместимости) */
function lockPageForSearch() { lockPageScroll(); }
function unlockPageForSearch() { unlockPageScroll(); }

function openSearchModal() {
    const m = $('#searchModal');
    if (!m) return;
    if (!m.classList.contains('hidden')) { $('#smInput')?.focus(); return; } // уже открыт
    smQuery = ''; smResults = []; smSelected = -1;
    const inp = $('#smInput');
    if (inp) inp.value = '';
    $('#smClear')?.classList.add('hidden');
    m.classList.remove('hidden');
    lockPageForSearch();
    smRender();
    if (inp) setTimeout(() => inp.focus(), 60);
}
function closeSearchModal() {
    const m = $('#searchModal');
    if (!m || m.classList.contains('hidden')) return;
    m.classList.add('hidden');
    unlockPageForSearch();
    $('#searchModal .sm-panel')?.classList.remove('is-searching');
}
function smClearInput() {
    const inp = $('#smInput');
    if (inp) inp.value = '';
    smQuery = '';
    smResults = [];
    smSelected = -1;
    $('#smClear')?.classList.add('hidden');
    smRender();
    inp?.focus();
}
function setSmMode(mode) {
    smMode = mode;
    smResults = []; smSelected = -1;
    clearTimeout(smDebounce);
    smReqId++; // отменяем летящие запросы
    $$('.sm-mode').forEach(b => b.classList.toggle('is-active', b.dataset.mode === mode));
    const inp = $('#smInput');
    if (inp) inp.placeholder = mode === 'people' ? 'Поиск актёров, режиссёров…'
        : mode === 'users' ? 'Поиск пользователей…' : 'Поиск фильмов, сериалов, аниме…';
    smRender();
    if (smQuery && inp) inp.focus();
}
function onSmInput(e) {
    smQuery = e.target.value.trim();
    smSelected = -1;
    window._smRetries = 0;
    $('#smClear')?.classList.toggle('hidden', !smQuery);
    clearTimeout(smDebounce);
    if (!smQuery) {
        smResults = [];
        smReqId++; // отменяем летящий запрос
        smRender();
        return;
    }
    smDebounce = setTimeout(smPerform, 250);
}
async function smPerform() {
    const q = smQuery;
    if (!q) return;
    const reqId = ++smReqId;
    $('#searchModal .sm-panel')?.classList.add('is-searching');

    // сброс + лоадер
    smResults = [];
    smSelected = -1;
    const host = $('#smResults');
    const emptyEl = $('#smEmpty');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (host) host.innerHTML = Array.from({ length: 5 }, () => `
<div class="sm-skel-row">
    <div class="sm-skel-poster skeleton"></div>
    <div class="flex-1 min-w-0 space-y-2">
        <div class="skeleton h-4 w-2/3 rounded-md"></div>
        <div class="skeleton h-3 w-2/5 rounded-md"></div>
        <div class="skeleton h-3 w-1/4 rounded-md"></div>
    </div>
</div>`).join('');

    try {
        let data = [];
        if (smMode === 'people') {
            const res = await fetch('/api/search/persons?q=' + encodeURIComponent(q));
            if (res.ok) data = await res.json();
        } else if (smMode === 'users') {
            data = []; // бекенда пока нет
        } else {
            const res = await fetch('/api/search/global?q=' + encodeURIComponent(q));
            if (res.ok) data = await res.json();
        }
        // устаревший запрос — выходим, рисует более новый
        if (reqId !== smReqId) return;
        smResults = Array.isArray(data) ? data : [];
    } catch (e) {
        if (reqId !== smReqId) return;
        smResults = [];
    }
    if (reqId === smReqId) {
        if (!smResults.length && smMode === 'titles' && (window._smRetries || 0) < 3) {
            window._smRetries = (window._smRetries || 0) + 1;
            $('#smResults').innerHTML = `<div class="sm-empty"><span class="loader-spin loader-spin-sm" style="margin:0 auto 12px"></span><p class="sm-empty-sub">Ищем «${escapeHtml(q)}» во внешних источниках…</p></div>`;
            setTimeout(() => { if (smQuery === q && reqId === smReqId) smPerform(); }, 2200);
            return;   // обводку не снимаем: поиск продолжается
        }
        $('#searchModal .sm-panel')?.classList.remove('is-searching');
        if (smResults.length) pushSearchHistory(q);
        smRender();
    }
}
/* подсветка совпадений в тексте результата поиска;
   q можно передать явно (выпадающий поиск шапки), иначе берётся smQuery */
function smMarkText(text, q) {
    q = (q === undefined ? smQuery : q) || '';
    const safe = escapeHtml(text);
    if (!q) return safe;
    try {
        const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        return safe.replace(re, '<mark class="sm-hit">$1</mark>');
    } catch (e) { return safe; }
}
/* счётчик найденного в футере модалки (элемент создаётся лениво) */
function smUpdateCount(n) {
    const foot = $('#searchModal .sm-foot');
    if (!foot) return;
    let el = $('#smCount');
    if (!el) {
        el = document.createElement('span');
        el.id = 'smCount';
        el.className = 'sm-count';
        foot.appendChild(el);
    }
    el.textContent = n > 0 ? `Найдено: ${n}` : '';
}
function smRender() {
    const host = $('#smResults'), empty = $('#smEmpty');
    if (!host || !empty) return;

    // пустой запрос — недавние запросы, если есть; иначе подсказка
    if (!smQuery) {
        smUpdateCount(0);
        const hist = getSearchHistory();
        if (hist.length) {
            window._smHist = hist;
            host.innerHTML = `
<div class="px-3 pt-2 pb-1 text-[10px] font-display uppercase tracking-widest text-faint">Недавние запросы</div>
 ${hist.map((q, i) => `
<button type="button" class="sm-hist-row" onclick="smUseHistory(${i})">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <span class="flex-1 min-w-0 truncate">${escapeHtml(q)}</span>
    <span class="sm-hist-x" role="button" onclick="event.stopPropagation(); removeSearchHistory(${i})" aria-label="Убрать из истории">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </span>
</button>`).join('')}
<button type="button" class="sm-hist-clear" onclick="clearSearchHistory()">Очистить историю</button>`;
            empty.classList.add('hidden');
        } else {
            host.innerHTML = '';
            empty.classList.remove('hidden');
        }
        return;
    }
    empty.classList.add('hidden');

    // фильтруем мусор (пустые карточки)
    const clean = smResults.filter(x => x && (x.title || x.nameRu || x.nameEn || x.username));
    if (!clean.length) {
        smUpdateCount(0);
        host.innerHTML = `<div class="sm-empty">
            <p class="sm-empty-title">${smMode === 'users' ? 'Поиск пользователей скоро появится' : 'Ничего не найдено'}</p>
            <p class="sm-empty-sub">${smMode === 'users' ? 'Нужен серверный эндпоинт — добавим позже' : 'Попробуйте изменить запрос'}</p>
        </div>`;
        return;
    }

    smUpdateCount(clean.length);
    host.innerHTML = clean.slice(0, 12).map((x, idx) =>
        smMode === 'people' ? smPersonCard(x, idx) : smTitleCard(x, idx)
    ).join('');
}
function smTitleCard(it, idx) {
    const key = registerItem(it);
    const rate = Number(it.rating_kp || it.rating_imdb || it.rating_tmdb);
    const genres = (it.genres || []).slice(0, 2)
        .map(g => typeof g === 'string' ? g : (g.genre || g.name || '')).filter(Boolean)
        .map(g => `<span class="sm-pill">${escapeHtml(g)}</span>`).join('');
    return `
    <a data-idx="${idx}" href="${escapeAttr(titleHref(it))}"
       onclick="smOpenTitle(event, '${escapeAttr(key)}')"
       class="sm-result card-focusable">
      <span class="sm-poster"><img src="${img(it.poster) || placeholderSvg(128, 192)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(128,192)"></span>
      <span class="sm-body">
        <span class="sm-title">${smMarkText(it.title)}</span>
        ${it.original_title && it.original_title !== it.title ? `<span class="sm-sub">${smMarkText(it.original_title)}</span>` : ''}
        <span class="sm-pills">
          ${Number.isFinite(rate) && rate > 0 ? `<span class="sm-pill sm-pill--rate">★ ${rate.toFixed(1)}</span>` : ''}
          ${it.year ? `<span class="sm-pill">${escapeHtml(it.year)}</span>` : ''}
          ${it.type ? `<span class="sm-pill">${escapeHtml(it.type)}</span>` : ''}
          ${genres}
        </span>
      </span>
      <span class="sm-open">Открыть →</span>
    </a>`;
}
function smPersonCard(p, idx) {
    return `
    <a data-idx="${idx}" href="/actor/${p.staffId}"
       onclick="smOpenPerson(event, ${p.staffId})"
       class="sm-result card-focusable">
      <img class="sm-photo" src="${img(p.posterUrl) || placeholderSvg(96, 96)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(96,96)">
      <span class="sm-body">
        <span class="sm-title">${smMarkText(p.nameRu || p.nameEn || '')}</span>
        <span class="sm-sub">${escapeHtml(p.profession || 'Персона')}</span>
      </span>
      <span class="sm-open">Открыть →</span>
    </a>`;
}
function smOpenTitle(ev, key) {
    ev.preventDefault();
    closeSearchModal();
    navigateToTitle(key);
    return false;
}
function smOpenPerson(ev, staffId) {
    ev.preventDefault();
    closeSearchModal();
    openStaffPage(staffId);
    return false;
}
function smHighlight() {
    $$('#smResults .sm-result').forEach(el => el.classList.toggle('is-selected', Number(el.dataset.idx) === smSelected));
    const sel = $('#smResults .sm-result.is-selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
}
function smKeydown(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        setSmMode(SM_ORDER[(SM_ORDER.indexOf(smMode) + 1) % SM_ORDER.length]);
        return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!smResults.length) return;
        const len = Math.min(smResults.length, 12);
        smSelected = e.key === 'ArrowDown'
            ? (smSelected + 1) % len
            : (smSelected - 1 + len) % len;
        smHighlight();
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        if (smSelected >= 0) {
            const el = $(`#smResults .sm-result[data-idx="${smSelected}"]`);
            if (el) { el.click(); return; }
        }
        // без выделения — показать все результаты на странице поиска
        if (smQuery) { closeSearchModal(); showAllSearchResults(smQuery); }
    }
}

async function loadPersonsGrid(q) {
    const host = $('#personsGrid'); if (!host) return;
    host.classList.add('hidden'); host.innerHTML = '';
    try {
        const res = await fetch('/api/search/persons?q=' + encodeURIComponent(q));
        if (!res.ok) return;
        const persons = await res.json();
        if (!Array.isArray(persons) || !persons.length) return;
        host.innerHTML = `
    <div class="flex items-center gap-2.5 mb-3 px-0.5">
        <span class="marquee-rule" style="width:22px"></span>
        <h3 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Люди</h3>
        <span class="text-xs text-faint">${persons.length}</span>
    </div>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        ${persons.map(p => `
        <a href="/actor/${p.staffId}" onclick="event.preventDefault(); openStaffPage(${p.staffId}); return false;"
           class="person-grid-card card-focusable">
            <span class="person-grid-poster">
                <img src="${img(p.posterUrl) || placeholderSvg(200, 300)}" alt="" loading="lazy"
                     onerror="this.onerror=null;this.src=placeholderSvg(200,300)">
            </span>
            <span class="person-grid-name">${escapeHtml(p.nameRu || p.nameEn || '')}</span>
            <span class="person-grid-sub">${escapeHtml(p.profession || '')}</span>
        </a>`).join('')}
    </div>`;
        host.classList.remove('hidden');
    } catch (e) { /* тихо */ }
}

let personsReqId = 0;
async function fetchPersonsForSearch(q, alone) {
    const reqId = ++personsReqId;
    try {
        const res = await fetch(`/api/search/persons?q=${encodeURIComponent(q)}`);
        if (reqId !== personsReqId || !res.ok) return;
        const persons = await res.json();
        const host = $('#searchPersons');
        if (reqId !== personsReqId || !host) return;
        if (currentGridType === 'search' || $('#searchInput').value.trim() !== q) return;
        if (!Array.isArray(persons) || !persons.length) {
            if (alone) host.innerHTML = `<div class="text-muted text-sm px-3 py-4">Ничего не найдено по запросу «${escapeHtml(q)}».</div>`;
            return;
        }
        host.innerHTML = `
<div class="px-3 pt-2 pb-1 text-[10px] font-display uppercase tracking-widest text-faint">Люди</div>
${persons.slice(0, 4).map(p => `
<a role="option" href="/actor/${p.staffId}" class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-left transition"
onclick="hideSearchDropdown(); openStaffPage(${p.staffId}); return false;">
<img src="${img(p.posterUrl) || placeholderSvg(80, 120)}" class="w-11 h-16 object-cover rounded-lg bg-surface2 shrink-0" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(80,120)">
<span class="min-w-0 flex-1">
<span class="block text-sm font-medium text-ink line-clamp-1">${smMarkText(p.nameRu || p.nameEn || '', q)}</span>
<span class="block text-xs text-faint mt-0.5">${escapeHtml(p.profession || 'Персона')}</span>
</span>
<span class="shrink-0 text-faint">${icon('chevronRight')}</span>
</a>`).join('')}`;
    } catch (e) { /* тихо */ }
}

/* ============================================================
   КАТАЛОГ
   ============================================================ */
const CATALOG_PAGE_SIZE = 60;
let catalogReqId = 0;
let catalogBusy = false;
let catalogPage = 0;
let catalogTotal = 0;
let catalogCapped = false;

/* --- мультивыбор жанров: поповер в стиле animeon + чипы --- */
const CATALOG_GENRES = ['Боевик', 'Приключения', 'Комедия', 'Криминал', 'Документальный', 'Драма',
    'Семейный', 'Фэнтези', 'История', 'Ужасы', 'Детектив', 'Мелодрама', 'Триллер', 'Военный',
    'Вестерн', 'Фантастика', 'Мультфильм', 'Аниме', 'Спорт', 'Музыка', 'Детский'];

function buildGenreList() {
    $('#cfGenreList').innerHTML = CATALOG_GENRES.map(g => `
        <button type="button" class="cat-gbtn${catalogGenres.has(g) ? ' is-on' : ''}" data-genre="${escapeAttr(g)}"
            aria-pressed="${catalogGenres.has(g) ? 'true' : 'false'}" onclick="toggleCatalogGenre('${escapeAttr(g)}')">
            <span>${escapeHtml(g)}</span>
            <svg class="gchk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>`).join('');
}

function filterGenreList(q) {
    let visible = 0;
    $$('#cfGenreList .cat-gbtn').forEach(b => {
        const show = !q || b.dataset.genre.toLowerCase().includes(q);
        b.classList.toggle('hidden', !show);
        if (show) visible++;
    });
    $('#cfGenreEmpty')?.classList.toggle('hidden', visible > 0);
}

function toggleCatalogGenre(g) {
    if (catalogGenres.has(g)) catalogGenres.delete(g); else catalogGenres.add(g);
    renderGenreUI();
    applyCatalogFilters();
}

function renderGenreUI() {
    const n = catalogGenres.size;
    $('#cfGenreLabel').textContent = n ? `жанры: ${n}` : 'Все жанры';
    $$('#cfGenreList .cat-gbtn').forEach(b => {
        const on = catalogGenres.has(b.dataset.genre);
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
    });
    $('#cfGenreReset')?.toggleAttribute('disabled', n === 0);
    $('#cfGenreChips').innerHTML = Array.from(catalogGenres).map(g => `
        <button type="button" onclick="removeGenre('${escapeAttr(g)}')" title="Убрать «${escapeAttr(g)}»"
            class="flex items-center gap-1 bg-marquee/15 border border-marquee/40 text-[#c4b5fd] text-[11px] font-semibold px-2.5 h-7 rounded-lg hover:bg-marquee/25 transition">
            ${escapeHtml(g)}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>`).join('');
    $('#cfGenreChips').classList.toggle('hidden', n === 0);
}

function toggleGenrePanel() {
    const p = $('#cfGenrePanel');
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden')) {
        const s = $('#cfGenreSearch');
        if (s) { s.value = ''; filterGenreList(''); setTimeout(() => s.focus(), 60); }
    }
}

function removeGenre(g) {
    catalogGenres.delete(g);
    renderGenreUI();
    applyCatalogFilters();
}

function _clearGenreSelections() {
    catalogGenres.clear();
    renderGenreUI();
}

function clearGenres() { _clearGenreSelections(); applyCatalogFilters(); }

/* ============================================================
   КАСТОМНЫЕ ДРОПДАУНЫ В СТИЛЕ САЙТА (замена нативных select)
   <select> остаются в разметке скрытыми и хранят значение:
   весь код, читающий .value или слушающий 'change',
   продолжает работать без изменений.
   ============================================================ */
const DD_CHEVRON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none;opacity:.5;transition:transform .18s ease"><polyline points="6 9 12 15 18 9"/></svg>';
const DD_CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><polyline points="20 6 9 17 4 12"/></svg>';
const customSelects = {};

function stylizeSelect(id) {
    const sel = document.getElementById(id);
    if (!sel) return;
    document.getElementById(id + 'Wrap')?.remove();
    delete customSelects[id];

    const wrap = document.createElement('div');
    wrap.className = 'relative';
    wrap.id = id + 'Wrap';
    sel.insertAdjacentElement('afterend', wrap);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'field-dark h-9 rounded-lg px-2.5 text-xs focus:outline-none flex items-center justify-between gap-1.5 min-w-[116px] max-w-[280px]';
    btn.innerHTML = '<span class="truncate"></span>' + DD_CHEVRON;
    const labelEl = btn.firstElementChild;

    const panel = document.createElement('div');
    panel.className = 'hidden absolute z-30 left-0 mt-1 w-max min-w-full max-w-[290px] modal-panel rounded-xl p-1.5 shadow-pop';
    const list = document.createElement('div');
    list.className = 'grid gap-0.5';
    panel.appendChild(list);
    wrap.appendChild(btn);
    wrap.appendChild(panel);

    const sync = () => {
        const o = sel.options[sel.selectedIndex];
        labelEl.textContent = o ? o.textContent : '';
    };
    const setOpen = (open) => {
        panel.classList.toggle('hidden', !open);
        const svg = btn.querySelector('svg');
        if (svg) svg.style.transform = open ? 'rotate(180deg)' : '';
    };
    const renderList = () => {
        list.innerHTML = Array.from(sel.options).map(o => {
            const active = o.value === sel.value;
            return `
            <button type="button" data-v="${escapeAttr(o.value)}" title="${escapeAttr(o.textContent)}"
                class="flex items-center justify-between gap-2 px-2.5 h-8 rounded-lg text-xs cursor-pointer select-none transition ${active ? 'bg-marquee/15 text-[#c4b5fd]' : 'text-muted hover:bg-white/5'}">
                <span class="truncate">${escapeHtml(o.textContent)}</span>
                ${active ? DD_CHECK : ''}
            </button>`;
        }).join('');
    };

    btn.addEventListener('click', () => {
        const willOpen = panel.classList.contains('hidden');
        if (willOpen) renderList();
        setOpen(willOpen);
    });
    list.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) return;
        sel.value = b.dataset.v;
        sync();
        setOpen(false);
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });

    customSelects[id] = { wrap, panel, setOpen, sync };
    sync();
    sel.classList.add('hidden');
}

function initCustomSelects() {
    ['cfRating', 'cfSort', 'rfRating'].forEach(stylizeSelect);
}
function syncCustomSelects() { Object.values(customSelects).forEach(x => x.sync()); }

/* закрытие дропдаунов по клику вне них */
document.addEventListener('click', (e) => {
    if (e.target instanceof Node) {
        const opened = e.target.closest('details.ws-openable');
        document.querySelectorAll('details.ws-openable[open]').forEach(dd => {
            if (dd !== opened) dd.removeAttribute('open');
        });
    }
    if (!(e.target instanceof Node)) return;
    Object.values(customSelects).forEach(x => {
        if (!x.panel.classList.contains('hidden') && !x.wrap.contains(e.target)) x.setOpen(false);
    });
});

function openCatalog(fromRouter) {
    stopSearchUpdates();
    currentGridType = 'catalog';
    leaveTitleIfNeeded('catalog');
    pushRoute('/catalog');
    closeDrawer();
    clearSearch();
    $('#homeView').classList.add('hidden');
    $('#staffView')?.classList.add('hidden');
    $('#profileView')?.classList.add('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#personsGrid')?.classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#gridView').classList.remove('hidden');
    $('#catalogFilters').classList.remove('hidden');
    $('#catalogWrap')?.classList.add('is-catalog');
    $('#cfToggleRow')?.classList.remove('hidden');
    syncCatalogFiltersBtn();   // стрелка/aria кнопки «Фильтры» соответствуют состоянию панели
    $('#listView')?.classList.add('hidden');
    setActiveNav('catalog');
    $('#gridTitle').textContent = 'Каталог';
    setGridHeadIcon('catalog');
    catalogReadUrl();
    const crumb = $('#gridCrumb');
    if (crumb) crumb.innerHTML = '<a href="/" onclick="goHome();return false;">Главная</a><span class="sep">/</span><b>Каталог</b>';
    applyCatalogFilters();
    if (!fromRouter) window.scrollTo(0, 0);
}

/* ===== Мобильная кнопка «Фильтры» в каталоге =====
   На экранах <1024px панель #catalogFilters свёрнута, класс .open её
   разворачивает. Кнопка #cfToggleBtn («Фильтры») переключает панель и
   синхронизирует aria-expanded и стрелку-шеврон. На десктопе (>=1024px)
   панель всегда видна — клик только приводит aria в порядок. */
function toggleCatalogFilters() {
    const panel = $('#catalogFilters');
    const btn = $('#cfToggleBtn');
    if (!panel || !btn) return;
    if (window.matchMedia && matchMedia('(min-width: 1024px)').matches) {
        btn.setAttribute('aria-expanded', 'true');
        return;
    }
    const willOpen = !panel.classList.contains('open');
    panel.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
}

function syncCatalogFiltersBtn() {
    const panel = $('#catalogFilters');
    const btn = $('#cfToggleBtn');
    if (!panel || !btn) return;
    const desktop = window.matchMedia && matchMedia('(min-width: 1024px)').matches;
    btn.setAttribute('aria-expanded', desktop ? 'true' : String(panel.classList.contains('open')));
}

function catalogFiltersState() {
    return {
        q: ($('#cfQuery').value || '').trim(),
        type: ($('#cfTypes button.is-active') || {}).dataset?.ct || '',
        y1: parseInt($('#cfYear1').value, 10) || 0,
        y2: parseInt($('#cfYear2').value, 10) || 0,
        rating: parseFloat($('#cfRating').value) || 0,
        genre: Array.from(catalogGenres).join(','),
        sort: $('#cfSort').value || 'pop',
        rich: $('#cfRich').checked,
    };
}

async function loadCatalogPage(page, reset) {
    const reqId = ++catalogReqId;
    const f = catalogFiltersState();
    if (reset) {
        $('#gridEmpty').classList.add('hidden');
        const gridEl = $('#gridGrid');
        if (gridEl.children.length) {
            // старые карточки остаются на месте до прихода новых: сетка лишь
            // приглушается, высота страницы не схлопывается — скролл не прыгает
            gridEl.classList.add('is-loading');
        } else {
            $('#gridLoading').innerHTML = gridSkeletonHTML(6);
            $('#gridLoading').classList.remove('hidden');
        }
        $('#gridSubtitle').textContent = 'Загрузка…';
    }
    try {
        const p = new URLSearchParams({ page: String(page), page_size: String(CATALOG_PAGE_SIZE), sort: f.sort || 'pop' });
        if (f.q) p.set('q', f.q);
        if (f.type) p.set('type', f.type);
        if (f.y1) p.set('year_from', f.y1);
        if (f.y2) p.set('year_to', f.y2);
        if (f.rating) p.set('rating', f.rating);
        if (f.genre) p.set('genre', f.genre);
        if (f.rich) p.set('rich', '1');
        const res = await fetch('/api/catalog/browse?' + p.toString());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const d = await res.json();
        if (reqId !== catalogReqId) return;      // пришёл более свежий запрос — рисует он
        $('#gridLoading').classList.add('hidden');
        $('#gridGrid').classList.remove('is-loading');
        const items = d.items || [];
        catalogPage = d.page || page;
        catalogTotal = d.total || 0;
        catalogCapped = !!d.total_capped;
        if (items.length) {
            $('#gridGrid').innerHTML = items.map(it => renderCard(it)).join('');
        } else if (reset) {
            $('#gridEmptyText').textContent = 'По этим фильтрам ничего не нашлось — ослабь условия.';
            $('#gridEmpty').classList.remove('hidden');
        }
        $('#gridSubtitle').textContent = `найдено ${catalogTotal.toLocaleString('ru-RU')}${catalogCapped ? '+' : ''}`;
        // блок переключения страниц (вместо «Показать ещё»)
        renderPagination($('#catalogMoreWrap'), {
            page: catalogPage,
            total: catalogTotal,
            per: CATALOG_PAGE_SIZE,
            capped: catalogCapped,
            go: 'gotoCatalogPage',
        });
        // смена фильтров (страница 1): если проскроллены ниже результатов —
        // мягко поднимаем к их началу, как на animeon
        if (reset && page === 1) {
            const anchor = $('#gridTitle') || $('#gridView');
            if (anchor) {
                const top = anchor.getBoundingClientRect().top + window.scrollY - 84;
                if (window.scrollY > top + 120) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            }
        }
    } catch (e) {
        if (reqId === catalogReqId) {
            $('#gridLoading').classList.add('hidden');
            $('#gridGrid').classList.remove('is-loading');
            $('#gridSubtitle').textContent = 'Ошибка загрузки — попробуй ещё раз.';
        }
    }
}

function catalogSyncUrl() {
    const f = catalogFiltersState();
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.type) p.set('type', f.type);
    if (f.y1) p.set('year_from', f.y1);
    if (f.y2) p.set('year_to', f.y2);
    if (f.rating) p.set('rating', f.rating);
    if (f.genre) p.set('genre', f.genre);
    if (f.rich) p.set('rich', '1');
    if (f.sort && f.sort !== 'pop') p.set('sort', f.sort);
    const qs = p.toString();
    history.replaceState({}, '', '/catalog' + (qs ? '?' + qs : ''));
}

function catalogReadUrl() {
    const q = new URLSearchParams(location.search);
    if (![...q.keys()].length) return;
    if (q.get('q')) $('#cfQuery').value = q.get('q');
    const type = q.get('type') || '';
    $$('#cfTypes button[data-ct]').forEach(b => b.classList.toggle('is-active', b.dataset.ct === type));
    if (q.get('year_from')) $('#cfYear1').value = q.get('year_from');
    if (q.get('year_to')) $('#cfYear2').value = q.get('year_to');
    if (q.get('rating')) $('#cfRating').value = q.get('rating');
    if (q.get('sort')) $('#cfSort').value = q.get('sort');
    $('#cfRich').checked = q.get('rich') === '1';
    catalogGenres = new Set((q.get('genre') || '').split(',').filter(Boolean));
    buildGenreList();
    $$('#cfGenreList input[type=checkbox]').forEach(cb => cb.checked = catalogGenres.has(cb.value));
    renderGenreUI();
    syncCustomSelects();
}

function applyCatalogFilters() {
    catalogSyncUrl();
    loadCatalogPage(1, true);
}
function gotoCatalogPage(n) {
    const anchor = $('#gridTitle') || $('#gridView');
    if (anchor) window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 84), behavior: 'smooth' });
    loadCatalogPage(Math.max(1, Number(n) || 1), true);
}
function loadCatalogMore() { loadCatalogPage(catalogPage + 1, false); }
function resetCatalogFilters() {
    $('#cfQuery').value = '';
    $$('#cfTypes button[data-ct]').forEach(b => b.classList.toggle('is-active', b.dataset.ct === ''));
    $('#cfYear1').value = '';
    $('#cfYear2').value = '';
    $('#cfRating').value = '0';
    $('#cfSort').value = 'pop';
    $('#cfRich').checked = false;
    syncCustomSelects();
    _clearGenreSelections();
    applyCatalogFilters();
}

/* ============================================================
   TITLE PAGE CONTENT
   ============================================================ */
function rememberRecentlyViewed(it) {
    if (!it || !it.title) return;
    const newKeys = new Set(itemKeys(it));
    recentlyViewed = recentlyViewed.filter(x => !itemKeys(x).some(k => newKeys.has(k)));
    recentlyViewed.unshift({ ...it, historyUpdatedAt: Date.now() });
    recentlyViewed = recentlyViewed.slice(0, 50);
    saveRecent();
    updateSidebarCounts();
    sendAccountAction('history_add', { key: itemKey(it), item: it });
}

async function openTitleModal(it) {
    const reqId = ++titlePageRequestId;
    currentItem = JSON.parse(JSON.stringify(it));
    destroyPlayer();
    showTitleView();
    $('#titleModalBody').innerHTML = titleSkeletonHTML();

    rememberRecentlyViewed(currentItem);
    let srcs = currentItem.sources || {};

    // @@:PLAYERS-RESOLVE — карточки из расписания приходят только с anilibria:
    // докладываем kodik и kinopoiskId через resolve-sources (кэш 12ч на сервере)
    const hasKodik = !!(srcs.kodik && srcs.kodik.link);
    const hasAnilibria = !!(srcs.anilibria && (srcs.anilibria.alias || srcs.anilibria.id));
    const hasKinobox = !!(srcs.kinobox && srcs.kinobox.kinopoiskId);
    if (!hasKodik && (hasAnilibria || !hasKinobox)) {
        const resolved = await fetchPlayableSources(currentItem);
        if (reqId !== titlePageRequestId) return;
        if (resolved) {
            // мердж: существующие источники приоритетнее (anilibria-alias из
            // расписания точнее найденного поиском), kinobox:true уступает объекту с id
            const merged = { ...(resolved.sources || {}) };
            for (const [k, v] of Object.entries(srcs)) {
                if (!v) continue;
                if (k === 'kinobox' && v === true && merged.kinobox && merged.kinobox.kinopoiskId) continue;
                merged[k] = v;
            }
            if (resolved.kinopoiskId && !currentItem.kinopoiskId) {
                currentItem.kinopoiskId = resolved.kinopoiskId;
                currentItem.kinopoiskIdTrusted = !!resolved.kinopoiskIdTrusted;
            }
            currentItem.sources = merged;
            srcs = merged;
        }
    }
    rememberRecentlyViewed(currentItem);

    // kinobox без id: строгий резолв по названию (сервер теперь сверяет имена,
    // неподтверждённый kinobox НЕ показываем — иначе в плеере будет чужой тайтл)
    if (srcs.kinobox === true || (srcs.kinobox && !srcs.kinobox.kinopoiskId && !currentItem.kinopoiskIdTrusted)) {
        const resolvedId = await resolveKinopoiskId(currentItem.title, currentItem.year, currentItem.type);
        if (reqId !== titlePageRequestId) return;
        if (resolvedId) { currentItem.kinopoiskId = resolvedId; srcs.kinobox = { kinopoiskId: resolvedId }; }
        else if (srcs.kinobox === true) delete srcs.kinobox;
    }

    if (currentItem.kinopoiskId && /^\/t\//.test(location.pathname)) {
        try { history.replaceState({ t: itemKey(currentItem) }, '', titleHref(currentItem)); } catch (e) { }
    }

    /* Список источников для кнопки-дропдауна (как у animeon):
       свои (kodik/anilibria из резолва) + плееры Kinobox API
       (veoveo/alloha/turbo/collaps...), недоступные — серыми. */
    const playerButtons = [];
    if (srcs.kinobox) playerButtons.push({ key: 'kinobox', label: 'Kinobox', icon: 'clapper' });
    if (srcs.kodik) playerButtons.push({ key: 'kodik', label: 'Kodik', icon: 'layers' });
    if (srcs.anilibria) playerButtons.push({ key: 'anilibria', label: 'Anilibria', icon: 'sparkles' });
    currentPlayerButtons = playerButtons;

    if (reqId !== titlePageRequestId) return;
    renderTitleModalBody(currentItem, playerButtons);

    initPlayerSources(reqId);

    // @@:NO-KP — тайтла нет в Кинопоиске: никаких «Данные недоступны»,
    // показываем факты из наших данных и прячем пустые секции
    if (currentItem.kinopoiskId) {
        loadKpExtra(currentItem.kinopoiskId);
    } else {
        const t = currentItem;
        const rows = [];
        if (t.year) rows.push(['Год выпуска', String(t.year)]);
        if (t.type) rows.push(['Тип', String(t.type)]);
        const gg = uniqueGenres(t.genres || []).join(', ');
        if (gg) rows.push(['Жанр', gg]);
        if (Number(t.episodes_total) > 0) rows.push(['Всего серий', String(t.episodes_total)]);
        if (t.publish_day) rows.push(['Выходит', String(t.publish_day) + (t.publish_time ? ' · ' + t.publish_time : '')]);
        if (Number(t.episode) > 0) rows.push(['Вышла серия', String(t.episode)]);
        const fb = $('#kpFacts');
        if (fb) fb.innerHTML = rows.length ? `
<h3 class="tp-h">${icon('info')}О тайтле</h3>
<dl class="space-y-2.5 text-[13px]">${rows.map(r => `<div class="flex gap-3"><dt class="text-faint shrink-0 w-[136px]">${r[0]}</dt><dd class="text-muted min-w-0 flex-1">${escapeHtml(r[1])}</dd></div>`).join('')}</dl>` : '';
        $('#kpStaff')?.classList.add('hidden');
        $('#kpTrailer')?.classList.add('hidden');
        const qb = $('#kpQuote'); if (qb) qb.classList.add('hidden');
    }
}

const WS_ICONS = {
    watching: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>',
    planned: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>',
    watched: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    dropped: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    onhold: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>',
    none: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
};
const WS_META = {
    watching: { label: 'Смотрю', cls: 'ws-ic-green' },
    planned: { label: 'Запланировано', cls: 'ws-ic-blue' },
    watched: { label: 'Просмотрено', cls: 'ws-ic-purple' },
    dropped: { label: 'Брошено', cls: 'ws-ic-red' },
    onhold: { label: 'Отложено', cls: 'ws-ic-amber' },
};

function scrollToPlayer() {
    $('#playerSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function titleRatingPillsHtml(it) {
    const kp = Number(it.rating_kp), imdb = Number(it.rating_imdb), tmdb = Number(it.rating_tmdb);
    let out = '';
    if (Number.isFinite(kp) && kp > 0) out += `<span class="meta-pill meta-pill--rating">${icon('star')} ${kp.toFixed(2)}</span>`;
    if (Number.isFinite(imdb) && imdb > 0) out += `<span class="meta-pill">IMDb ${imdb.toFixed(1)}</span>`;
    if (Number.isFinite(tmdb) && tmdb > 0) out += `<span class="meta-pill">TMDB ${tmdb.toFixed(1)}</span>`;
    return out;
}
function renderGenreChips(it) {
    it = it || currentItem;
    const gbox = $('#genresBox'); if (!gbox) return;
    gbox.innerHTML = uniqueGenres((it && it.genres) || []).map(g => {
        const name = typeof g === 'string' ? g : (g.genre || g.name || '');
        return name ? `<span class="genre-chip">${escapeHtml(name)}</span>` : '';
    }).join('');
}

function renderTitleModalBody(it, playerButtons) {
    const isAnime = /аним/i.test(String(it.type || ''));
    const desc = it.description || 'Описание отсутствует.';
    const longDesc = (it.description || '').length > 380;

    $('#titleModalBody').innerHTML = `
<div class="tp-wrap">
<div class="tp-grid">

<!-- ЛЕВАЯ КОЛОНКА -->
<aside>
<div class="tp-sticky">
  <div class="tp-poster">
    <img src="${img(it.poster) || placeholderSvg(300, 450)}" alt="${escapeAttr(it.title)}"
         onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
  </div>

  <div class="flex flex-col gap-2.5">
    <button type="button" onclick="scrollToPlayer()" class="tp-watch">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
      Смотреть
    </button>

    <div class="grid grid-cols-2 gap-2">
        <details class="relative ws-openable">
          <summary id="wsBtn" class="tp-btn ws-dd-summary">
            <span id="wsBtnIc" class="ws-status-ic ws-ic-slate">${WS_ICONS.none}</span>
            <span id="wsBtnLabel" class="truncate">В список</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;flex:none"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="ws-dd">
            <button type="button" class="ws-item watch-toggle-btn" data-status="watching" onclick="setWatchStatus('watching'); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-green">${WS_ICONS.watching}</span> Смотрю</button>
            <button type="button" class="ws-item watch-toggle-btn" data-status="planned" onclick="setWatchStatus('planned'); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-blue">${WS_ICONS.planned}</span> Запланировано</button>
            <button type="button" class="ws-item watch-toggle-btn" data-status="watched" onclick="setWatchStatus('watched'); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-purple">${WS_ICONS.watched}</span> Просмотрено</button>
            <button type="button" class="ws-item watch-toggle-btn" data-status="dropped" onclick="setWatchStatus('dropped'); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-red">${WS_ICONS.dropped}</span> Брошено</button>
            <button type="button" class="ws-item watch-toggle-btn" data-status="onhold" onclick="setWatchStatus('onhold'); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-amber">${WS_ICONS.onhold}</span> Отложено</button>
            <div class="ws-sep-row"></div>
            <button type="button" class="ws-item" onclick="clearWatchStatus(); this.closest('details').removeAttribute('open')"><span class="ws-status-ic ws-ic-slate">${WS_ICONS.none}</span> Не распределено</button>
          </div>
        </details>
        <details class="relative ws-openable">
          <summary class="tp-btn ws-dd-summary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
            Поделиться
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;flex:none"><path d="m6 9 6 6 6-6"/></svg>
          </summary>
          <div class="ws-dd">
            <button type="button" class="ws-item" onclick="copyShareLink(); this.closest('details').removeAttribute('open')">
              <span class="share-ic share-ic--copy"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></span>
              Копировать ссылку
            </button>
            <div class="ws-sep-row"></div>
            <button type="button" class="ws-item" onclick="shareSocial('tg'); this.closest('details').removeAttribute('open')">
              <span class="share-ic share-ic--tg"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></span>
              Telegram
            </button>
            <button type="button" class="ws-item" onclick="shareSocial('vk'); this.closest('details').removeAttribute('open')">
              <span class="share-ic share-ic--vk"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13.162 18.994c.609 0 1.016-.69 1.016-1.63 0-1.63 1.292-2.732 3.017-2.732 1.292 0 2.918.79 3.469 1.48.414.535.305 1.853.305 1.853h2.812s-.449-3.187-2.686-5.51c-2.434-2.528-2.322-2.358.918-6.68C23.979 3.751 24.192 3 24.192 3h-2.965c-.659 0-.854.366-1.175.857-2.482 3.839-3.246 3.551-3.734 3.226-.739-.491-.718-2.545-.718-2.68 0-2.881.423-3.697-1.341-4.107-.293-.068-1.002-.116-2.52-.058-2.212.087-2.79.58-2.932.992-.309.893.15.976.497 1.176.586.452.642 1.46.642 3.899 0 .893-.153 1.991-1.686 1.991-2.229 0-4.013-3.956-4.636-5.441-.282-.676-.64-1.255-1.823-1.255H.477s-.343.01-.525.237c-.148.192-.01.566-.01.566s3.848 9.001 8.216 13.522c3.96 4.106 8.351 3.84 8.351 3.84h4.944s.279-.01.43-.166c.151-.155.151-.416.151-.416s-.089-2.545-2.668-2.545z"/></svg></span>
              ВКонтакте
            </button>
          </div>
        </details>
      </div>

    <button id="favBtn" onclick="toggleFavorite()" class="tp-btn">${icon('heart')}<span>В избранное</span></button>
    <button type="button" onclick="openReportModal()" class="tp-btn">${icon('flag')}<span>Сообщить о проблеме</span></button>
  </div>

</aside>

<!-- ПРАВАЯ КОЛОНКА -->
<div class="min-w-0 space-y-6 md:space-y-7">

<div>
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="flex items-center gap-1 text-[11px] sm:text-xs text-zinc-500 overflow-hidden">
      <li class="flex items-center gap-1 shrink-0">
        <a href="/" onclick="goHome();return false;" class="flex items-center gap-1 hover:text-zinc-200 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          Главная
        </a>
      </li>
      <li class="flex items-center gap-1 shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-700"><path d="m9 18 6-6-6-6"/></svg>
        ${isAnime
            ? `<a href="/anime" onclick="openAnime();return false;" class="hover:text-zinc-200 transition-colors">Аниме</a>`
            : `<a href="/catalog" onclick="openCatalog();return false;" class="hover:text-zinc-200 transition-colors">Каталог</a>`}
      </li>
      <li class="flex items-center gap-1 min-w-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-700"><path d="m9 18 6-6-6-6"/></svg>
        <span class="text-zinc-400 truncate max-w-[280px]">${escapeHtml(it.title)}</span>
      </li>
    </ol>
  </nav>

  <h1 class="font-display font-semibold uppercase text-3xl sm:text-4xl md:text-5xl leading-[1.08] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">${escapeHtml(it.title)}</h1>
  ${it.original_title && it.original_title !== it.title ? `<p class="text-base md:text-lg text-zinc-400 font-medium mt-2">${escapeHtml(it.original_title)}</p>` : ''}
</div>

<div class="flex flex-wrap gap-2 items-center">
  <span id="titleRatings" class="flex flex-wrap gap-2 items-center">${titleRatingPillsHtml(it) || '<span class="text-xs text-faint self-center">Рейтинг недоступен</span>'}</span>
  <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
  <span class="meta-pill">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    ${escapeHtml(String(it.year || '—'))}
  </span>
  <span class="meta-pill hidden" id="metaRuntime">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
    <span class="v"></span>
  </span>
  <span class="meta-pill hidden" id="metaEpisodes">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M10 12H3"/><path d="M10 19H3"/><path d="M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z"/></svg>
    <span class="v"></span>
  </span>
  ${it.type ? `<span class="meta-pill meta-pill--type">${escapeHtml(it.type)}</span>` : ''}
</div>

<div id="genresBox" class="flex flex-wrap gap-2"></div>

<div id="titleRate" class="mt-1">
    <div class="flex items-center gap-2">
        <span class="text-[11px] text-faint font-semibold uppercase tracking-wider">Оценка</span>
        <div id="ratingStars" class="flex gap-0.5"></div>
        <span id="ratingLabel" class="text-xs text-faint font-medium">Оценить:</span>
    </div>
</div>

<div class="max-w-none">
  <input type="checkbox" id="desc-toggle" class="hidden" ${longDesc ? '' : 'checked'}>
  <div class="tp-desc">
    <p id="tpDesc" class="text-base md:text-lg leading-relaxed text-zinc-300/90 whitespace-pre-line">${escapeHtml(desc)}</p>
  </div>
  ${longDesc ? `
  <label for="desc-toggle" class="tp-desc-toggle">
    <span class="show">Читать далее</span>
    <span class="hide">Свернуть</span>
    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </label>` : ''}
</div>

<div id="kpQuote" class="tp-quote hidden"></div>

<div id="kpFacts">
  <h3 class="tp-h">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    О тайтле
  </h3>
  <div class="space-y-2">${'<div class="h-3 w-full skeleton rounded"></div>'.repeat(4)}</div>
</div>

<div id="kpTrailer">
    <h3 class="tp-h">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
      Трейлеры
    </h3>
    <div class="row-group relative">
        <div class="trailer-grid">${'<div class="trailer-card skeleton"></div>'.repeat(4)}</div>
      </div>
  </div>

<div id="kpStaff" class="space-y-6 md:space-y-7">
  <div>
    <h3 class="tp-h">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      В главных ролях
    </h3>
    <div class="space-y-2">${'<div class="h-3 w-2/3 skeleton rounded"></div>'.repeat(5)}</div>
  </div>
</div>
</div>
</div>

<!-- ПЛЕЕР -->
<section id="playerSection" class="mt-10 md:mt-14">
<div class="flex items-center gap-2.5 mb-4">
<span class="marquee-rule" style="width:22px"></span>
<h2 class="font-display uppercase text-lg md:text-xl tracking-wide text-ink">Смотреть</h2>
</div>
<div class="player-shell" id="playerShell">
  <div class="player-main">
    <div id="playerContainer" class="player-frame"></div>
    <div class="player-panel">
      <div class="player-src-wrap" id="playerSrcWrap">
        <button type="button" id="playerSrcBtn" class="player-btn btn-primary" onclick="togglePlayerSources()" aria-haspopup="listbox" aria-expanded="false">
          ${icon('clapper')}<span id="playerSrcLabel">Источник</span><svg class="ps-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div id="playerSrcPanel" class="player-src-panel hidden" role="listbox" aria-label="Выбор источника"></div>
      </div>
      <div id="anilibriaControls" class="hidden"></div>
      <div id="playerHint"></div>
    </div>
  </div>
  <aside id="epSidebar" class="player-side" aria-label="Эпизоды">
    <div class="ep-side-head">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M10 12H3"/><path d="M10 19H3"/><path d="M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z"/></svg>
        <span id="epSideTitle">Эпизоды</span> <span class="n" id="epCount"></span>
      </div>
    <div id="epList" class="ep-list"></div>
  </aside>
</div>
</section>

<div class="mt-10 md:mt-14 space-y-10 md:space-y-12">
<div id="sequelsBox"></div>
<div id="similarBox"></div>
</div>
</div>`;

    updateTitleModalActions();
    renderGenreChips(it);
    renderRatingStars();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (playerSrcPanelOpen) { setPlayerSrcOpen(false); return; }
        if ($('#shortcutsModal') && !$('#shortcutsModal').classList.contains('hidden')) { closeShortcutsModal(); return; }
        if (!$('#searchModal').classList.contains('hidden')) { closeSearchModal(); return; }
        if (!$('#searchDropdown').classList.contains('hidden')) { dismissSearchDropdown(); return; }
        if (['topCatMenu', 'acctMenu'].some(id => { const m = $('#' + id); return m && !m.classList.contains('hidden'); })) { closeTopDds(); return; }
        if (!$('#actorsModal').classList.contains('hidden')) { closeActorsModal(); return; }
        if (!$('#legalModal').classList.contains('hidden')) { closeLegalModal(); return; }
        if ($('#lsStatusMenu') && !$('#lsStatusMenu').classList.contains('hidden')) { $('#lsStatusMenu').classList.add('hidden'); return; }
        let ddClosed = false;
        Object.values(customSelects).forEach(x => {
            if (!x.panel.classList.contains('hidden')) { x.setOpen(false); ddClosed = true; }
        });
        const gp = $('#cfGenrePanel');
        if (gp && !gp.classList.contains('hidden')) { gp.classList.add('hidden'); ddClosed = true; }
        if (ddClosed) return;
        if (!$('#randomModal').classList.contains('hidden')) { closeRandomModal(); return; }
        if (!$('#reportModal').classList.contains('hidden')) { closeReportModal(); return; }
        if (!$('#trailerModal').classList.contains('hidden')) { closeTrailerModal(); return; }
        if (!$('#ratingsModal').classList.contains('hidden')) { closeRatingsModal(); return; }
        if (!$('#logoutDialog').classList.contains('hidden')) { closeLogoutDialog(); return; }
        if (!$('#titleView').classList.contains('hidden')) { titleBack(); return; }
        else if (!$('#accountModal').classList.contains('hidden')) closeAccountModal();
        else if ($('#sidebar').classList.contains('open')) closeDrawer();
    }
    if ((e.ctrlKey || e.metaKey) && ['k', 'K', 'л', 'Л'].includes(e.key)) {
        e.preventDefault();
        openSearchModal();
    }
    // «/» — открыть поиск (как на GitHub/YouTube); не мешает вводу в полях
    if (e.key === '/' && !(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
        const t = e.target;
        const typing = t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!typing && $('#searchModal').classList.contains('hidden')) {
            e.preventDefault();
            openSearchModal();
        }
    }
    // «?» — справка по горячим клавишам (Shift+/)
    if (e.key === '?' && !(e.ctrlKey || e.metaKey || e.altKey)) {
        const t = e.target;
        const typing = t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!typing) { e.preventDefault(); toggleShortcutsModal(); }
    }
    // ←/→ — листать слайды hero (когда ничего не открыто и не печатаем)
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !(e.ctrlKey || e.metaKey || e.altKey)) {
        const t = e.target;
        const typing = t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        const modalOpen = ['#searchModal', '#searchDropdown', '#shortcutsModal', '#titleView', '#accountModal',
            '#randomModal', '#reportModal', '#trailerModal', '#ratingsModal', '#actorsModal', '#legalModal', '#logoutDialog']
            .some(id => { const m = $('#' + id); return m && !m.classList.contains('hidden'); })
            || ($('#sidebar') && $('#sidebar').classList.contains('open'));
        if (!typing && !modalOpen && heroSlides.length > 1) {
            e.preventDefault();
            heroStep(e.key === 'ArrowRight' ? 1 : -1);
        }
    }
});

/* ============================================================
   СПРАВКА «ГОРЯЧИЕ КЛАВИШИ» (модалка создаётся динамически,
   шаблон не трогаем). Открывается клавишей ? (Shift+/).
   ============================================================ */
function ensureShortcutsModal() {
    if ($('#shortcutsModal')) return;
    const rows = [
        ['Ctrl / ⌘ + K', 'Открыть поиск'],
        ['/', 'Открыть поиск (быстро)'],
        ['?', 'Показать эту справку'],
        ['← / →', 'Листать слайды на главной'],
        ['↑ / ↓ / Enter', 'Навигация по результатам поиска'],
        ['Esc', 'Закрыть окно / снять выделение'],
    ];
    const el = document.createElement('div');
    el.id = 'shortcutsModal';
    el.className = 'hidden fixed inset-0 z-[96] flex items-center justify-center p-4';
    el.innerHTML = `
<div class="sm-backdrop" onclick="closeShortcutsModal()"></div>
<div class="sc-panel relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-card p-5">
    <div class="flex items-center justify-between mb-4">
        <h3 class="font-display uppercase tracking-wide text-ink text-lg">Горячие клавиши</h3>
        <button class="w-8 h-8 rounded-lg hover:bg-surface2 text-muted hover:text-ink flex items-center justify-center transition-colors" onclick="closeShortcutsModal()" aria-label="Закрыть справку">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>
    <div class="space-y-1">
        ${rows.map(([k, d]) => `
        <div class="flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-surface2/60 transition-colors">
            <span class="text-sm text-muted">${d}</span>
            <kbd class="sc-kbd">${k}</kbd>
        </div>`).join('')}
    </div>
    <p class="mt-3 px-3 text-[11px] leading-relaxed text-faint">Подсказка: сочетания не срабатывают, пока вы печатаете в поле ввода.</p>
</div>`;
    document.body.appendChild(el);
}
function toggleShortcutsModal() {
    const m = $('#shortcutsModal');
    if (m && !m.classList.contains('hidden')) { closeShortcutsModal(); return; }
    ensureShortcutsModal();
    $('#shortcutsModal').classList.remove('hidden');
    lockPageScroll();
}
function closeShortcutsModal() {
    const m = $('#shortcutsModal');
    if (!m || m.classList.contains('hidden')) return;
    m.classList.add('hidden');
    unlockPageScroll();
}

/* ==== Кольцо прогресса скролла на кнопке «Наверх» ==== */
function ensureScrollProgressRing() {
    const btn = $('#scrollTopBtn');
    if (!btn || $('#scrollTopRing')) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'scrollTopRing';
    svg.setAttribute('viewBox', '0 0 44 44');
    svg.setAttribute('aria-hidden', 'true');
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', '22'); c.setAttribute('cy', '22'); c.setAttribute('r', '19');
    svg.appendChild(c);
    btn.appendChild(svg);
    btn.classList.add('has-ring');
    const LEN = 2 * Math.PI * 19;
    c.style.strokeDasharray = String(LEN);
    c.style.strokeDashoffset = String(LEN);
    let ticking = false;
    const update = () => {
        ticking = false;
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        c.style.strokeDashoffset = String(LEN * (1 - p));
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

/* ==== Тултипы из aria-label и состояния стрелок рядов ==== */
function ensureTooltips() {
    const sel = '#scrollTopBtn, .row-head-btn, .hero-arrow';
    document.querySelectorAll(sel).forEach(el => {
        if (el.dataset.tipSet) return;
        el.dataset.tipSet = '1';
        const label = el.getAttribute('aria-label');
        if (label && !el.hasAttribute('data-tip')) el.setAttribute('data-tip', label);
    });
    // самая правая стрелка ряда — тултип влево, чтобы не вылезал за экран
    document.querySelectorAll('.row-head').forEach(h => {
        const fwd = h.querySelector('.row-head-btn:last-child');
        if (fwd) fwd.classList.add('tip-left');
    });
}
function updateRowArrows() {
    document.querySelectorAll('.row-group').forEach(g => {
        const sc = g.querySelector('.row-scroller');
        if (!sc) return;
        const prev = g.querySelector('.row-head-btn:first-child');
        const next = g.querySelector('.row-head-btn:last-child');
        if (!prev || !next) return;
        prev.classList.toggle('is-disabled', sc.scrollLeft <= 4);
        next.classList.toggle('is-disabled', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4);
    });
}

/* плавное проявление постеров: как только <img> загрузился, JS вешает
   класс img-in и картинка мягко проявляется (стили в конце app.css).
   Слушатель на capture, т.к. load не всплывает. */
document.addEventListener('load', (e) => {
    const t = e.target;
    if (t instanceof HTMLImageElement &&
        (t.classList.contains('poster-img') || t.classList.contains('sm-photo') ||
         t.closest('.sm-poster') || t.closest('.person-grid-poster'))) {
        t.classList.add('img-in');
    }
}, true);

/* шапка: класс is-scrolled даёт тень и более плотный фон над контентом */
(() => {
    const hdr = document.querySelector('.app-header');
    if (!hdr) return;
    let ticking = false;
    const update = () => {
        ticking = false;
        hdr.classList.toggle('is-scrolled', (window.scrollY || 0) > 8);
    };
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });
    update();
})();

function updateTitleModalActions() {
    const f = $('#favBtn');
    if (!f || !currentItem) return;
    const fav = isInLibrary('favorites', currentItem);
    f.classList.toggle('is-active', fav);
    f.querySelector('span').textContent = fav ? 'В избранном' : 'В избранное';
    $$('.watch-toggle-btn[data-status]').forEach(b => {
        b.classList.toggle('is-active', isInLibrary(b.dataset.status, currentItem));
    });
    const wsIc = $('#wsBtnIc'), wsLbl = $('#wsBtnLabel');
    if (wsIc && wsLbl) {
        const active = Object.keys(WS_META).find(t => isInLibrary(t, currentItem));
        if (active) {
            wsIc.className = 'ws-status-ic ' + WS_META[active].cls;
            wsIc.innerHTML = WS_ICONS[active];
            wsLbl.textContent = WS_META[active].label;
        } else {
            wsIc.className = 'ws-status-ic ws-ic-slate';
            wsIc.innerHTML = WS_ICONS.none;
            wsLbl.textContent = 'В список';
        }
    }
}
function setLibraryStatus(type, it) {
    if (!it) return;
    const key = itemKey(it), now = Date.now();
    if (!libraryState[type]) libraryState[type] = {};
    const enable = !libraryState[type][key];
    if (type === 'favorites') {
        if (enable) { libraryState.favorites[key] = { item: JSON.parse(JSON.stringify(it)), updatedAt: now }; markUndeleted('library', key); }
        else { delete libraryState.favorites[key]; markDeleted('library', key); }
        saveLibrary(); refreshVisibleLibrary();
        sendAccountAction('set_favorite', { key, item: it, value: enable });
        return;
    }
    if (!['watching', 'planned', 'watched', 'dropped', 'onhold'].includes(type)) return;
    ['watching', 'planned', 'watched', 'dropped', 'onhold'].forEach(k => { if (k !== type && libraryState[k] && libraryState[k][key]) delete libraryState[k][key]; });
    if (enable) { libraryState[type][key] = { item: JSON.parse(JSON.stringify(it)), updatedAt: now }; markUndeleted('library', key); }
    else markDeleted('library', key);
    saveLibrary(); refreshVisibleLibrary();
    sendAccountAction('set_watch_status', { key, item: it, value: enable ? type : null });
}

/* ============================================================
   ОЦЕНКИ ЗВЁЗДАМИ + ВРЕМЯ ПРОСМОТРА
   ============================================================ */
const RATE_STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z"/></svg>';

function getUserRating(it) {
    const e = libraryState.ratings && libraryState.ratings[itemKey(it)];
    return e ? Number(e.rating) || 0 : 0;
}
function renderRatingStars() {
    const host = $('#ratingStars');
    if (!host || !currentItem) return;
    const cur = getUserRating(currentItem);
    host.innerHTML = Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        return `<button type="button" class="rate-star ${n <= cur ? 'is-set' : ''}" aria-label="Оценка ${n} из 10"
            onclick="clickRating(${n})" onmouseenter="hoverRating(${n})" onmouseleave="leaveRating()">${RATE_STAR_SVG}</button>`;
    }).join('');
    const label = $('#ratingLabel');
    if (label) label.textContent = cur ? `Ваша оценка: ${cur} / 5` : 'Оценить:';
}
function hoverRating(n) {
    $$('#ratingStars .rate-star').forEach((b, i) => b.classList.toggle('is-hover', i < n));
}
function leaveRating() {
    $$('#ratingStars .rate-star').forEach(b => b.classList.remove('is-hover'));
}
function clickRating(n) {
    setRating(getUserRating(currentItem) === n ? 0 : n);
}
function setRating(n) {
    if (!currentItem) return;
    const key = itemKey(currentItem), now = Date.now();
    if (!libraryState.ratings) libraryState.ratings = {};
    if (n && n >= 1 && n <= 5) libraryState.ratings[key] = { item: JSON.parse(JSON.stringify(currentItem)), rating: n, updatedAt: now };
    else delete libraryState.ratings[key];
    saveLibrary();
    renderRatingStars();
    sendAccountAction('set_rating', { key, item: currentItem, value: n || null });
}
function parseRuntimeMin(s) {
    if (!s) return 0;
    let m = 0;
    const h = /(\d+)\s*ч/.exec(s); if (h) m += parseInt(h[1], 10) * 60;
    const mi = /(\d+)\s*мин/.exec(s); if (mi) m += parseInt(mi[1], 10);
    return m;
}
function rememberRuntime(it, minutes) {
    if (!it || !minutes) return;
    try {
        const data = safeParse(localStorage.getItem('mediaserver_runtime'), {});
        data[itemKey(it)] = minutes;
        localStorage.setItem('mediaserver_runtime', JSON.stringify(data));
    } catch (e) { }
    sendAccountAction('set_runtime', { key: itemKey(it), item: it, value: { runtime: minutes } });
}
function fmtMinutes(min) {
    min = Math.floor(Number(min) || 0);
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (d) return `${d} д ${h} ч`;
    if (h) return `${h} ч ${m} мин`;
    return `${m} мин`;
}

function toggleFavorite() { setLibraryStatus('favorites', currentItem); }
function setWatchStatus(type) {
    setLibraryStatus(type, currentItem);
    toast('Отмечено: ' + (WS_META[type] ? WS_META[type].label.toLowerCase() : type));
}
function clearWatchStatus() {
    if (!currentItem) return;
    ['watching', 'planned', 'watched', 'dropped', 'onhold'].forEach(t => {
        if (isInLibrary(t, currentItem)) setLibraryStatus(t, currentItem);
    });
    toast('Статус снят');
}
function shareUrlString() { return location.origin + location.pathname; }
function copyShareLink() {
    const url = shareUrlString();
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(() => toast('Ссылка скопирована')).catch(() => fallbackCopy(url));
    } else fallbackCopy(url);
}
function fallbackCopy(url) {
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Ссылка скопирована'); }
    catch (e) { toast('Не удалось скопировать', 'error'); }
    ta.remove();
}
function shareSocial(net) {
    const url = encodeURIComponent(shareUrlString());
    const title = encodeURIComponent(currentItem ? currentItem.title : document.title);
    const link = net === 'tg'
        ? `https://t.me/share/url?url=${url}&text=${title}`
        : `https://vk.com/share.php?url=${url}&title=${title}`;
    window.open(link, '_blank', 'noopener,width=680,height=540');
}

function markDeleted(bucket, key) {
    deletedState[bucket] = deletedState[bucket] || {};
    deletedState[bucket][key] = Date.now();
    saveDeleted();
}
function markUndeleted(bucket, key) {
    if (deletedState[bucket]) delete deletedState[bucket][key];
    saveDeleted();
}
function saveLibrary() { try { localStorage.setItem('mediaserver_library', JSON.stringify(libraryState)); } catch (e) { } }
function saveRecent() { try { localStorage.setItem('mediaserver_recent', JSON.stringify(recentlyViewed)); } catch (e) { } }
function saveDeleted() { try { localStorage.setItem('mediaserver_deleted', JSON.stringify(deletedState)); } catch (e) { } }

/* ============================================================
   RESOLVE SOURCES / KP ID
   ============================================================ */
async function fetchPlayableSources(it) {
    try {
        const params = new URLSearchParams({ title: it.title || '', year: it.year || '', type: it.type || '', original_title: it.original_title || '' });
        const res = await fetch(`/api/title/resolve-sources?${params.toString()}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) { return null; }
}
async function resolveKinopoiskId(title, year, type) {
    try {
        const params = new URLSearchParams({ title: title || '', year: year || '', type: type || '' });
        const res = await fetch(`/api/kinopoisk/resolve?${params.toString()}`);
        if (!res.ok) return '';
        const d = await res.json();
        return d.kinopoiskId || '';
    } catch (e) { return ''; }
}

/* ===== Прогресс из встроенного плеера (kinobox) через postMessage ===== */
let kbProgLastTs = 0, kbProgEpNum = 1;
let kbLastTime = 0;
let kbDuration = 0;
let kbActiveItemKey = '';
let kbGetSaveDone = false, kbGetSaveTimer = null;
let kbPendingSeek = null, kbSeekAttempts = 0, kbSeekLastTry = 0, kbHintShown = false;

function kbPlayerWins() {
    const c = $('#playerContainer');
    if (!c) return [];
    return Array.from(c.querySelectorAll('iframe'))
        .map(f => { try { return f.contentWindow; } catch (e) { return null; } })
        .filter(Boolean);
}

function kbSaveNow() {
    if (!currentItem || !(kbLastTime > 10)) return;
    if (kbActiveItemKey && itemKey(currentItem) !== kbActiveItemKey) { kbLastTime = 0; return; }
    saveProgress(kbProgEpNum, kbLastTime, kbDuration || 0);
}
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { kbSaveNow(); if (window._aniFlush) window._aniFlush(true); releaseWakeLock(); }
    else if (wakeLockWanted) acquireWakeLock();
});
window.addEventListener('pagehide', () => { kbSaveNow(); if (window._aniFlush) window._aniFlush(true); });

/* ---- Форматы команд плеера: ОБЪЕКТОМ и JSON-строкой ---- */
const KB_CMD_FORMATS = [
    ['obj event/time', (c, v) => ({ event: c, time: v })],
    ['str event/time', (c, v) => JSON.stringify({ event: c, time: v })],
    ['obj method/value', (c, v) => ({ method: c, value: v })],
    ['str method/value', (c, v) => JSON.stringify({ method: c, value: v })],
    ['obj action/time', (c, v) => ({ action: c, time: v })],
    ['str action/time', (c, v) => JSON.stringify({ action: c, time: v })],
    ['str command/time', (c, v) => JSON.stringify({ command: c, time: v })],
    ['obj name/value', (c, v) => ({ name: c, value: v })],
];
function kbCmdFound() {
    const f = safeParse(localStorage.getItem('mediaserver_kb_cmd'), null);
    if (!f || !f.label) return null;
    const row = KB_CMD_FORMATS.find(x => x[0] === f.label);
    return row ? { make: row[1], seekName: f.seekName || 'seek' } : null;
}

function kbSendSeek(win, t) {
    const post = (payload) => { try { win.postMessage(payload, '*'); } catch (e) { } };
    // 1) формат, найденный калибровкой — приоритетом
    const tuned = kbCmdFound();
    if (tuned) {
        post(tuned.make(tuned.seekName, t));
        post(tuned.make('play', undefined));
    }
    // 2) все известные форматы — ОБЪЕКТОМ и строкой:
    // плеер может ждать любой из двух видов, лишние игнорирует
    const cmds = [
        { event: 'setTime', time: t }, { event: 'seek', time: t }, { event: 'time', time: t },
        { method: 'seek', value: t }, { method: 'setTime', value: t },
        { action: 'seek', time: t }, { command: 'seek', time: t },
        { id: 1, method: 'seek', value: t },
    ];
    cmds.forEach(c => { post(c); post(JSON.stringify(c)); });
    [{ event: 'play' }, { method: 'play' }, { id: 2, method: 'play' }]
        .forEach(c => { post(c); post(JSON.stringify(c)); });
}

/* ---- Калибровка: авто-поиск формата, который плеер понимает.
   Запускать при ИГРАЮЩЕМ видео из консоли: kbCalibrate() ---- */
async function kbCalibrate() {
    const wins = kbPlayerWins();
    if (!wins.length) { toast('Открой плеер Kinobox и запусти видео', 'error'); return null; }
    const log = () => (window._kbMsgLog = window._kbMsgLog || []);
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const send = (make, cmd, val) => wins.forEach(w => { try { w.postMessage(make(cmd, val), '*'); } catch (e) { } });
    const sendAll = (cmd) => KB_CMD_FORMATS.forEach(([, make]) => send(make, cmd, undefined));
    const upsSince = (i) => log().slice(i).filter(x => x.data && x.data.event === 'timeupdate');
    const lastTime = () => {
        const u = log().filter(x => x.data && x.data.event === 'timeupdate');
        return u.length ? Number(u[u.length - 1].data.time) : null;
    };

    // плеер должен играть (timeupdate идут)
    const before = lastTime();
    await sleep(1300);
    if (before == null || lastTime() == null || lastTime() <= before) {
        toast('Видео на паузе — запусти его и вызови kbCalibrate() снова', 'error');
        return null;
    }

    for (const [label, make] of KB_CMD_FORMATS) {
        const mark = log().length;
        send(make, 'pause', undefined);
        await sleep(2200);
        if (upsSince(mark).length) {          // время шло — пауза НЕ сработала
            sendAll('play');
            await sleep(700);
            continue;
        }
        // ~2 сек тишины при играющем видео = пауза сработала!
        // Подтверждаем симметричной командой play:
        const mark2 = log().length;
        send(make, 'play', undefined);
        await sleep(1800);
        if (!upsSince(mark2).length) {         // запаузили, но вернуть не смогли
            sendAll('play');
            await sleep(900);
            continue;
        }
        // формат подтверждён дважды — ищем имя команды перемотки
        for (const name of ['seek', 'setTime', 'time', 'setCurrentTime', 'playerSeek', 'position']) {
            const cur = lastTime();
            if (cur == null) break;
            const target = Math.max(0, Math.round(cur) - 12);
            const mark3 = log().length;
            send(make, name, target);
            await sleep(2200);
            const ups = upsSince(mark3).map(x => Number(x.data.time)).filter(Number.isFinite);
            if (ups.length && Math.abs(ups[ups.length - 1] - target) < 9) {
                const found = { label: label, seekName: name };
                localStorage.setItem('mediaserver_kb_cmd', JSON.stringify(found));
                console.log('[kb] ✔ формат команд найден:', found);
                toast('✔ Плеер управляется: ' + label + ' / ' + name + ' — перемотка включена');
                return found;
            }
        }
        console.log('[kb] pause/play сработали (' + label + '), но имя перемотки не найдено');
        sendAll('play');
    }
    console.log('[kb] плеер не принимает команды — перемотка для этого источника недоступна');
    toast('Этот плеер команды не принимает — пришли вывод консоли', 'error');
    return null;
}

/* ---- Калибровка №2: поиск URL-параметра стартовой позиции.
   Перезагружает iframe плеера с ?параметр=37 и смотрит по телеметрии,
   с какой секунды видео стартует. Запускать при открытом плеере:
   kbCalibrate2() ---- */
async function kbCalibrate2() {
    const frames = Array.from(document.querySelectorAll('#playerContainer iframe'))
        .filter(f => f.src && f.src.startsWith('http'));
    if (!frames.length) { toast('Плеер не смонтирован', 'error'); return null; }
    const log = () => (window._kbMsgLog = window._kbMsgLog || []);
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const TARGET = 37;

    for (const p of ['t', 'time', 'start', 'start_time', 'st', 'from', 'begin']) {
        for (const f of frames) {
            const base = f.src;
            const mark = log().length;
            try { f.src = base + (base.includes('?') ? '&' : '?') + p + '=' + TARGET; } catch (e) { continue; }
            // плеер перезагружается; если параметр понят — заиграет с 37-й секунды
            await sleep(9000);
            const ups = log().slice(mark)
                .filter(x => x.data && x.data.event === 'timeupdate')
                .map(x => Number(x.data.time)).filter(Number.isFinite);
            if (ups.length && ups[0] >= 25 && ups[0] < TARGET + 25) {
                const found = { urlParam: p };
                localStorage.setItem('mediaserver_kb_urlparam', JSON.stringify(found));
                console.log('[kb] ✔ URL-параметр старта найден: ?' + p + '=', found);
                toast('✔ Перемотка работает через параметр «' + p + '» (плеер перезапускается с нужной секунды)');
                return found;
            }
            try { f.src = base; } catch (e) { }
            await sleep(3000);
        }
    }
    console.log('[kb] URL-параметры не сработали');
    toast('Этот плеер не поддерживает и URL-перемотку', 'error');
    return null;
}

function kbTrySeek() {
    if (!kbPendingSeek) return;
    const now = Date.now();
    if (now - kbSeekLastTry < 2000) return;
    kbSeekLastTry = now;
    // План Б: если калибровка нашла URL-параметр старта — перематываем
    // перезапуском iframe: плеер стартует сразу с нужной секунды
    const up = safeParse(localStorage.getItem('mediaserver_kb_urlparam'), null);
    if (up && up.urlParam) {
        const f = document.querySelector('#playerContainer iframe');
        if (f && f.src) {
            const t = Math.floor(kbPendingSeek.time);
            let url = f.src;
            const re = new RegExp('([?&])' + up.urlParam + '=[^&]*');
            if (re.test(url)) url = url.replace(re, '$1' + up.urlParam + '=' + t);
            else url += (url.includes('?') ? '&' : '?') + up.urlParam + '=' + t;
            if (url !== f.src) { f.src = url; toast('Перезапускаю с ' + fmtWatch(t) + '…'); }
        }
        kbPendingSeek = null;
        return;
    }
    if (++kbSeekAttempts > 3 && !kbHintShown) {
        kbHintShown = true;
        // подсказка уже показана в startKbProgressCapture — кнопка не нужна
    }
    if (kbSeekAttempts > 60) { kbPendingSeek = null; return; }
    const t = kbPendingSeek.time;
    setTimeout(() => kbPlayerWins().forEach(w => kbSendSeek(w, t)), 300);
}

function showKbResumeHint(t) {
    const hint = $('#playerHint'); if (!hint) return;
    hint.innerHTML = `<button class="btn-primary h-10 px-4 rounded-xl text-sm flex items-center gap-2 mb-2" onclick="kbManualResume(${t})">${icon('play')}<span>Продолжить с ${fmtWatch(t)}</span></button>`;
}
function showKbManualHint(t) {
    const hint = $('#playerHint'); if (!hint) return;
    const p = currentItem && getProgress(currentItem);
    const bits = [];
    if (p && Number(p.season) > 0) bits.push(`сезон ${p.season}`);
    if (p && Number(p.episode) > 0) bits.push(`серия ${p.episode}`);
    if (p && p.translation) bits.push(`озвучка «${p.translation}»`);
    const info = bits.length ? bits.join(', ') + ' · ' : '';
    const hasAni = currentPlayerButtons.some(b => b.key === 'anilibria');
    hint.innerHTML = `<div class="text-xs text-muted bg-white/5 border border-gold/30 rounded-xl p-3.5 flex gap-2 items-center">
        ${icon('info')}
        <span>⏸ Вы остановились: ${info}<b class="text-goldHi">${fmtWatch(t)}</b>${p && p.duration ? ' из ' + fmtWatch(p.duration) : ''}. Отмотайте до этого времени вручную.${hasAni ? ' В плеере <b>Anilibria</b> перемотка автоматическая.' : ''}</span>
    </div>`;
}
function kbManualResume(t) {
    kbPendingSeek = { time: t }; kbSeekAttempts = 24; kbSeekLastTry = 0;
    kbTrySeek();
}

window.addEventListener('message', (ev) => {
    let d = ev.data;
    if (typeof d === 'string') {
        const s = d.trim();
        if (s[0] !== '{' && s[0] !== '[') return;
        try { d = JSON.parse(s); } catch (e) { return; }
    }
    if (!d || typeof d !== 'object') return;

    // ---- диагностика: складываем ВСЁ, что шлют плееры (до фильтров!) ----
    try {
        window._kbMsgLog = window._kbMsgLog || [];
        window._kbMsgLog.push({ t: Date.now(), kind: (typeof ev.data), data: d });
        if (window._kbMsgLog.length > 800) window._kbMsgLog.shift();
    } catch (e) { }

    if (!currentItem) return;
    const wins = kbPlayerWins();
    if (!wins.length || !wins.includes(ev.source)) return;

    if (d.event === 'getSave') {
        kbGetSaveDone = true;
        if (kbGetSaveTimer) { clearInterval(kbGetSaveTimer); kbGetSaveTimer = null; }
        if (d.saveInfo && typeof d.saveInfo === 'object') {
            const si = d.saveInfo;
            const ep = Number(si.serial && si.serial.episode);
            const t = Number(si.time) || 0;
            if (Number.isFinite(ep) && ep > 0) { kbProgEpNum = ep; window._kbEpisode = ep; }
            if (t > 10) { kbLastTime = t; saveProgress(kbProgEpNum, t, kbDuration || 0); }
        }
        return;
    }

    // время бывает в d.time ИЛИ d.value (PlayerJS-формат),
    // Ловим информацию о серии/сезоне/озвучке (если плеер сообщает)
    const _si = d.saveInfo || d.serial || null;
    const _ep = Number(_si ? _si.episode : d.episode);
    const _season = Number(_si ? _si.season : d.season);
    const _tr = (_si && (_si.translation || _si.idTranslation)) || d.translation || d.idTranslation;
    if (Number.isFinite(_ep) && _ep > 0) { kbProgEpNum = _ep; window._kbEpisode = _ep; }
    if (Number.isFinite(_season) && _season > 0) window._kbSeason = _season;
    if (_tr) window._kbTranslation = String(_tr);

    // длительность — в d.duration
    const t = Number(d.time ?? d.value ?? (d.data && d.data.time));
    if (!Number.isFinite(t) || t < 0) return;
    const dur = Number(d.duration ?? (d.data && d.data.duration));
    if (Number.isFinite(dur) && dur > 0) kbDuration = dur;

    if (kbPendingSeek) {
        if (Math.abs(t - kbPendingSeek.time) < 25) {
            const done = kbPendingSeek.time;
            kbPendingSeek = null;
            toast('✔ Продолжаю с ' + fmtWatch(done));
        } else kbTrySeek();
    }

    // экран не гаснет, пока kinobox играет (идёт поток времени)
    if (d.event === 'pause') releaseWakeLock(true);
    else kbWakeActivity();

    kbLastTime = t;

    if (d.event === 'pause' || d.event === 'seek' || d.event === 'timeupdate' ||
        Date.now() - kbProgLastTs >= 10000) {
        kbProgLastTs = Date.now();
        kbSaveNow();
    }
});

function startKbProgressCapture() {
    stopKbProgressCapture();
    const saved = getProgress(currentItem);
    kbProgEpNum = (saved && Number(saved.episode)) || 1;
    kbGetSaveDone = false;
    kbSeekAttempts = 0; kbSeekLastTry = 0; kbHintShown = false; kbDuration = 0;
    kbActiveItemKey = itemKey(currentItem || {});
    kbPendingSeek = null; // перемотка Kinobox отключена — плеер не принимает команды
    let tries = 0;
    kbGetSaveTimer = setInterval(() => {
        if (++tries > 20 || kbGetSaveDone) { clearInterval(kbGetSaveTimer); kbGetSaveTimer = null; return; }
        kbPlayerWins().forEach(w => { try { w.postMessage(JSON.stringify({ event: 'getSave' }), '*'); } catch (e) { } });
    }, 1500);
}
function stopKbProgressCapture() {
    kbSaveNow();
    if (kbGetSaveTimer) { clearInterval(kbGetSaveTimer); kbGetSaveTimer = null; }
    kbProgLastTs = 0; kbPendingSeek = null; kbLastTime = 0;
}


/* ============================================================
   PLAYER: Kinobox / Kodik / Anilibria
   ============================================================ */
/* ===== Источники плеера: кнопка-дропдаун (как у animeon) =====
   Собственный список: kodik/anilibria из резолва + плееры Kinobox API
   (veoveo/alloha/turbo/collaps/gencit...) с прямыми iframe-ссылками.
   Внутренние плееры, которых нет для тайтла, — серые с пометкой «нет». */
const PLAYER_KNOWN_SOURCES = [
    { key: 'kodik', label: 'Kodik', icon: 'layers' },
    { key: 'anilibria', label: 'Anilibria', icon: 'sparkles' },
    { key: 'veoveo', label: 'VeoVeo', icon: 'clapper' },
    { key: 'alloha', label: 'Alloha', icon: 'clapper' },
    { key: 'turbo', label: 'Turbo', icon: 'wand' },
    { key: 'collaps', label: 'Collaps', icon: 'layers' },
    { key: 'gencit', label: 'Gencit', icon: 'clapper' },
    { key: 'videoseed', label: 'Videoseed', icon: 'clapper' },
];
const PLAYER_SRC_TTL = 60 * 60 * 12 * 1000;   // кеш Kinobox API на 12ч как на сервере

function playerSrcCacheKey(it) {
    const kp = (it.sources && it.sources.kinobox && it.sources.kinobox.kinopoiskId) || it.kinopoiskId || '';
    return 'mediaserver_kbox_v2_' + (kp || encodeURIComponent((it.title || '') + '|' + (it.year || '')));
}

async function fetchKboxPlayers(it) {
    const ckey = playerSrcCacheKey(it);
    try {
        const raw = localStorage.getItem(ckey);
        if (raw) { const c = safeParse(raw, null); if (c && Array.isArray(c.data) && Date.now() - c.t < PLAYER_SRC_TTL) return c.data; }
    } catch (e) { }
    // старый кеш от api.kinobox.tv содержал битые токены — вычищаем один раз
    try {
        const stale = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('mediaserver_kbox_v1_')) stale.push(k);
        }
        stale.forEach(k => localStorage.removeItem(k));
    } catch (e) { }
    const kp = (it.sources && it.sources.kinobox && it.sources.kinobox.kinopoiskId) || it.kinopoiskId || '';
    const q = kp ? 'kinopoisk=' + encodeURIComponent(kp) : (it.title ? 'title=' + encodeURIComponent(it.title) : '');
    if (!q) return [];
    try {
    const res = await fetch('https://fbphdplay.top/api/players?' + q);
        const d = await res.json();
        const data = (d && d.data) || [];
        try { localStorage.setItem(ckey, JSON.stringify({ t: Date.now(), data })); } catch (e) { }
        return data;
    } catch (e) { return []; }
}

function buildPlayerSources(kboxPlayers) {
    const srcs = (currentItem && currentItem.sources) || {};
    const list = [];
    const push = (e) => { if (e.ok && list.some(x => x.key === e.key && x.ok)) return; if (!list.some(x => x.key === e.key)) list.push(e); };
    // свои источники из резолва — приоритет
    if (srcs.kodik && srcs.kodik.link) push({ key: 'kodik', label: 'Kodik', icon: 'layers', ok: true, url: srcs.kodik.link });
    if (srcs.anilibria && (srcs.anilibria.alias || srcs.anilibria.id)) push({ key: 'anilibria', label: 'Anilibria', icon: 'sparkles', ok: true, mount: 'video' });
    // плееры Kinobox API — прямые iframe-ссылки, без виджета kinobox
    (kboxPlayers || []).forEach((p) => {
        const key = String(p.type || '').toLowerCase();
        if (!key) return;
        push({
            key, label: (PLAYER_KNOWN_SOURCES.find(s => s.key === key) || {}).label || p.type,
            icon: (PLAYER_KNOWN_SOURCES.find(s => s.key === key) || {}).icon || 'clapper',
            ok: !!p.iframeUrl, url: p.iframeUrl || '', note: p.iframeUrl ? '' : 'нет',
            // озвучки из партнёрского API — для внешнего управления (alloha/kodik)
            translations: (p.translations || []).filter(t => t && t.name).map(t => ({ id: t.id, name: t.name, quality: t.quality })),
        });
    });
    // известные источники, которых нет для тайтла, — серыми в конец списка
    PLAYER_KNOWN_SOURCES.forEach(s => { if (!list.some(e => e.key === s.key)) push({ ...s, ok: false, note: 'нет' }); });
    return list;
}

function playerShellAltSync() {
    const shell = $('#playerShell');
    if (!shell) return;
    const okCount = playerSources.filter(s => s.ok).length;
    shell.classList.toggle('has-alt', okCount > 1);
}

function renderPlayerSrcPanel() {
    const panel = $('#playerSrcPanel');
    if (!panel) return;
    panel.innerHTML = playerSources.map((s, i) => {
        const offTag = !s.ok ? `<span class="ps-off">${escapeHtml(s.note || 'нет')}</span>` : (s.key === activeSourceKey ? `<span class="ps-check">${icon('check')}</span>` : '');
        return `<button type="button" class="ps-item ${s.key === activeSourceKey ? 'is-active' : ''} ${s.ok ? '' : 'is-off'}" data-key="${escapeAttr(s.key)}" data-idx="${i}" ${s.ok ? '' : 'disabled'}>
            ${icon(s.icon)}<span class="ps-nm">${escapeHtml(s.label)}</span>${offTag}
        </button>`;
    }).join('');
    panel.querySelectorAll('.ps-item').forEach(btn => {
        btn.addEventListener('click', () => { if (btn.hasAttribute('disabled')) return; pickPlayerSource(btn.dataset.key); });
    });
    // тумблер внешнего управления (откат в любой момент)
    const hasExt = playerSources.some(s => s.ok && ((s.key === 'alloha' && (s.translations || []).length >= 0) || (s.key === 'kodik' && (s.translations || []).length >= 0)));
    if (hasExt) {
        panel.insertAdjacentHTML('beforeend',
            `<label class="ps-ext" title="Списки серий и озвучек под плеером; выключите — вернётся обычный плеер">
                <input type="checkbox" id="psExtChk" ${playerExtControls ? 'checked' : ''}>
                <span>Управление сериями и озвучками</span>
            </label>`);
        panel.querySelector('#psExtChk').addEventListener('change', (e) => {
            playerExtControls = !!e.target.checked;
            try { localStorage.setItem('mediaserver_ext_controls', playerExtControls ? 'on' : 'off'); } catch (err) { }
        });
    }
}

function renderPlayerSrcTrigger(entry) {
    const label = $('#playerSrcLabel');
    const btn = $('#playerSrcBtn');
    if (label) label.textContent = entry ? entry.label : 'Источник';
    if (btn) btn.classList.toggle('is-off', !!(entry && !entry.ok));
}

function setPlayerSrcOpen(open) {
    playerSrcPanelOpen = !!open;
    const panel = $('#playerSrcPanel'), btn = $('#playerSrcBtn');
    if (panel) {
        panel.classList.toggle('hidden', !open);
        if (open) renderPlayerSrcPanel();
    }
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function togglePlayerSources(force) {
    setPlayerSrcOpen(force === undefined ? !playerSrcPanelOpen : !!force);
}

/* клик мимо панели — закрыть */
document.addEventListener('click', (e) => {
    if (!playerSrcPanelOpen) return;
    if (e.target.closest('#playerSrcWrap')) return;
    setPlayerSrcOpen(false);
});

/* --- внешнее управление сериями/озвучками (alloha/kodik) ---
   Работает по URL-параметрам плеера: alloha на sansa.stravers.live
   понимает season/episode/translation, kodik — те же параметры.
   Откат в любой момент: тумблер в дропдауне источников (или константа ниже в false). */
const PLAYER_EXT_CONTROLS_DEFAULT = localStorage.getItem('mediaserver_ext_controls') !== 'off';
let playerExtControls = PLAYER_EXT_CONTROLS_DEFAULT;

/* домен theatre не уважает episode/season — alloha отдаёт под sansa */
function allohaExtUrl(url) {
    return String(url).replace('theatre.stravers.live', 'sansa.stravers.live');
}

function buildExtUrl(entry, sel) {
    let url = entry.url;
    if (entry.key === 'alloha') url = allohaExtUrl(url);
    try {
        const u = new URL(url, location.href);
        if (entry.key === 'alloha' || entry.key === 'kodik') {
            if (sel.season > 1) u.searchParams.set('season', String(sel.season));
            u.searchParams.set('episode', String(sel.episode));
            if (sel.translationId) u.searchParams.set('translation', String(sel.translationId));
        }
        return u.toString();
    } catch (e) { return url; }
}

function renderExtSidebar(entry, sel) {
    const shell = $('#playerShell'), list = $('#epList');
    if (!shell || !list) return;
    shell.classList.add('has-side');
    const st = $('#epSideTitle'); if (st) st.textContent = entry.label;
    const cnt = $('#epCount');
    const total = Number(currentItem && currentItem.episodes_total) || 0;
    if (cnt) cnt.textContent = total > 1 ? String(total) : '';

    let html = '';
    // серии (1..episodes_total) — как у anilibria
    if (total > 1) {
        const nums = [];
        for (let i = 1; i <= Math.min(total, 300); i++) nums.push(i);
        html += `<div class="ep-block"><div class="ep-block-head">Серии</div><div class="ep-grid">
        ${nums.map(n => `<button type="button" class="ep-num ${n === sel.episode ? 'is-active' : ''}" data-ep="${n}">${n}</button>`).join('')}
        </div></div>`;
    }
    // озвучки из партнёрского API
    const trs = (entry.translations || []);
    if (trs.length) {
        html += `<div class="ep-block"><div class="ep-block-head">Озвучка<span class="n">${trs.length}</span></div>
        ${trs.map(t => `<button type="button" class="ep-item ${sel.translationId && t.id === sel.translationId ? 'is-active' : ''}" data-tr="${escapeAttr(String(t.id))}">
            <span class="nm">${escapeHtml(t.name)}</span>${t.quality ? `<span class="tag">${escapeHtml(t.quality)}</span>` : ''}
        </button>`).join('')}
        </div>`;
    }
    list.innerHTML = html;
    list.querySelectorAll('.ep-num').forEach(b => b.addEventListener('click', () => {
        if (Number(b.dataset.ep) === sel.episode) return;
        remountExternalPlayer(entry, { ...sel, episode: Number(b.dataset.ep) });
    }));
    list.querySelectorAll('.ep-item[data-tr]').forEach(b => b.addEventListener('click', () => {
        const id = Number(b.dataset.tr);
        if (sel.translationId === id) return;
        remountExternalPlayer(entry, { ...sel, translationId: id });
    }));
}

/* перезапуск плеера с новым эпизодом/озвучкой (URL-параметры) */
function remountExternalPlayer(entry, sel) {
    window._kbSeason = sel.season;
    window._kbTranslation = sel.translationId ? String(sel.translationId) : '';
    destroyPlayer();
    const container = $('#playerContainer');
    if (!container) return;
    container.innerHTML = `<iframe src="${escapeAttr(buildExtUrl(entry, sel))}" allowfullscreen webkitallowfullscreen mozallowfullscreen allow="autoplay; encrypted-media; fullscreen *; picture-in-picture; web-share; clipboard-write"></iframe>`;
    acquireWakeLock();
    startKbProgressCapture();
    renderExtSidebar(entry, sel);
    renderPlayerSrcPanel();
}

function mountSourceIframe(entry) {
    const shell = $('#playerShell'), container = $('#playerContainer');
    if (!shell || !container) return;
    shell.classList.remove('has-side');
    const list = $('#epList'); if (list) list.innerHTML = '';
    const sideTitle = $('#epSideTitle'); if (sideTitle) sideTitle.textContent = 'Эпизоды';
    const sideCnt = $('#epCount'); if (sideCnt) sideCnt.textContent = '';
    const hintEl = $('#playerHint'); if (hintEl) hintEl.innerHTML = '';
    const controls = $('#anilibriaControls');
    if (controls) { controls.classList.add('hidden'); controls.innerHTML = ''; }
    // внешний контроль: alloha/kodik серий/озвучек по URL-параметрам
    const ext = playerExtControls && (entry.key === 'alloha' || entry.key === 'kodik') && !!entry.url;
    let sel = { episode: 1, season: 1, translationId: null };
    if (ext) {
        const saved = currentItem ? getProgress(currentItem) : null;
        if (saved && Number(saved.episode) > 0) sel.episode = Number(saved.episode);
        if (saved && Number(saved.season) > 0) sel.season = Number(saved.season);
        if (saved && saved.translation && /^\d+$/.test(String(saved.translation))) sel.translationId = Number(saved.translation);
    }
    const mountUrl = ext ? buildExtUrl(entry, sel) : entry.url;
    /* referrerpolicy НЕ ставим: Alloha (stravers) требует Referer —
       с no-referrer отвечает «запрашиваемый контент не найден» */
    container.innerHTML = `<iframe src="${escapeAttr(mountUrl)}" allowfullscreen webkitallowfullscreen mozallowfullscreen allow="autoplay; encrypted-media; fullscreen *; picture-in-picture; web-share; clipboard-write"></iframe>`;
    acquireWakeLock();
    startKbProgressCapture();
    if (ext) renderExtSidebar(entry, sel);
    // если плеер не подал признаков жизни — подсказка со сменой источника
    clearTimeout(kinoboxHintTimer);
    kinoboxHintTimer = setTimeout(() => {
        const hint = $('#playerHint');
        if (!hint || kbLastTime > 0) return;
        const others = playerSources.filter(s => s.ok && s.key !== entry.key);
        hint.innerHTML = `<div class="text-xs text-muted bg-white/5 border border-border rounded-xl p-3.5 flex gap-2">${icon('info')}<span>Плеер долго не запускается — возможно, блокировщик рекламы мешает. Выбери другой источник кнопкой выше${others.length ? ': ' + others.slice(0, 4).map(s => s.label).join(', ') : ''}.</span></div>`;
    }, 12000);
}

/** Собирает список источников (с кешем Kinobox API), монтирует последний
    выбранный пользователем или первый доступный. */
async function initPlayerSources(reqId) {
    const kbPlayers = await fetchKboxPlayers(currentItem || {});
    if (reqId !== undefined && reqId !== titlePageRequestId) return;
    playerSources = buildPlayerSources(kbPlayers);
    playerShellAltSync();
    // последний выбор пользователя, если для тайтла он доступен
    const lastKey = localStorage.getItem('mediaserver_src_last') || '';
    const entry = playerSources.find(s => s.ok && s.key === lastKey) || playerSources.find(s => s.ok);
    if (!entry) {
        const container = $('#playerContainer');
        if (container) container.innerHTML = `<div class="absolute inset-0 flex flex-col items-center justify-center text-muted p-6 gap-2 text-center"><span class="text-warn">${icon('alert')}</span><p class="text-sm font-semibold text-ink">Плееры этого тайтла не найдены</p><p class="text-xs">Попробуй открыть его позже — источники периодически появляются.</p></div>`;
        const label = $('#playerSrcLabel'); if (label) label.textContent = 'Нет источников';
        const btn = $('#playerSrcBtn'); if (btn) btn.disabled = true;
        return;
    }
    pickPlayerSource(entry.key);
}

function pickPlayerSource(key) {
    const entry = playerSources.find(s => s.key === key);
    if (!entry || !entry.ok) return;
    activeSourceKey = key;
    try { localStorage.setItem('mediaserver_src_last', key); } catch (e) { }
    setPlayerSrcOpen(false);
    renderPlayerSrcTrigger(entry);
    renderPlayerSrcPanel();
    destroyPlayer();
    clearTimeout(kinoboxHintTimer);
    if (entry.mount === 'video') {
        switchPlayer('anilibria');
        return;
    }
    if (entry.key === 'kodik' && (!entry.url || !entry.ok)) {
        // kodik из резолва всегда с ссылкой — сюда не добираемся
        return;
    }
    mountSourceIframe(entry);
}

function switchPlayer(key) {
    if (key === 'anilibria') {
        destroyPlayer();
        const shell = $('#playerShell');
        const srcs = (currentItem && currentItem.sources) || {};
        if (!(srcs.anilibria && (srcs.anilibria.alias || srcs.anilibria.id))) return;
        shell?.classList.add('has-side');   // сайдбар эпизодов
        const list = $('#epList'); if (list) list.innerHTML = '';
        const sideTitle = $('#epSideTitle'); if (sideTitle) sideTitle.textContent = 'Эпизоды';
        const sideCnt = $('#epCount'); if (sideCnt) sideCnt.textContent = '';
        const hintEl = $('#playerHint'); if (hintEl) hintEl.innerHTML = '';
        const container = $('#playerContainer');
        const controls = $('#anilibriaControls');
        container.innerHTML = `<video id="aniVideo" controls playsinline style="background:#000"></video>`;
        if (controls) { controls.classList.remove('hidden'); controls.innerHTML = `<div class="flex items-center gap-2 text-muted text-sm"><span class="loader-spin loader-spin-sm"></span>Загрузка серий…</div>`; }
        loadAnilibria(srcs.anilibria.alias || srcs.anilibria.id);
        return;
    }
    // kodik и остальные iframe-источники — через pickPlayerSource
    pickPlayerSource(key);
}

function destroyPlayer() {
    stopKbProgressCapture();
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
    releaseWakeLock(true);
    clearTimeout(kinoboxHintTimer);
    window._aniFlush = null;
    const c = $('#playerContainer'); if (c) c.innerHTML = '';
}

function progressKey(it) { return itemKey(it); }
function saveProgress(episode, time, duration) {
    if (!currentItem || !Number.isFinite(time)) return;
    const key = progressKey(currentItem);
    const data = safeParse(localStorage.getItem('mediaserver_progress'), {});
    data[key] = { episode: Number(episode) || 1, season: window._kbSeason || 0, translation: window._kbTranslation || '', time: Math.max(0, Math.floor(time)), duration: Number.isFinite(duration) ? Math.floor(duration) : 0, updatedAt: Date.now() };
    // не копим мусор: максимум 30 тайтлов с прогрессом,
    // старые «подглядел и ушёл» вытесняются новыми
    const pkeys = Object.keys(data);
    if (pkeys.length > 30) {
        pkeys.sort((a, b) => (data[b].updatedAt || 0) - (data[a].updatedAt || 0));
        pkeys.slice(30).forEach(k => delete data[k]);
    }
    localStorage.setItem('mediaserver_progress', JSON.stringify(data));
    sendAccountAction('progress_set', { key, item: currentItem, value: data[key] });
}
function getProgress(it) {
    const data = safeParse(localStorage.getItem('mediaserver_progress'), {});
    return data[progressKey(it)] || null;
}

/* ===== Wake Lock: экран не гаснет во время просмотра ===== */
let wakeLockSentinel = null, wakeLockRequesting = false, wakeLockWanted = false, wakeReleaseTimer = null;
async function acquireWakeLock() {
    wakeLockWanted = true;
    if (!('wakeLock' in navigator)) return;
    if (wakeLockSentinel || wakeLockRequesting) return;
    wakeLockRequesting = true;
    try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => { wakeLockSentinel = null; });
    } catch (e) { /* нет поддержки/разрешения — тихо */ }
    finally { wakeLockRequesting = false; }
}
function releaseWakeLock(force) {
    clearTimeout(wakeReleaseTimer);
    if (force) wakeLockWanted = false;
    try { wakeLockSentinel?.release(); } catch (e) { }
    wakeLockSentinel = null;
}
function kbWakeActivity() {
    acquireWakeLock();
    clearTimeout(wakeReleaseTimer);
    wakeReleaseTimer = setTimeout(() => releaseWakeLock(true), 20000); // тишина 20 сек = пауза/закрыл
}

async function loadAnilibria(aliasOrId) {
    const controls = $('#anilibriaControls');
    const video = $('#aniVideo');
    const shell = $('#playerShell');
    try {
        const res = await fetch(`/api/anilibria/release/${encodeURIComponent(aliasOrId)}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const episodes = data.episodes || [];
        if (!episodes.length) {
            controls.innerHTML = '<p class="text-muted text-sm">Серии не найдены.</p>';
            shell?.classList.remove('has-side');
            return;
        }

        const me = $('#metaEpisodes');
        if (me) { me.classList.remove('hidden'); me.querySelector('.v').textContent = `${episodes.length} сер.`; }

        // панель: качество + выбор серий со стрелками
        controls.innerHTML = `
<div class="flex flex-wrap items-center gap-2">
<span class="text-[11px] text-faint font-semibold uppercase tracking-wider">Качество</span>
<div class="player-seg">
  ${['hls_1080', 'hls_720', 'hls_480'].map(q => `<button type="button" class="kb-src q-btn" data-q="${q}" onclick="aniSetQuality('${q}')">${q.replace('hls_', '')}p</button>`).join('')}
</div>
</div>
<div class="flex items-center gap-2 min-w-0">
<span class="text-[11px] text-faint font-semibold uppercase tracking-wider shrink-0 hidden sm:inline">Эпизоды</span>
<button type="button" class="ep-arrow" onclick="aniScrollNums(-1)" aria-label="Серии назад">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
</button>
<div class="ep-nums">
  ${episodes.map((ep, i) => `<button type="button" class="ep-num" data-idx="${i}" onclick="aniSelectEp(${i})">${ep.episode || i + 1}</button>`).join('')}
</div>
<button type="button" class="ep-arrow" onclick="aniScrollNums(1)" aria-label="Серии вперёд">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
</button>
</div>
<p id="aniStatus" class="text-xs text-faint">Нажмите Play для воспроизведения</p>`;
        enableHorizontalScroll('.ep-nums');
        enableDragScroll('.ep-nums');

        // сайдбар: эпизоды с названиями
        shell?.classList.add('has-side');
        const st = $('#epSideTitle'); if (st) st.textContent = 'Эпизоды';
        const epCount = $('#epCount');
        if (epCount) epCount.textContent = episodes.length;
        const epList = $('#epList');
        if (epList) {
            epList.innerHTML = episodes.map((ep, i) => {
                const num = ep.episode || (i + 1);
                return `<button type="button" class="ep-item" data-idx="${i}" onclick="aniSelectEp(${i})">
                  <span class="num">${num}</span>
                  <span class="nm">${escapeHtml(ep.name || 'Эпизод ' + num)}</span>
                </button>`;
            }).join('');
        }

        window._aniEpisodes = episodes;
        window._aniIdx = 0;
        const savedProgress = getProgress(currentItem);
        if (savedProgress && savedProgress.episode) {
            const idx = episodes.findIndex((ep, i) => Number(ep.episode || i + 1) === Number(savedProgress.episode));
            if (idx >= 0) window._aniIdx = idx;
        }

        const savedVol = parseFloat(localStorage.getItem('mediaserver_volume') || '0.6');
        video.volume = Number.isFinite(savedVol) ? savedVol : 0.6;
        video.addEventListener('volumechange', () => localStorage.setItem('mediaserver_volume', video.volume));

        video.addEventListener('play', () => { clearTimeout(wakeReleaseTimer); acquireWakeLock(); });
        video.addEventListener('pause', () => releaseWakeLock(true));
        video.addEventListener('ended', () => releaseWakeLock(true));

        let aniLastSave = 0;
        const aniSave = (force) => {
            if (!video || video.currentTime <= 3) return;
            if (!force && Date.now() - aniLastSave < 5000) return;
            aniLastSave = Date.now();
            const eps = window._aniEpisodes || [], idx = window._aniIdx || 0;
            saveProgress(eps[idx]?.episode || (idx + 1), video.currentTime, video.duration);
        };
        video.addEventListener('timeupdate', () => aniSave(false));
        video.addEventListener('pause', () => aniSave(true));
        video.addEventListener('seeked', () => aniSave(true));
        window._aniFlush = aniSave;

        const syncActive = () => {
            $$('#epList .ep-item, .ep-num').forEach(b => b.classList.toggle('is-active', Number(b.dataset.idx) === Number(window._aniIdx)));
            const el = $('#epList .ep-item.is-active');
            if (el) el.scrollIntoView({ block: 'nearest' });
            const num = $('.ep-num.is-active');
            if (num) num.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        };

        const aniPlay = () => {
            const idx = window._aniIdx || 0;
            const q = window._aniQuality || 'hls_720';
            const ep = episodes[idx];
            if (!ep) return;
            const streamUrl = ep[q] || ep.hls_720 || ep.hls_480 || '';
            if (!streamUrl) { $('#aniStatus').textContent = 'Поток не найден'; return; }
            if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
            $('#aniStatus').textContent = 'Загрузка потока…';
            if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    const saved = getProgress(currentItem);
                    const epNum = ep.episode || idx + 1;
                    if (saved && Number(saved.episode) === Number(epNum) && saved.time > 5 && saved.time < (video.duration || Infinity) - 5) video.currentTime = saved.time;
                    $('#aniStatus').textContent = `Серия ${epNum} · ${q.replace('hls_', '')}p`;
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else {
                $('#aniStatus').textContent = 'Браузер не поддерживает HLS.';
            }
            syncActive();
        };
        window._aniPlay = aniPlay;
        window.aniSetQuality = (q) => {
            window._aniQuality = q;
            $$('.q-btn').forEach(b => b.classList.toggle('is-active', b.dataset.q === q));
            aniPlay();
        };
        window.aniSelectEp = (idx) => {
            if (idx === Number(window._aniIdx)) return;
            window._aniIdx = idx;
            aniPlay();
        };

        window.aniScrollNums = (dir) => {
            const row = document.querySelector('.ep-nums');
            if (!row) return;
            const step = Math.max(200, row.clientWidth * 0.8);
            if (typeof row._hsScrollBy === 'function') row._hsScrollBy(dir * step);
            else row.scrollBy({ left: dir * step, behavior: 'smooth' });
        };

        video.addEventListener('ended', () => {
            if (window._aniIdx < episodes.length - 1) {
                window._aniIdx++;
                aniPlay();
                $('#aniStatus').textContent = `Автопереход к серии ${window._aniIdx + 1}`;
            } else $('#aniStatus').textContent = 'Все серии просмотрены';
        });

        const first = episodes[0] || {};
        window._aniQuality = (first.hls_1080 && 'hls_1080') || (first.hls_720 && 'hls_720') || 'hls_480';
        $$('.q-btn').forEach(b => b.classList.toggle('is-active', b.dataset.q === window._aniQuality));
        syncActive();
        aniPlay();
    } catch (e) {
        console.error(e);
        controls.innerHTML = '<p class="text-marqueeHi text-sm">Ошибка загрузки Anilibria.</p>';
        shell?.classList.remove('has-side');
    }
}

/* ============================================================
   СЛУЧАЙНЫЙ ТАЙТЛ
   ============================================================ */
function syncRandomChips() {
    $$('#randomTypeChips button[data-rt]').forEach(b => b.classList.toggle('is-active', randomTypes.has(b.dataset.rt)));
}
function toggleRandomType(k) {
    randomTypes.has(k) ? randomTypes.delete(k) : randomTypes.add(k);
    syncRandomChips();
    loadRandom();
}
function resetRandomTypes() {
    randomTypes = new Set(['movie', 'series', 'anime', 'cartoon']);
    syncRandomChips();
    loadRandom();
}

function showRandomModal() {
    $('#randomModal').classList.remove('hidden');
    lockPageScroll();
    syncRandomChips();
    loadRandom();
}
function openRandomModal() {
    showRandomModal();
    if (location.pathname !== '/random') history.pushState({ random: true }, '', '/random');
}
function closeRandomModal() {
    if ($('#randomModal').classList.contains('hidden')) return;
    $('#randomModal').classList.add('hidden');
    unlockPageScroll();
    if (location.pathname === '/random') {
        if (history.state && history.state.random) history.back();   // открыли кликом — вернёмся назад
        else { pushRoute('/'); routeFromLocation(); }               // зашли по прямой ссылке — на главную
    }
}
function closeRandomModalSilent() {   // закрытие без манипуляций с историей
    if ($('#randomModal').classList.contains('hidden')) return;
    $('#randomModal').classList.add('hidden');
    unlockPageScroll();
}

async function loadRandom() {
    $('#randomBody').innerHTML = `<div id="randomCard" class="flex items-center justify-center min-h-[220px]">
<span class="loader-spin"></span>
</div>
<div id="randomActions" class="mt-3 flex items-center justify-end gap-2"></div>`;
    await fetchRandom();
}
async function fetchRandom() {
    const card = $('#randomCard'), actions = $('#randomActions');
    if (!card || !actions) return;
    if (!randomTypes.size) {
        card.innerHTML = `<p class="text-muted text-sm text-center">Выбери хотя бы один тип.</p>`;
        actions.innerHTML = '';
        return;
    }
    card.innerHTML = `<span class="loader-spin"></span>`;
    actions.innerHTML = '';
    try {
        const p = new URLSearchParams();
        if (randomExcludeId) p.set('exclude', randomExcludeId);
        if (randomTypes.size) p.set('types', Array.from(randomTypes).join(','));
        const y1 = parseInt($('#rfYear1').value, 10) || 0;
        const y2 = parseInt($('#rfYear2').value, 10) || 0;
        const rr = parseFloat($('#rfRating').value) || 0;
        if (y1) p.set('year_from', y1);
        if (y2) p.set('year_to', y2);
        if (rr) p.set('rating', rr);
        const res = await fetch(`/api/random?${p}`, { cache: 'no-store' });
        const it = await res.json();
        if (!it || !it.title) throw new Error('empty');
        randomExcludeId = it.id || '';
        registerItem(it);
        const genres = (it.genres || []).slice(0, 4)
            .map(g => typeof g === 'string' ? g : (g.name || '')).filter(Boolean).join(' · ');
        card.innerHTML = `
<div class="flex gap-4 text-left">
<img src="${img(it.poster) || placeholderSvg(200, 300)}" class="w-28 rounded-xl ring-1 ring-white/10 shrink-0" onerror="this.onerror=null;this.src=placeholderSvg(200,300)">
<div class="min-w-0">
  <p class="font-display uppercase text-base md:text-lg leading-tight text-ink">${escapeHtml(it.title)}</p>
  <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted">
    ${it.year ? `<span class="bg-white/10 px-2 py-0.5 rounded-md">${escapeHtml(it.year)}</span>` : ''}
    ${it.type ? `<span class="bg-white/10 px-2 py-0.5 rounded-md">${escapeHtml(it.type)}</span>` : ''}
  </div>
  ${ratingBadgesHtml(it) ? `<div class="flex flex-wrap gap-1.5 mt-2">${ratingBadgesHtml(it)}</div>` : ''}
  ${genres ? `<p class="text-[11px] text-faint mt-2">${escapeHtml(genres)}</p>` : ''}
  <p class="text-muted text-sm leading-relaxed mt-3 line-clamp-4">${escapeHtml(it.description) || 'Описание отсутствует.'}</p>
</div>
</div>`;
        actions.innerHTML = `
<button onclick="loadRandom()" class="btn-ghost h-9 px-3.5 rounded-xl text-sm flex items-center gap-2">${icon('wand')}<span>Другой тайтл</span></button>
<button onclick="openRandomNow('${escapeAttr(itemKey(it))}')" class="btn-primary h-9 px-5 rounded-xl text-sm flex items-center gap-2">${icon('play')}<span>Открыть</span></button>`;
    } catch (e) {
        card.innerHTML = `<p class="text-muted text-sm text-center leading-relaxed">По этим фильтрам ничего не нашлось.<br>Ослабь условия или попробуй позже.</p>`;
    }
}
function openRandomNow(key) {
    closeRandomModalSilent();
    const it = getRegistered(key);
    const target = it ? titleHref(it) : ('/t/' + encodeURIComponent(key));
    if (location.pathname === '/random') history.replaceState({ t: key }, '', target);
    navigateToTitle(key);
}

/* ============================================================
   ЖАЛОБЫ НА ТАЙТЛЫ
   ============================================================ */
function openReportModal() {
    if (!currentItem) return;
    if (!accountUser) {
        toast('Войди в аккаунт, чтобы отправить жалобу', 'error');
        openAccountModal();
        return;
    }
    $('#reportTitle').textContent = currentItem.title || '';
    $('#reportComment').value = '';
    $('#reportModal').classList.remove('hidden');
    lockPageScroll();
}
function closeReportModal() { $('#reportModal').classList.add('hidden'); unlockPageScroll(); }
async function submitReport(reason) {
    try {
        const res = await fetch('/api/report', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reason,
                comment: $('#reportComment').value.trim(),
                key: itemKey(currentItem),
                item: {
                    title: currentItem.title, year: currentItem.year, type: currentItem.type,
                    kinopoiskId: currentItem.kinopoiskId, tmdbId: currentItem.tmdbId, imdbId: currentItem.imdbId,
                },
            }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.detail || 'Ошибка');
        closeReportModal();
        toast(d.dedup ? 'Жалоба на этот тайтл уже отправлена' : 'Жалоба отправлена — спасибо!');
    } catch (e) { toast(e.message, 'error'); }
}

/* ============================================================
   KINOPOISK EXTRAS: trailer / staff / similar
   ============================================================ */
function extractYT(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/.test(u.hostname)) return null;
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0];
        if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
        return u.searchParams.get('v');
    } catch (e) { return null; }
}
function openSimilar(filmId) { navigateToTitle('kp:' + filmId); }

const FACTS_ROWS = [
    ['Год производства', 'year'],
    ['Страна', 'countries'],
    ['Жанр', 'genres'],
    ['Слоган', 'slogan'],
    ['Режиссер', 'directors'],
    ['Сценарий', 'writers'],
    ['Продюсер', 'producers'],
    ['Оператор', 'operators'],
    ['Композитор', 'composers'],
    ['Художник', 'designers'],
    ['Монтаж', 'editors'],
    ['Бюджет', 'budget'],
    ['Сборы в США', 'gross_usa'],
    ['Сборы в мире', 'gross_world'],
    ['Премьера в мире', 'premiere_world'],
    ['Премьера в России', 'premiere_russia'],
    ['Рейтинг MPAA', 'mpaa'],
    ['Возраст', 'age'],
    ['Время', 'runtime'],
];

function renderFactValue(value) {
    if (Array.isArray(value)) {
        const items = value.map(v => {
            if (v && v.staff_id) {
                return `<a href="/actor/${v.staff_id}" onclick="event.preventDefault(); openStaffPage(${v.staff_id}); return false;" class="hover:text-goldHi transition">${escapeHtml(v.name || '')}</a>`;
            }
            return escapeHtml(v && v.name ? v.name : String(v));
        });
        if (items.length > 4) {
            const visible = items.slice(0, 4).join(', ');
            const hidden = items.slice(4).join(', ');
            return `<span class="fact-list">${visible}, <button class="fact-toggle text-faint hover:text-ink transition" onclick="this.closest('.fact-list').classList.toggle('expanded')">...</button><span class="fact-extra">${hidden}</span></span>`;
        }
        return items.join(', ');
    }
    return escapeHtml(value);
}

function enableHorizontalScroll(selector) {
    $$(selector).forEach(el => {
        if (el._hsReady) return;
        el._hsReady = true;
        const st = { target: el.scrollLeft, raf: 0 };
        const glide = () => {
            const diff = st.target - el.scrollLeft;
            if (Math.abs(diff) <= 1) { el.scrollLeft = st.target; st.raf = 0; return; }
            el.scrollLeft += diff * 0.22;
            st.raf = requestAnimationFrame(glide);
        };
        el._hsScrollBy = (px) => {
            quietenHoverUI();   // карточки уедут из-под курсора — гасим ховер-панели
            const max = el.scrollWidth - el.clientWidth;
            if (max <= 4) return;
            if (!st.raf) st.target = el.scrollLeft;
            st.target = Math.max(0, Math.min(max, st.target + px));
            if (!st.raf) st.raf = requestAnimationFrame(glide);
        };
        el.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            const max = el.scrollWidth - el.clientWidth;
            if (max <= 4) return;              // листать нечего — страницу крутит браузер
            if (!st.raf) st.target = el.scrollLeft;
            const dir = e.deltaY > 0 ? 1 : -1;
            if (dir > 0 ? st.target >= max - 1 : st.target <= 0) return;  // у края — страницу крутит браузер
            e.preventDefault();
            const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            el._hsScrollBy(delta);
        }, { passive: false });
    });
}

/* ===== Подавление hover-подсветок после прокрутки лент =====
   После драга ленты или инерционного колеса карточки «проехали» под
   неподвижным курсором: браузер пересчитывает :hover, и панель с описанием
   тайтла «залипает» на случайной карточке, пока не кликнешь куда-нибудь.
   Держим hover-интерфейс карточек выключенным до первого РЕАЛЬНОГО движения
   мыши: синтетический mousemove, который Chrome присылает после скролла,
   игнорируется — копим фактический сдвиг курсора (acc >= 8px). */
let _hqMoveHandler = null;

function quietenHoverUI() {
    const b = document.body;
    ttipHide();
    staffHoverRemoveCard();
    if (b.classList.contains('hover-quiet')) return;   // уже ждём движения мыши
    b.classList.add('hover-quiet');
    let lx = null, ly = null, acc = 0;
    const lift = () => {
        window.removeEventListener('mousemove', onMove, true);
        window.removeEventListener('keydown', onKey, true);
        _hqMoveHandler = null;
        b.classList.remove('hover-quiet');
    };
    const onMove = (e) => {
        if (lx !== null) acc += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
        lx = e.clientX; ly = e.clientY;
        if (acc >= 8) lift();   // курсор действительно двинулся рукой
    };
    const onKey = () => lift(); // клавиатура: Tab-фокус тоже должен подсвечивать карточки
    if (_hqMoveHandler) window.removeEventListener('mousemove', _hqMoveHandler, true);
    _hqMoveHandler = onMove;
    window.addEventListener('mousemove', onMove, true);
    window.addEventListener('keydown', onKey, true);
}

/* ===== Глобальный гаситель hover-панелей при прокрутке =====
   Любая прокрутка (колесо по странице, ленты, снап-докатка, drag-скролл)
   прячет hover-панели карточек до реального движения мыши: карточки
   «проезжают» под курсором, и :hover вспыхивает на чужой карточке.
   scroll не всплывает, но capture-слушатель на document ловит и скролл
   лент. Только для мыши — на тач-устройствах hover-панелей нет. */
if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('scroll', quietenHoverUI, { capture: true, passive: true });
    window.addEventListener('resize', syncCatalogFiltersBtn, { passive: true });   // стрелка «Фильтры» при смене брейкпоинта
}

/* ===== Drag-скролл мышью (как пальцем на телефоне) с инерцией =====
   Драг работает ВЕЗДЕ внутри ленты, включая сами карточки: native-drag
   картинок глушится, клик после драга подавляется. Порог 5px: меньше —
   это клик (карточка откроется), больше — драг. */
function enableDragScroll(selector) {
    $$(selector).forEach(el => {
        if (el._dsReady) return;
        el._dsReady = true;
        // native drag картинок/ссылок внутри ленты ломает скролл — глушим
        el.addEventListener('dragstart', e => e.preventDefault());

        el.addEventListener('pointerdown', e => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            el._dsMoved = false;                       // клик после этого pointerdown пока валиден
            let moved = false;
            const sx = e.clientX, sy = e.clientY, sl = el.scrollLeft;
            let lastX = e.clientX, lastT = performance.now(), vel = 0, raf = 0;
            el.style.scrollBehavior = 'auto';          // 1:1 за курсором

            const stopGlide = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
            const finish = () => {
                el.classList.remove('is-dragging');
                el.style.scrollBehavior = '';
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                window.removeEventListener('pointercancel', onUp);
                // Chrome-баг: :hover «залипает» после динамического
                // pointer-events:none — глушим хит-тест на 60мс, браузер
                // пересчитывает hover с нуля
                document.body.classList.add('hover-clear');
                quietenHoverUI();   // панель тайтла не «залипнет» после драга
                setTimeout(() => {
                    document.body.classList.remove('hover-clear');
                    el._dsMoved = false;   // страховка от съеденного клика
                }, 60);
            };
            const glide = () => {
                vel *= 0.93;
                el.scrollLeft += vel;
                const max = el.scrollWidth - el.clientWidth;
                if (Math.abs(vel) > 0.35 && el.scrollLeft > 0 && el.scrollLeft < max) raf = requestAnimationFrame(glide);
                else finish();
            };
            const onMove = (ev) => {
                const dx = ev.clientX - sx, dy = ev.clientY - sy;
                if (!moved) {
                    if (Math.abs(dx) < 5 || Math.abs(dx) <= Math.abs(dy)) return;
                    moved = true;
                    el._dsMoved = true;
                    el.classList.add('is-dragging');
                    try { window.getSelection().removeAllRanges(); } catch (_) {}   // драг не должен выделять текст
                }
                ev.preventDefault();
                el.scrollLeft = sl - dx;
                const now = performance.now(), dt = now - lastT;
                if (dt > 0) vel = (lastX - ev.clientX) / dt * 16;   // px за кадр
                lastX = ev.clientX; lastT = now;
            };
            const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                window.removeEventListener('pointercancel', onUp);
                if (moved && Math.abs(vel) > 0.35) { raf = requestAnimationFrame(glide); return; }
                finish();
            };
            // слушатели на window: драг не рвётся, даже если курсор
            // вылетел за пределы ленты или ушёл на другой элемент
            window.addEventListener('pointermove', onMove, { passive: false });
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);   // система жестов отменила перетаскивание
        });
        // клик в конце драга не должен открывать карточку
        el.addEventListener('click', e => {
            if (el._dsMoved) { e.preventDefault(); e.stopPropagation(); el._dsMoved = false; }
        }, true);
    });
}

function pluralActors(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'актер';
    if ([2, 3, 4].includes(m10) && ![12, 13, 14].includes(m100)) return 'актера';
    return 'актеров';
}

/* ============================================================
АКТЁРЫ (СПИСОК ИМЁН) + ХОВЕР-КАРТОЧКА ПЕРСОНЫ
============================================================ */
const HOVER_OK = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
const STAFF_HOVER_CACHE = new Map();
let staffHoverShowTimer = null;
let staffHoverHideTimer = null;

function staffHoverRemoveCard() {
    clearTimeout(staffHoverShowTimer);
    clearTimeout(staffHoverHideTimer);
    const c = $('#personHoverCard'); if (c) c.remove();
}
function staffHoverShow(anchor, staffId) {
    if (!HOVER_OK) return;
    clearTimeout(staffHoverHideTimer);
    clearTimeout(staffHoverShowTimer);
    staffHoverShowTimer = setTimeout(() => staffHoverBuildCard(anchor, staffId), 250);
}
function staffHoverHide() {
    clearTimeout(staffHoverShowTimer);
    clearTimeout(staffHoverHideTimer);
    staffHoverHideTimer = setTimeout(() => { const c = $('#personHoverCard'); if (c) c.remove(); }, 120);
}
function fetchStaffPerson(staffId) {
    if (!STAFF_HOVER_CACHE.has(staffId)) {
        STAFF_HOVER_CACHE.set(staffId, fetch(`/api/staff/${staffId}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null));
    }
    return STAFF_HOVER_CACHE.get(staffId);
}
function staffHoverPosition(card, anchor) {
    const r = anchor.getBoundingClientRect();
    const cw = card.offsetWidth || 300, ch = card.offsetHeight || 150;
    let left = r.right + 12;
    if (left + cw > window.innerWidth - 8) left = r.left - cw - 12;
    if (left < 8) left = Math.max(8, Math.min(window.innerWidth - cw - 8, r.left));
    let top = r.top - 8;
    if (top + ch > window.innerHeight - 8) top = window.innerHeight - ch - 8;
    if (top < 8) top = 8;
    card.style.left = Math.round(left) + 'px';
    card.style.top = Math.round(top) + 'px';
}
async function staffHoverBuildCard(anchor, staffId) {
    staffHoverRemoveCard();
    const card = document.createElement('div');
    card.id = 'personHoverCard';
    card.className = 'person-hover-card';
    card.innerHTML = '<div class="flex items-center justify-center py-9"><span class="loader-spin loader-spin-sm"></span></div>';
    card.addEventListener('mouseenter', () => clearTimeout(staffHoverHideTimer));
    card.addEventListener('mouseleave', staffHoverHide);
    document.body.appendChild(card);
    staffHoverPosition(card, anchor);

    const data = await fetchStaffPerson(staffId);
    if (!document.body.contains(card)) return;
    if (!data || (!data.nameRu && !data.nameEn)) { card.remove(); return; }

    const facts = data.facts || {};
    const known = (data.titles || [])
        .filter(t => t && t.title)
        .slice()
        .sort((a, b) => (Number(b.rating_kp) || 0) - (Number(a.rating_kp) || 0))
        .slice(0, 3)
        .map(t => t.title)
        .join(' · ');
    const prof = String(data.profession || '');
    const knownLabel = /актрис/i.test(prof) ? 'Известна по:' : 'Известен по:';
    const born = [data.birthDate, data.age].filter(Boolean).join(' · ');

    card.innerHTML = `
        <div class="phc-row">
            <img class="phc-photo" src="${img(data.posterUrl) || placeholderSvg(120, 160)}" alt="" onerror="this.onerror=null;this.src=placeholderSvg(120,160)">
            <div class="phc-body">
                <div class="phc-name">${escapeHtml(data.nameRu || data.nameEn)}</div>
                ${prof ? `<div class="phc-prof">${escapeHtml(prof)}</div>` : ''}
                ${born ? `<div class="phc-meta">${escapeHtml(born)}</div>` : ''}
                ${facts.birthPlace ? `<div class="phc-meta">${escapeHtml(facts.birthPlace)}</div>` : ''}
                ${known ? `<div class="phc-known"><span class="phc-known-label">${knownLabel}</span> ${escapeHtml(known)}</div>` : ''}
            </div>
        </div>`;
    staffHoverPosition(card, anchor);
}
window.addEventListener('scroll', staffHoverRemoveCard, { passive: true });
window.addEventListener('resize', staffHoverRemoveCard, { passive: true });

function renderActorRow(p, idx) {
    const name = p.nameRu || p.nameEn || '';
    const id = Number(p.staffId);
    if (!name || !Number.isFinite(id) || id <= 0) return '';
    return `
        <li${idx >= 10 ? ' class="actor-extra"' : ''}><a href="/actor/${id}" class="actor-name-link"
            onclick="event.preventDefault(); openStaffPage(${id}); return false;"
            onmouseenter="staffHoverShow(this, ${id})" onmouseleave="staffHoverHide()">${escapeHtml(name)}</a></li>`;
}

function openActorsModal(kind) {
    const data = (window._kpStaffData || {})[kind] || [];
    if (!data.length) return;
    const isVoice = kind === 'voice';
    const title = isVoice ? 'Роли дублировали' : 'В главных ролях';
    $('#actorsModalTitle').textContent = `${title} · ${data.length}`;
    $('#actorsModalBody').innerHTML = `
        <ul class="actor-name-list am-cols am-list">
            ${data.map((p, i) => renderActorRow(p, i)).join('')}
        </ul>`;
    $('#actorsModal').classList.remove('hidden');
    lockPageScroll();
}
function closeActorsModal() {
    $('#actorsModal').classList.add('hidden');
    unlockPageScroll();
}

/* ============================================================
   ПОХОЖИЕ / СИКВЕЛЫ И ПРИКВЕЛЫ: ЛЕНТЫ КАРТОЧЕК
   ============================================================ */
const TITLE_RELATIONS = {
    'SEQUEL': 'Сиквелы', 'PREQUEL': 'Приквелы', 'SPIN_OFF': 'Спин-оффы',
    'ANOTHER': 'Связанные', 'FRESH': 'Новая часть', 'REMAKE': 'Ремейки',
};
const RELATION_ORDER = ['PREQUEL', 'SEQUEL', 'FRESH', 'REMAKE', 'SPIN_OFF', 'ANOTHER'];

function renderSimRow(s) {
    const name = s.nameRu || s.nameEn || s.nameOriginal || '';
    const rate = Number(s.rating_kp ?? s.rating);
    return `
<button type="button" class="sim-row card-focusable" title="${escapeAttr(name)}" onclick="openSimilar('${s.filmId}')">
<img src="${img(s.poster) || placeholderSvg(96, 128)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(96,128)">
<span class="flex-1 min-w-0">
<span class="t line-clamp-2">${escapeHtml(name)}</span>
<span class="m">
  ${s.year ? `<span>${escapeHtml(s.year)}</span>` : ''}
  ${Number.isFinite(rate) && rate > 0 ? `<span class="sim-rate">${icon('star')} ${rate.toFixed(1)}</span>` : ''}
</span>
</span>
<span class="text-faint shrink-0 hidden sm:flex">${icon('chevronRight')}</span>
</button>`;
}
function renderSimilarSection(items) {
    const word = /сериал|аним/i.test(String((currentItem || {}).type || '')) ? 'сериалы' : 'фильмы';
    return `
<section>
<div class="flex items-center gap-2.5 mb-4">
<span class="marquee-rule" style="width:22px"></span>
<h2 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Похожие ${word}</h2>
<span class="text-xs text-faint">${items.length}</span>
</div>
<div class="grid gap-2.5 md:grid-cols-2">${items.map(renderSimRow).join('')}</div>
</section>`;
}
function renderCurrentChronoCard() {
    const it = currentItem || {};
    return `
<div class="chrono-card chrono-cur">
<span class="chrono-img">
<img src="${img(it.poster) || placeholderSvg(200, 300)}" alt="" onerror="this.onerror=null;this.src=placeholderSvg(200,300)">
<span class="chrono-badge"><span>Текущий</span></span>
</span>
<span class="chrono-body">
<span class="chrono-title">${escapeHtml(it.title || '')}</span>
<span class="chrono-meta"><span>${escapeHtml(it.year || '')}</span><span class="rel">${escapeHtml(it.type || '')}</span></span>
</span>
</div>`;
}
function renderChronologyCard(s, num) {
    const name = s.nameRu || s.nameEn || s.nameOriginal || '';
    return `
<button type="button" class="chrono-card card-focusable" title="${escapeAttr(name)}" onclick="openSimilar('${s.filmId}')">
<span class="chrono-img">
<img src="${img(s.poster) || placeholderSvg(200, 300)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(200,300)">
<span class="chrono-num">${num}</span>
</span>
<span class="chrono-body">
<span class="chrono-title">${escapeHtml(name)}</span>
<span class="chrono-meta"><span>${escapeHtml(s.year || '')}</span><span class="rel">${escapeHtml(TITLE_RELATIONS[s.relation] || '')}</span></span>
</span>
</button>`;
}
function scrollTrailerRow(btn, dir) {
    const row = btn.closest('.row-group')?.querySelector('.trailer-grid');
    if (!row) return;
    const card = row.querySelector('.trailer-card');
    const step = card ? (card.offsetWidth + 14) * 2 : row.clientWidth * 0.8;
    row.scrollBy({ left: dir * step, behavior: 'smooth' });
}
function syncTrailerArrows() {
    $$('.trailer-grid').forEach(row => {
        const group = row.closest('.row-group');
        if (!group) return;
        const overflow = row.scrollWidth - row.clientWidth > 4;
        group.querySelectorAll('.row-nav-btn').forEach(b => { b.style.display = overflow ? '' : 'none'; });
    });
}
window.addEventListener('resize', syncTrailerArrows, { passive: true });

/* ============================================================
   ТРЕЙЛЕР: МОДАЛЬНОЕ ОКНО
   ============================================================ */
function openTrailerModal(url, title) {
    const host = $('#trailerFrameHost');
    if (!host) return;
    const yt = extractYT(url);
    if (yt) {
        host.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>`;
    } else if (/widgets\.kinopoisk\.ru/.test(url)) {
        let src = url;
        if (!/[?&]autoplay=/.test(src)) src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
        host.innerHTML = `<iframe src="${API_BASE}/api/kp-widget?url=${encodeURIComponent(src)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe>`;
    } else {
        toast('Не удалось открыть трейлер', 'error');
        return;
    }
    $('#trailerModalTitle').textContent = title || '';
    $('#trailerModal').classList.remove('hidden');
    lockPageScroll();
}
function closeTrailerModal() {
    const m = $('#trailerModal');
    if (!m || m.classList.contains('hidden')) return;
    m.classList.add('hidden');
    $('#trailerFrameHost').innerHTML = '';
    unlockPageScroll();
}

async function loadStaffPage(staffId) {
    staffHoverRemoveCard();
    // если открыт тайтл — корректно закрыть его вместе с плеером
    if (!$('#titleView').classList.contains('hidden')) {
        destroyPlayer();
        currentItem = null;
        titlePageRequestId++;
        extraRequestId++;
        $('#titleView').classList.add('hidden');
        $('#titleModalBody').innerHTML = '';
        titleOpen = false;
    }
    $('#homeView').classList.add('hidden');
    $('#gridView').classList.add('hidden');
    $('#animeView')?.classList.add('hidden');
    $('#titleView').classList.add('hidden');
    $('#staffView').classList.remove('hidden');
    $('#settingsView')?.classList.add('hidden');
    $('#listView')?.classList.add('hidden');
    window.scrollTo(0, 0);

    const content = $('#staffContent');
    content.innerHTML = '<div class="h-64 skeleton rounded-2xl"></div>';

    try {
        const res = await fetch(`/api/staff/${staffId}?full=1`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderStaffPage(data);
    } catch (e) {
        content.innerHTML = `<div class="text-center py-24"><p class="text-muted">Не удалось загрузить данные.</p></div>`;
    }
}

const STAFF_PROF_LABELS = {
    ACTOR: 'Актёрские работы', VOICE_ACTOR: 'Озвучивание',
    HIMSELF: 'В роли себя', HERSELF: 'В роли себя',
    DIRECTOR: 'Режиссёрские работы', WRITER: 'Сценарий',
    PRODUCER: 'Продюсирование', OPERATOR: 'Оператор',
    COMPOSER: 'Композитор', PAINTER: 'Художник',
    EDITOR: 'Монтаж',
    HRONO_TITR_MALE: 'Хроника и титры', HRONO_TITR_FEMALE: 'Хроника и титры',
};
const STAFF_PROF_ORDER = ['ACTOR', 'VOICE_ACTOR', 'HIMSELF', 'HERSELF', 'DIRECTOR',
    'WRITER', 'PRODUCER', 'OPERATOR', 'COMPOSER', 'PAINTER', 'EDITOR',
    'HRONO_TITR_MALE', 'HRONO_TITR_FEMALE'];

function renderStaffPage(data) {
    const content = $('#staffContent');
    const titles = data.titles || [];
    const facts = data.facts || {};

    const byProfession = {};
    titles.forEach(t => {
        const prof = t.profession || 'ACTOR';
        (byProfession[prof] = byProfession[prof] || []).push(t);
    });
    const groups = Object.keys(byProfession).sort((a, b) => {
        const ia = STAFF_PROF_ORDER.indexOf(a), ib = STAFF_PROF_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || byProfession[b].length - byProfession[a].length;
    });
    window._staffGroupsData = byProfession;
    if (!groups.includes(staffSelProf)) staffSelProf = groups[0] || '';
    staffPage = 1;

    const factChips = [];
    if (data.birthDate) factChips.push(`<span class="staff-fact"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>${escapeHtml(data.birthDate)}${data.age ? ' · ' + escapeHtml(String(data.age)) : ''}</span>`);
    if (data.deathDate) factChips.push(`<span class="staff-fact"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 21h8M12 17v4M17 5H7v5a5 5 0 0 0 10 0z"/><path d="M17 6h3a2 2 0 0 1-2 4h-1"/></svg>${escapeHtml(data.deathDate)}</span>`);
    if (facts.birthPlace) factChips.push(`<span class="staff-fact"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(facts.birthPlace)}</span>`);
    if (facts.growth) factChips.push(`<span class="staff-fact"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>${escapeHtml(String(facts.growth))} см</span>`);
    if (titles.length) factChips.push(`<span class="staff-fact">${icon('film')}${titles.length} ${pluralTitles(titles.length)}</span>`);

    content.innerHTML = `
    <nav class="st-crumb mb-4" aria-label="Хлебные крошки">
        <a href="/" onclick="goHome();return false;">Главная</a><span class="sep">/</span><b>Персоны</b><span class="sep">/</span><b class="truncate">${escapeHtml(data.nameRu || data.nameEn || '')}</b>
    </nav>
    <div class="flex flex-col md:flex-row gap-6 mb-8">
        <div class="w-40 md:w-48 shrink-0 mx-auto md:mx-0">
            <img src="${img(data.posterUrl) || placeholderSvg(300, 450)}"
                 class="w-full rounded-2xl ring-1 ring-white/10 shadow-pop object-cover"
                 style="aspect-ratio:2/3"
                 onerror="this.onerror=null;this.src=placeholderSvg(300,450)">
        </div>
        <div class="min-w-0 flex-1 self-center md:self-auto">
            <h1 class="font-display uppercase text-3xl md:text-4xl text-ink leading-tight">${escapeHtml(data.nameRu || data.nameEn || '')}</h1>
            ${data.nameEn && data.nameRu ? `<p class="text-muted text-sm mt-1.5">${escapeHtml(data.nameEn)}</p>` : ''}
            <div class="staff-facts mt-4">${factChips.join('')}</div>
        </div>
    </div>
     ${facts.biography ? `
    <div class="bg-white/[.03] border border-border rounded-2xl p-5 mb-8">
        <h3 class="font-display uppercase text-sm tracking-wide text-goldHi mb-2 flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Биография и факты
        </h3>
        <p class="text-muted text-sm leading-relaxed" style="white-space:pre-line">${escapeHtml(facts.biography)}</p>
    </div>` : ''}
    <div class="flex items-center gap-2.5 mb-4 px-0.5">
        <span class="marquee-rule" style="width:22px"></span>
        <h2 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Работы</h2>
        <span class="text-xs text-faint">${titles.length} ${pluralTitles(titles.length)}</span>
    </div>
    <div class="staff-groups mb-5">
        ${groups.map(g => `
        <button type="button" class="staff-chip ${staffSelProf === g ? 'is-active' : ''}" data-prof="${g}" onclick="setStaffGroup('${g}')">
            <span>${escapeHtml(STAFF_PROF_LABELS[g] || g)}</span>
            <span class="cnt">${byProfession[g].length}</span>
        </button>`).join('')}
    </div>
    <div id="staffGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"></div>
    <div id="staffMoreWrap" class="hidden"></div>
    <p id="staffEmpty" class="hidden text-muted text-sm text-center py-16">В этой категории работ пока нет.</p>`;

    renderStaffGroup();
}

/* ===== Работы: группа выбирается чипом, листается пагинацией ===== */
const STAFF_PAGE_SIZE = 24;
let staffSelProf = '';
let staffPage = 1;

function setStaffGroup(prof) {
    if (staffSelProf === prof) return;
    staffSelProf = prof;
    staffPage = 1;
    $$('.staff-chip').forEach(b => b.classList.toggle('is-active', b.dataset.prof === prof));
    renderStaffGroup();
}

function renderStaffGroup() {
    const grid = $('#staffGrid'); if (!grid) return;
    const list = (window._staffGroupsData || {})[staffSelProf] || [];
    const pages = Math.max(1, Math.ceil(list.length / STAFF_PAGE_SIZE));
    if (staffPage > pages) staffPage = pages;
    if (!list.length) {
        grid.innerHTML = '';
        $('#staffEmpty')?.classList.remove('hidden');
        renderPagination($('#staffMoreWrap'), { page: 1, total: 0, per: STAFF_PAGE_SIZE, go: 'gotoStaffPage' });
        return;
    }
    $('#staffEmpty')?.classList.add('hidden');
    grid.innerHTML = list
        .slice((staffPage - 1) * STAFF_PAGE_SIZE, staffPage * STAFF_PAGE_SIZE)
        .map(staffCard).join('');
    renderPagination($('#staffMoreWrap'), {
        page: staffPage,
        total: list.length,
        per: STAFF_PAGE_SIZE,
        go: 'gotoStaffPage',
    });
}

function gotoStaffPage(n) {
    staffPage = Math.max(1, Number(n) || 1);
    renderStaffGroup();
    const anchor = $('#staffGrid');
    if (anchor) window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 84), behavior: 'smooth' });
}

function kpPosterFallback(kpId) {
    // старый формат прямых постеров КП: бесплатный фолбэк, если тайтла нет в каталоге
    return `https://st.kp.yandex.net/images/film_big/${kpId}.jpg`;
}

function staffCard(t) {
    const it = {
        kinopoiskId: t.kinopoiskId,
        title: t.title,
        year: t.year,
        type: t.type,
        poster: t.poster || kpPosterFallback(t.kinopoiskId),
        rating_kp: t.rating_kp,
    };
    registerItem(it);
    return renderCard(it, { role: t.role });
    }

function openStaffPage(staffId) {
    const path = `/actor/${staffId}`;
    if (location.pathname !== path) history.pushState({ staff: staffId }, '', path);
    loadStaffPage(staffId);
}

function staffBack() {
    // вернуться туда, откуда пришли (тайтл/каталог);
    // при прямом заходе по ссылке — на главную
    if (history.state && history.state.staff) history.back();
    else goHome();
}

async function loadKpExtra(kpId) {
    const factsBox = $('#kpFacts');
    if (!factsBox) return;
    const reqId = ++extraRequestId;
    try {
        const res = await fetch(`/api/kinopoisk/details/${encodeURIComponent(kpId)}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const d = await res.json();
        if (reqId !== extraRequestId || !currentItem || currentItem.kinopoiskId !== kpId) return;

        const facts = d.facts || {};

        const ratingBox = $('#titleRatings');
        if (ratingBox) {
            currentItem.rating_kp = d.rating_kp;
            currentItem.rating_imdb = d.rating_imdb;
            ratingBox.innerHTML = titleRatingPillsHtml(currentItem) || '<span class="text-xs text-faint self-center">Рейтинг недоступен</span>';
        }

        const rtMin = parseRuntimeMin(facts.runtime || '');
        if (rtMin) rememberRuntime(currentItem, rtMin);
        const rtEl = $('#metaRuntime');
        if (rtEl && rtMin) {
            rtEl.classList.remove('hidden');
            const v = rtEl.querySelector('.v'); if (v) v.textContent = `${rtMin} мин.`;
        }

        const slogan = facts.slogan;
        const q = $('#kpQuote');
        if (q && slogan && typeof slogan === 'string' && slogan !== '—') {
            q.classList.remove('hidden');
            q.innerHTML = `<p class="text-sm md:text-base leading-relaxed text-zinc-400 italic">${escapeHtml(slogan)}</p>`;
        }

        if (d.title) {
            const t = d.title;
            let cardChanged = false;
            if (t.description && !currentItem.description) {
                currentItem.description = t.description; cardChanged = true;
                const dEl = $('#tpDesc'); if (dEl) dEl.textContent = t.description;
            }
            if (t.poster && !currentItem.poster) { currentItem.poster = t.poster; cardChanged = true; }
            if (Array.isArray(t.genres) && t.genres.length && !(currentItem.genres || []).length) {
                currentItem.genres = uniqueGenres(t.genres); cardChanged = true;
            }
            if (cardChanged) renderGenreChips();
        }

        // «О тайтле»
        const factsRows = FACTS_ROWS.filter(r => facts[r[1]]).map(r => `
<div class="flex gap-3">
  <dt class="text-faint shrink-0 w-[136px]">${r[0]}</dt>
  <dd class="text-muted min-w-0 flex-1">${renderFactValue(facts[r[1]])}</dd>
</div>`).join('');
        factsBox.innerHTML = factsRows ? `
<h3 class="tp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>О тайтле</h3>
<dl class="space-y-2.5 text-[13px]">${factsRows}</dl>` : '';

        // Трейлеры: сетка карточек
        // Трейлеры: горизонтальная лента со стрелками
        const trBox = $('#kpTrailer');
        if (trBox) {
            const list = (d.trailers || []).filter(t => t.url);
            trBox.innerHTML = list.length ? `
  <h3 class="tp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>Трейлеры</h3>
  <div class="row-group relative">
    <div class="trailer-grid">
      ${list.map((t, i) => {
                const name = String(t.name || t.title || '').trim() || ('Трейлер ' + (i + 1));
                const yt = extractYT(t.url);
                const thumb = yt
                    ? `https://i.ytimg.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg`
                    : (img(currentItem.cover || currentItem.poster) || placeholderSvg(320, 180));
                return `<button type="button" class="trailer-card card-focusable" title="${escapeAttr(name)}" data-turl="${escapeAttr(t.url)}" data-tname="${escapeAttr(name)}" onclick="openTrailerModal(this.dataset.turl, this.dataset.tname)">
        <img src="${thumb}" alt="" loading="lazy" onerror="this.onerror=null;this.src=placeholderSvg(320,180)">
        <span class="tc-fade"></span>
        <span class="tc-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>Трейлер</span>
        <span class="tc-play">${icon('playFill')}</span>
        <span class="tc-title">${escapeHtml(name)}</span>
      </button>`;
            }).join('')}
    </div>
    <button class="row-nav-btn left" onclick="scrollTrailerRow(this,-1)" aria-label="Прокрутить назад"><span class="row-nav-circle">${icon('chevronLeft')}</span></button>
    <button class="row-nav-btn right" onclick="scrollTrailerRow(this,1)" aria-label="Прокрутить вперёд"><span class="row-nav-circle">${icon('chevronRight')}</span></button>
  </div>` : '';
        }

        // Актёры и озвучки
        const staffBox = $('#kpStaff');
        if (staffBox) {
            const actors = d.staff || [];
            const voice = d.voice_staff || [];
            window._kpStaffData = { actors, voice };
            const actorsTotal = d.actors_total || actors.length;
            const voiceTotal = d.voice_total || voice.length;
            let html = '';
            if (actors.length) {
                const label = `${actorsTotal} ${pluralActors(actorsTotal)}`;
                html += `
  <div>
    <h3 class="tp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>В главных ролях</h3>
    <ul class="actor-name-list" id="actorNameList">${actors.map((p, i) => renderActorRow(p, i)).join('')}</ul>
    ${actors.length > 10 ? `<button type="button" class="actor-more-btn" onclick="openActorsModal('actors')">Все актёры (${actorsTotal})</button>` : ''}
  </div>`;
            }
            if (voice.length) {
                const label = `${voiceTotal} ${pluralActors(voiceTotal)}`;
                html += `
  <div>
    <h3 class="tp-h"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7l-4 4V10l4-4z"/><path d="M19 5v14"/></svg>Роли дублировали</h3>
    <ul class="actor-name-list" id="voiceNameList">${voice.map((p, i) => renderActorRow(p, i)).join('')}</ul>
    ${voice.length > 10 ? `<button type="button" class="actor-more-btn" onclick="openActorsModal('voice')">Все озвучки (${voiceTotal})</button>` : ''}
  </div>`;
            }
            staffBox.innerHTML = html;
        }

        // Похожие
        const sb = $('#similarBox');
        if (sb) sb.innerHTML = (d.similars && d.similars.length) ? renderSimilarSection(d.similars) : '';

        // Хронология франшизы
        const seqBox = $('#sequelsBox');
        if (seqBox) {
            if (d.sequels && d.sequels.length) {
                const groups = new Map();
                d.sequels.forEach(s => {
                    const rel = String(s.relation || 'ANOTHER').toUpperCase();
                    if (!groups.has(rel)) groups.set(rel, []);
                    groups.get(rel).push(s);
                });
                const relRank = r => { const i = RELATION_ORDER.indexOf(r); return i === -1 ? 99 : i; };
                const ordered = [...groups.keys()].sort((a, b) => relRank(a) - relRank(b));
                let n = 1;
                const cards = ordered.flatMap(rel => groups.get(rel).map(s => renderChronologyCard(s, n++)));
                seqBox.innerHTML = `
  <section>
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2.5">
        <span class="marquee-rule" style="width:22px"></span>
        <h2 class="font-display uppercase text-base md:text-lg tracking-wide text-ink">Хронология франшизы</h2>
      </div>
      <span class="text-xs font-medium text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full whitespace-nowrap">${d.sequels.length + 1} ${pluralTitles(d.sequels.length + 1)}</span>
    </div>
    <div class="chrono-row hide-scrollbar">${renderCurrentChronoCard()}${cards.join('')}</div>
  </section>`;
            } else seqBox.innerHTML = '';
        }

        enableHorizontalScroll('.chrono-row, .trailer-grid');
        enableDragScroll('.chrono-row, .trailer-grid');
        requestAnimationFrame(syncTrailerArrows);
    } catch (e) {
        if (reqId === extraRequestId && currentItem && currentItem.kinopoiskId === kpId) {
            factsBox.innerHTML = '<p class="text-marqueeHi text-sm">Ошибка загрузки данных Кинопоиска.</p>';
        }
    }
}

/* ============================================================
   ACCOUNT: auth, sync, polling
   ============================================================ */
function openAccountModal() { $('#accountModal').classList.remove('hidden'); lockPageScroll(); updateAccountModal(); initGoogleAuth(); }
function closeAccountModal() {
    $('#accountModal').classList.add('hidden');
    unlockPageScroll();
    googleCredPending = null;
    $('#amGcode')?.classList.add('hidden');
    setAccountMode('login');   // при закрытии всегда возвращаемся ко входу
}
/* ===== Вход через Google: кнопка GIS + запасной редирект-вход ===== */
let googleAuthReady = false, googleCredPending = null, googleBusy = false, googleFallback = false;

function loadGsiScript(cb) {
    if (window.google && window.google.accounts && window.google.accounts.id) { cb(); return; }
    if (document.getElementById('gsi-script')) {
        const t = setInterval(() => {
            if (window.google && window.google.accounts && window.google.accounts.id) { clearInterval(t); cb(); }
        }, 150);
        return;
    }
    const s = document.createElement('script');
    s.id = 'gsi-script';
    s.src = 'https://accounts.google.com/gsi.js';
    s.async = true;
    s.defer = true;
    s.onload = cb;
    s.onerror = () => enableGoogleFallback(true);   // скрипт заблокирован — работает popup-вход
    document.head.appendChild(s);
    // страховка: если за 7 секунд кнопка GIS не нарисовалась — прячем её пустой слой
    setTimeout(() => { if (!window._gisRendered) enableGoogleFallback(false); }, 7000);
}

function enableGoogleFallback(scriptFailed) {
    if (googleFallback) return;
    googleFallback = true;
    // Кнопка всегда в разметке (без дёрганий). Прячем прозрачный слой GIS,
    // когда рендер не состоялся — иначе он невидимо съедает клики.
    // Сам вход при этом продолжает работать через popup-схему (startGooglePopup).
    $('#amOauth .am-oauth-gis')?.classList.add('hidden');
    if (scriptFailed && !window._gPopupToastShown) {
        window._gPopupToastShown = true;
        toast('Вход Google работает в отдельном окне — просто нажми на кнопку', 'info');
    }
}

function isPrivateHost(h) {
    h = String(h || location.hostname || '').toLowerCase();
    if (h === 'localhost' || h.startsWith('127.')) return false;
    const p = h.split('.');
    if (p.length === 4 && p.every(x => /^\d+$/.test(x))) {
        const a = +p[0], b = +p[1];
        return a === 10 || a === 26 || a === 0 || (a === 192 && b === 168) ||
            (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254);
    }
    return false;
}

/* ===== Popup-вход через Google (не зависит от gsi.js и блокировщиков) =====
   Схема: открываем окно accounts.google.com с redirect_uri = наш сайт +
   /api/auth/google/callback (зарегистрирован в Google Console).
   GitHub Pages отдаёт по этому адресу 404.html (копия сайта), наш код на нём
   видит ?code=..&state=.. и передаёт их в opener через postMessage.
   Дальше бэкенд обменивает код на id_token и логинит как обычно. */

async function startGooglePopup(linkMode) {
    let cfg = window._gCfg;
    if (!cfg || !cfg.client_id) {
        try { cfg = await fetch('/api/auth/google/config').then(r => r.json()); } catch (e) { cfg = null; }
        if (cfg && cfg.client_id) window._gCfg = cfg;
    }
    if (!cfg || !cfg.client_id) {
        toast('Вход через Google ещё настраивается — попробуй чуть позже', 'info');
        return;
    }
    if (!linkMode && isPrivateHost(location.hostname)) {
        toast('Вход через Google недоступен на локальном адресе — открой https://cha3er.github.io и войди там', 'error');
        return;
    }
    const state = 'go' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
        sessionStorage.setItem(linkMode ? 'g_link_state' : 'g_oauth_state', state);
    } catch (e) { /* без state-проверки хуже, но не смертельно */ }
    const params = new URLSearchParams({
        client_id: cfg.client_id,
        redirect_uri: location.origin + '/api/auth/google/callback',
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        prompt: 'select_account',
    });
    const win = window.open(
        'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString(),
        'google_oauth',
        'width=480,height=640,left=' + Math.max(0, Math.round(((screen.availWidth || screen.width) - 480) / 2 + (screen.availLeft || 0))) +
        ',top=' + Math.max(0, Math.round(((screen.availHeight || screen.height) - 640) / 2 + (screen.availTop || 0)))
    );
    if (!win) {
        toast('Браузер заблокировал окно входа — разреши всплывающие окна для сайта', 'error');
    }
}

window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    const d = e.data || {};
    if (d.source !== 'google-oauth' || !d.code) return;
    const isLink = (() => { try { return !!sessionStorage.getItem('g_link_state'); } catch (_) { return false; } })();
    const key = isLink ? 'g_link_state' : 'g_oauth_state';
    let saved = '';
    try {
        saved = sessionStorage.getItem(key) || '';
        sessionStorage.removeItem(key);
    } catch (_) { /* пусто */ }
    if (!saved || !d.state || saved !== d.state) {
        toast('Просроченная попытка входа Google — попробуй ещё раз', 'error');
        return;
    }
    if (isLink) finishGoogleLink(d.code);
    else finishGooglePopup(d.code);
});

async function finishGooglePopup(oauthCode) {
    if (googleBusy) return;
    googleBusy = true;
    $('#accountError')?.classList.add('hidden');
    try {
        const res = await fetch((API_BASE || '') + '/api/account/google/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: oauthCode, access: $('#amCodeField input')?.value.trim() || '' }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.need_code && data.id_token) {
            // закрытый режим: нужен код доступа — показываем поле ввода,
            // повторный вход сделает continueGoogleWithCode (id_token валиден повторно)
            googleCredPending = data.id_token;
            $('#amGcode')?.classList.remove('hidden');
            $('#amGcodeInput')?.focus();
            const er = $('#accountError');
            if (er) { er.textContent = data.detail || 'Нужен код доступа'; er.classList.remove('hidden'); }
            return;
        }
        if (!res.ok) throw new Error(data.detail || 'Ошибка входа через Google');
        googleCredPending = null;
        $('#amGcode')?.classList.add('hidden');
        applyPopupLogin(data);
    } catch (err) {
        const er = $('#accountError');
        if (er) { er.textContent = err.message || 'Ошибка'; er.classList.remove('hidden'); }
        toast(err.message || 'Ошибка входа через Google', 'error');
    } finally {
        googleBusy = false;
    }
}

/* Вход прислал аккаунт — тот же завершающий блок, что в googleLogin,
   но без лишнего повторного запроса состояния. */
async function applyPopupLogin(data) {
    try {
        accountUser = data.user;
        const boot = await fetch('/api/account/bootstrap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ library: libraryState, history: recentlyViewed, progress: localProgressState() }),
        });
        if (boot.ok) applyAccountState(await boot.json());
        accountRevision = -1;
        startAccountPolling();
        updateAccountModal();
        toast(data.new ? 'Добро пожаловать, ' + accountUser.username + ' 👋'
                       : 'С возвращением, ' + accountUser.username + ' 👋');
        setTimeout(closeAccountModal, 350);
    } catch (e) { /* падение добивки не рушит вход — сессия уже установлена */ }
}

async function finishGoogleLink(oauthCode) {
    try {
        const res = await fetch((API_BASE || '') + '/api/account/google/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: oauthCode, link: 1 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Не удалось привязать Google');
        toast('Google привязан к аккаунту ✓');
        setTimeout(() => location.reload(), 900);
    } catch (err) {
        toast(err.message || 'Ошибка привязки Google', 'error');
        setTimeout(() => location.reload(), 1200);
    }
}

/* Страница колбэка: GitHub Pages отдаёт 404.html по пути /api/auth/google/callback.
   Код сработает и в popup (отправит код в opener и закроет окно),
   и при обычной навигации (перешлёт код сразу на бэкенд). */
(function googleOauthCallbackHandler() {
    try {
        if (location.pathname !== '/api/auth/google/callback') return;
        const q = new URLSearchParams(location.search);
        const code = q.get('code');
        if (!code) { setTimeout(() => window.close(), 50); return; }
        if (window.opener && window.opener !== window && !window.opener.closed) {
            window.opener.postMessage({ source: 'google-oauth', code: code, state: q.get('state') }, location.origin);
            document.title = 'Вход выполнен — окно закроется…';
            setTimeout(() => window.close(), 400);
            return;
        }
        // обычная навигация (не popup): дожидаемся адреса API и пересылаем код бэкенду
        apiReady.then(() => {
            if ((API_BASE || '').startsWith('http')) {
                location.replace((API_BASE || '') + '/api/auth/google/callback?' + q.toString());
            } else {
                setTimeout(() => window.close(), 200);
            }
        });
    } catch (e) { /* не мешаем обычной работе сайта */ }
})();

// Клик по нашей кнопке: если настоящий слой Google не отрисовался —
// открываем окно входа Google сами.
function bindGoogleButtonFallback() {
    $('#amOauth .am-oauth-btn')?.addEventListener('click', () => {
        if (window._gisRendered) return;   // настоящий слой Google ловит клики сам
        startGooglePopup(false);
    });
}
bindGoogleButtonFallback();

function initGoogleAuth() {
    if (googleAuthReady) return;
    googleAuthReady = true;
    // Google не принимает приватные адреса (Radmin/локальная сеть) —
    // кнопки не будет, подсказываем войти логин/паролем или по публичной ссылке
    if (isPrivateHost(location.hostname)) {
        toast('Вход через Google недоступен на локальном адресе — используй логин/пароль или публичную ссылку сайта');
        return;
    }
    fetch('/api/auth/google/config').then(r => r.json()).then(cfg => {
        if (!cfg || !cfg.enabled || !cfg.client_id) return;   // не настроено — кнопка просто никуда не ведёт
        window._gCfg = cfg;   // конфиг для popup-входа (работает даже при заблокированном gsi.js)
        loadGsiScript(() => {
            try {
                window.google.accounts.id.initialize({
                    client_id: cfg.client_id,
                    callback: onGoogleCredential,
                    ux_mode: 'popup',
                });
                window.google.accounts.id.renderButton($('#gGisHost'), {
                    type: 'standard', size: 'large', shape: 'rectangular',
                    theme: 'filled_black', width: 400, text: 'continue_with',
                });
                window._gisRendered = true;
                amUpdateOauthVis();
            } catch (e) {
                enableGoogleFallback(false);
            }
        });
    }).catch(() => { });
}

async function googleLogin(credential, code) {
    if (googleBusy) return;
    googleBusy = true;
    $('#accountError').classList.add('hidden');
    try {
        const res = await fetch('/api/account/google', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: credential, code: code || '' }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 403 && data.need_code) {
            googleCredPending = credential;
            $('#amGcode')?.classList.remove('hidden');
            $('#amGcodeInput')?.focus();
            const er = $('#accountError');
            if (er) { er.textContent = data.detail || 'Нужен код доступа'; er.classList.remove('hidden'); }
            return;
        }
        if (!res.ok) throw new Error(data.detail || 'Ошибка входа через Google');
        googleCredPending = null;
        $('#amGcode')?.classList.add('hidden');
        accountUser = data.user;
        const boot = await fetch('/api/account/bootstrap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ library: libraryState, history: recentlyViewed, progress: localProgressState() }),
        });
        if (boot.ok) applyAccountState(await boot.json());
        accountRevision = -1;
        const state = await fetch('/api/account/state?since=-1', { cache: 'no-store' });
        if (state.ok) applyAccountState(await state.json());
        startAccountPolling();
        updateAccountModal();
        toast(data.new
            ? 'Добро пожаловать, ' + accountUser.username + ' 👋'
            : 'С возвращением, ' + accountUser.username + ' 👋');
        setTimeout(closeAccountModal, 400);
    } catch (err) {
        const er = $('#accountError');
        if (er) { er.textContent = err.message || 'Ошибка'; er.classList.remove('hidden'); }
    } finally {
        googleBusy = false;
    }
}

function onGoogleCredential(resp) {
    googleLogin(resp.credential, $('#amCodeField input')?.value.trim() || '');
}
function continueGoogleWithCode() {
    if (!googleCredPending) return;
    googleLogin(googleCredPending, $('#amGcodeInput')?.value.trim() || '');
}


function setAccountMode(mode) {
    accountMode = mode;
    const isReg = mode === 'register';
    $('#amLoginHead')?.classList.toggle('hidden', isReg);
    $('#amLoginForm')?.classList.toggle('hidden', isReg);
    $('#amRegWizard')?.classList.toggle('hidden', !isReg);
    // заголовок левой панели: «С возвращением…» <-> «Начни своё путешествие»
    const sideT = $('#amSideTitle');
    if (sideT) sideT.innerHTML = isReg
        ? 'Начни своё<br><span class="am-side-grad">путешествие</span>'
        : 'С возвращением<br><span class="am-side-grad">в твой кинозал</span>';
    $('#accountError')?.classList.add('hidden');
    ['#amRegErr1', '#amRegErr2', '#amRegErr3'].forEach(s => $(s)?.classList.add('hidden'));
    $('#amSwitchQ').textContent = isReg ? 'Уже есть аккаунт?' : 'Впервые здесь?';
    $('#amSwitchBtn').textContent = isReg ? 'Войти' : 'Создать аккаунт';
    amPlaceOauth();
    if (isReg) amSetStep(1);
    amUpdateOauthVis();
}

/* ===== Мастер регистрации ===== */
let amRegStep = 1;

function amPlaceOauth() {
    // блок Google: после шапки входа (login) или после заголовка шага (регистрация)
    const anchor = accountMode === 'register' ? $('#amRegTitle') : $('#amLoginHead');
    if (anchor) anchor.after($('#amOauth'), $('#amGcode'), $('#amOauthDivider'));
}

function amUpdateOauthVis() {
    // Кнопка всегда присутствует в разметке (без динамического добавления) —
    // управляем только привязкой к режиму: вход или первый шаг регистрации.
    const show = accountMode === 'login' || (accountMode === 'register' && amRegStep === 1);
    $('#amOauth')?.classList.toggle('hidden', !show);
    $('#amOauthDivider')?.classList.toggle('hidden', !show);
}

function amSetStep(n) {
    amRegStep = n;
    for (let i = 1; i <= 4; i++) $('#amRegS' + i)?.classList.toggle('hidden', i !== n);
    $('#amRegStepNum').textContent = 'Шаг ' + n + ' из 4';
    $('#amRegBack')?.classList.toggle('hidden', n >= 4);
    const title = $('#amRegTitle');
    if (title) {
        if (n === 4) title.classList.add('hidden');
        else { title.classList.remove('hidden'); title.textContent = ['Начнём с Email', 'Как тебя называть?', 'Придумай пароль'][n - 1]; }
    }
    ['#amRegErr1', '#amRegErr2', '#amRegErr3'].forEach(s => $(s)?.classList.add('hidden'));
    amUpdateOauthVis();
}

function amRegBack() {
    if (amRegStep <= 1) { setAccountMode('login'); return; }
    amSetStep(amRegStep - 1);
}

function amRegNext() {
    if (amRegStep === 1) {
        const email = ($('#amRegEmail')?.value || '').trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
            const err = $('#amRegErr1');
            if (err) { err.textContent = 'Похоже, email написан с ошибкой'; err.classList.remove('hidden'); }
            return;
        }
        amSetStep(2);
    } else if (amRegStep === 2) {
        const nick = ($('#amRegNick')?.value || '').trim();
        if (!/^[A-Za-zА-Яа-яЁё0-9_\-]{3,32}$/.test(nick)) {
            const err = $('#amRegErr2');
            if (err) { err.textContent = 'Никнейм: 3–32 символа — буквы, цифры, «_» и «-»'; err.classList.remove('hidden'); }
            return;
        }
        amSetStep(3);
        amPassCheck();
    }
}

function amPassCheck() {
    const v = $('#amRegPass')?.value || '';
    const v2 = $('#amRegPass2')?.value || '';
    $('#aprLen')?.classList.toggle('ok', v.length >= 8);
    $('#aprUp')?.classList.toggle('ok', /[A-Z]/.test(v));
    $('#aprLow')?.classList.toggle('ok', /[a-z]/.test(v));
    $('#aprDig')?.classList.toggle('ok', /[0-9]/.test(v));
    $('#aprMatch')?.classList.toggle('ok', v.length > 0 && v === v2);
}

async function amFinishAuth() {
    const boot = await fetch('/api/account/bootstrap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ library: libraryState, history: recentlyViewed, progress: localProgressState() }),
    });
    if (boot.ok) applyAccountState(await boot.json());
    accountRevision = -1;
    const state = await fetch('/api/account/state?since=-1', { cache: 'no-store' });
    if (state.ok) applyAccountState(await state.json());
    startAccountPolling();
    updateAccountModal();
}

async function amRegFinish() {
    const errEl = $('#amRegErr3');
    errEl?.classList.add('hidden');
    const email = ($('#amRegEmail')?.value || '').trim();
    const username = ($('#amRegNick')?.value || '').trim();
    const password = $('#amRegPass')?.value || '';
    const password2 = $('#amRegPass2')?.value || '';
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        if (errEl) { errEl.textContent = 'Пароль не соответствует требованиям'; errEl.classList.remove('hidden'); }
        return;
    }
    if (password !== password2) {
        if (errEl) { errEl.textContent = 'Пароли не совпадают'; errEl.classList.remove('hidden'); }
        return;
    }
    const btn = $('#amRegSubmit');
    btn.disabled = true;
    try {
        const res = await fetch('/api/account/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, code: '' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        accountUser = data.user;
        await amFinishAuth();
        const dn = $('#amDoneNick');
        if (dn) dn.textContent = accountUser.username;
        amSetStep(4);
        setTimeout(closeAccountModal, 2400);
    } catch (err) {
        const msg = err.message || 'Ошибка';
        if (amRegStep === 3 && /email/i.test(msg)) {
            const e1 = $('#amRegErr1');
            if (e1) { e1.textContent = msg; e1.classList.remove('hidden'); }
            amSetStep(1);
        } else if (amRegStep === 3 && /логин|занят/i.test(msg)) {
            const e2 = $('#amRegErr2');
            if (e2) { e2.textContent = msg; e2.classList.remove('hidden'); }
            amSetStep(2);
        } else if (errEl) {
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        }
    } finally {
        btn.disabled = false;
    }
}

function togglePassById(id) {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
}
function toggleAccountPassword() {
    const inp = $('#accountPassword');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
}
function initials(name) { return (name || '?').slice(0, 2).toUpperCase(); }
function updateAccountModal() {
    $('#accountAuth').classList.toggle('hidden', !!accountUser);
    // шапка: гость — кнопка «Войти», вошедший — аватар с меню
    $('#btnLoginHeader')?.classList.toggle('hidden', !!accountUser);
    $('#btnAccount')?.classList.toggle('hidden', !accountUser);
    $('#accountLoggedIn').classList.toggle('hidden', !accountUser);
    if (accountUser) {
        $('#accountUsername').textContent = accountUser.username;
        $('#accountBigAvatar').textContent = initials(accountUser.username);
        $('#statFavorites').textContent = Object.keys(libraryState.favorites || {}).length;
        $('#statHistory').textContent = (recentlyViewed || []).length;
    }
    // шапка: аватар + меню профиля
    refreshHeaderAvatar();
    const nm = $('#acctMenuName'), st = $('#acctMenuStatus');
    if (nm) nm.textContent = accountUser ? accountUser.username : 'Гость';
    if (st) st.innerHTML = accountUser
        ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle"></span>В сети'
        : 'Локальный профиль';
    $('#acctLoginItem')?.classList.toggle('hidden', !!accountUser);
    $('#acctSettingsItem')?.classList.toggle('hidden', !accountUser);
    $('#acctLogoutItem')?.classList.toggle('hidden', !accountUser);
    // мобильная панель
    const sideInit = $('#sideAvatarInit'), sideGuest = $('#sideIconGuest');
    if (accountUser) {
        sideInit.textContent = initials(accountUser.username);
        sideInit.classList.remove('hidden'); sideInit.classList.add('flex');
        sideGuest.classList.add('hidden');
        $('#sideAccountLabel').textContent = accountUser.username;
    } else {
        sideInit.classList.add('hidden'); sideGuest.classList.remove('hidden');
        $('#sideAccountLabel').textContent = 'Вход в аккаунт';
    }
    $('#sideLogoutBtn')?.classList.toggle('hidden', !accountUser);
    // меню аккаунта в шапке
    const lo = $('#acctLogout'); if (lo) lo.classList.toggle('hidden', !accountUser);
    const al = $('#acctLoginLabel'); if (al) al.textContent = accountUser ? accountUser.username : 'Вход в аккаунт';
}
function localProgressState() {
    const prog = safeParse(localStorage.getItem('mediaserver_progress'), {});
    const rt = safeParse(localStorage.getItem('mediaserver_runtime'), {});
    const out = {};
    for (const [k, v] of Object.entries(prog || {})) out[k] = { ...v };
    for (const [k, m] of Object.entries(rt || {})) {
        if (!out[k]) out[k] = {};
        if (Number(m) > 0 && !out[k].runtime) out[k].runtime = Number(m);
    }
    return out;
}

function applyAccountState(d) {
    if (!d) return;
    const hadUser = !!accountUser;
    if (d.library) libraryState = d.library;
    if (d.user) accountUser = d.user;   // ник/почта/Google свежие после смены
    if (d.history) recentlyViewed = d.history;
    if (d.progress) localStorage.setItem('mediaserver_progress', JSON.stringify(d.progress));
    if (d.deleted) deletedState = d.deleted;
    if (Number.isFinite(Number(d.revision))) accountRevision = Number(d.revision);
    saveLibrary(); saveRecent(); saveDeleted();
    refreshVisibleLibrary();
    updateAccountModal();
    if (d.bio !== undefined || d.banner !== undefined || d.avatar !== undefined) {
        window._profileData = {
            bio: d.bio || '', banner: d.banner || '', avatar: d.avatar || '',
            username: accountUser ? accountUser.username : '', createdAt: accountUser ? accountUser.createdAt : null
        };
        refreshHeaderAvatar();
        if (!$('#profileView').classList.contains('hidden')) renderProfile();
    }
    // профиль открыт, а аккаунт тем временем загрузился/обновился —
    // перерисовываем, чтобы имя и статус синхронизации стали верными
    if (!hadUser && accountUser && !$('#profileView').classList.contains('hidden')) renderProfile();
}
function sendAccountAction(action, payload) {
    payload = payload || {};
    if (!accountUser) return Promise.resolve();
    accountPendingActions++;
    const run = async () => {
        try {
            const res = await fetch('/api/account/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
            if (!res.ok) throw new Error(await res.text());
            applyAccountState(await res.json());
        } catch (e) {
            console.warn('Account action failed', e);
            await fetchAccountState(true);
        } finally { accountPendingActions = Math.max(0, accountPendingActions - 1); }
    };
    accountActionQueue = accountActionQueue.then(run, run);
    return accountActionQueue;
}
async function fetchAccountState(force) {
    if (!accountUser || (accountPendingActions && !force)) return;
    try {
        const res = await fetch(`/api/account/state?since=${accountRevision}`, { cache: 'no-store' });
        if (res.status === 304) return;
        if (!res.ok) return;
        applyAccountState(await res.json());
    } catch (e) { console.warn('Account state poll failed', e); }
}
function startAccountPolling() { clearInterval(accountPollTimer); accountPollTimer = setInterval(() => fetchAccountState(false), 2500); }
function stopAccountPolling() { clearInterval(accountPollTimer); accountPollTimer = null; }
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAccountPolling();
    else if (accountUser) { startAccountPolling(); fetchAccountState(true); }
});

async function submitAccount(e) {
    e.preventDefault();
    const error = $('#accountError'); error.classList.add('hidden');
    const submitBtn = $('#accountSubmit');
    $('#accountSubmitText').classList.add('opacity-0');
    $('#accountSubmitLoader').classList.remove('hidden');
    submitBtn.disabled = true;
    try {
        const res = await fetch('/api/account/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: $('#accountLogin').value.trim(), password: $('#accountPassword').value, code: '' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Ошибка');
        accountUser = data.user;
        await amFinishAuth();
        toast('С возвращением, ' + accountUser.username + ' 👋');
        setTimeout(closeAccountModal, 400);
    } catch (err) {
        error.textContent = err.message || 'Не удалось выполнить запрос';
        error.classList.remove('hidden');
    } finally {
        $('#accountSubmitText').classList.remove('opacity-0');
        $('#accountSubmitLoader').classList.add('hidden');
        submitBtn.disabled = false;
    }
}
/* ===== Подтверждение выхода (стиль animeon) ===== */
function openLogoutDialog() {
    $('#logoutDialog')?.classList.remove('hidden');
    lockPageScroll();
}
function closeLogoutDialog() {
    $('#logoutDialog')?.classList.add('hidden');
    unlockPageScroll();
}
function confirmLogout() {
    closeTopDds();
    openLogoutDialog();
}

async function logoutAccount() {
    try { await fetch('/api/account/logout', { method: 'POST' }); } catch (e) { }
    accountUser = null; accountRevision = 0; stopAccountPolling();
    // выходим начисто: локальные библиотека/история/прогресс не должны
    // переживать выход — следующий пользователь их не увидит
    ['mediaserver_library', 'mediaserver_recent', 'mediaserver_progress',
        'mediaserver_runtime', 'mediaserver_deleted'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
    libraryState = {};
    recentlyViewed = [];
    deletedState = { library: {}, history: {}, progress: {} };
    window._profileData = { bio: '', banner: '', avatar: '' };
    listPage = 1;
    lsHistPage = 1;
    updateSidebarCounts();
    updateAccountModal();
    closeLogoutDialog();
    toast('Вы вышли из аккаунта');
    // перерисовываем открытые разделы, чтобы не показывать чужие/старые данные
    if (!$('#gridView').classList.contains('hidden') && currentGridType) {
        if (currentGridType === 'catalog') applyCatalogFilters();
        else if (LIBRARY_META[currentGridType]) openLibrary(currentGridType);
    }
    if (!$('#listView').classList.contains('hidden')) renderList();
    if (!$('#profileView').classList.contains('hidden')) renderProfile();
    if (window._heroKey) updateHeroFavBtn();
}
function confirmDeleteAccount() {
    if (!confirm('Удалить аккаунт без возможности восстановления? Библиотека и история на сервере будут удалены.')) return;
    deleteAccountNow();
}
async function deleteAccountNow() {
    try {
        const res = await fetch('/api/account', { method: 'DELETE' });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.detail || 'Не удалось удалить аккаунт');
        accountUser = null; accountRevision = 0; stopAccountPolling();
        libraryState = {}; recentlyViewed = [];
        localStorage.removeItem('mediaserver_library');
        localStorage.removeItem('mediaserver_recent');
        localStorage.removeItem('mediaserver_progress');
        updateAccountModal();
        closeAccountModal();
        refreshVisibleLibrary();
        toast('Аккаунт удалён');
    } catch (err) {
        toast(err.message || 'Ошибка удаления аккаунт', 'error');
    }
}
async function initAccount() {
    try {
        const res = await fetch('/api/account/me', { cache: 'no-store' });
        if (!res.ok) return;
        accountUser = (await res.json()).user;
        updateAccountModal();
        // аккаунт загрузился ПОСЛЕ того, как роутер уже отрисовал профиль
        // при старте страницы — перерисовываем с верным именем
        if (!$('#profileView').classList.contains('hidden')) renderProfile();
        const state = await fetch('/api/account/state?since=-1', { cache: 'no-store' });
        if (state.ok) applyAccountState(await state.json());
        startAccountPolling();
    } catch (e) { }
}

/* ============================================================
FOOTER + ЮРИДИЧЕСКИЕ СТРАНИЦЫ
============================================================ */
const FOOTER_CONTACTS = {
    //email: 'admin@example.com',   // ← ЗАМЕНИ на свой e-mail
    //telegram: '',                 // ← например '@mychannel' (с @); пусто = блок скрыт
};

const LEGAL_PAGES = {
    terms: {
        title: 'Пользовательское соглашение',
        html: `
<h4>1. Общие положения</h4>
<p>Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует использование сайта MediaServer (далее — «Сервис»). Начало использования Сервиса означает полное и безоговорочное принятие условий Соглашения. Если вы не согласны с условиями — прекратите использование Сервиса.</p>
<h4>2. Описание сервиса</h4>
<p>Сервис предоставляет пользователю интерфейс для поиска, каталогизации и просмотра информации о фильмах, сериалах и аниме, а также ведения личной библиотеки (избранное, статусы просмотра, оценки, история). Видеоконтент предоставляется сторонними плеерами и сервисами, подключаемыми посредством embed-ссылок.</p>
<h4>3. Аккаунт и доступ</h4>
<p>Доступ к Сервису может осуществляться как анонимно (локальные данные хранятся в браузере), так и через учётную запись. Пользователь обязуется не передавать свои учётные данные третьим лицам и несёт ответственность за действия, совершённые под его учётной записью. Администратор вправе ограничить доступ (в том числе по кодам доступа) без объяснения причин.</p>
<h4>4. Права на контент</h4>
<p>Сервис не размещает и не хранит видеофайлы. Все права на контент принадлежат их законным правообладателям. Сервис не несёт ответственности за работу, доступность и содержимое сторонних плееров.</p>
<h4>5. Ограничение ответственности</h4>
<p>Сервис предоставляется «как есть». Не гарантируется бесперебойная работа, актуальность данных и отсутствие ошибок. Сервис не несёт ответственности за любые убытки, возникшие в результате использования или невозможности использования Сервиса.</p>
<h4>6. Заключительные положения</h4>
<p>Администратор вправе изменять условия Соглашения без предварительного уведомления. Действующая редакция всегда доступна на данной странице. Споры решаются путём переписки по контактам, указанным в разделе «Поддержка».</p>`,
    },
    privacy: {
        title: 'Политика конфиденциальности',
        html: `
<h4>1. Общие положения</h4>
<p>Настоящая Политика описывает, какие данные обрабатывает сайт MediaServer (далее — «Сервис») и как они используются.</p>
<h4>2. Какие данные мы обрабатываем</h4>
<ul>
<li><b>Данные аккаунта:</b> логин, пароль (хранится только в виде хеша), дата регистрации.</li>
<li><b>Пользовательский контент:</b> библиотека (избранное, статусы просмотра), история просмотров, оценки, прогресс просмотра, описание профиля.</li>
<li><b>Загружаемые файлы:</b> аватар и баннер профиля, загруженные вами добровольно.</li>
<li><b>Технические данные:</b> cookie-сессия, данные в localStorage браузера, стандартные серверные журналы (IP-адрес, время запросов).</li>
</ul>
<h4>3. Цели обработки</h4>
<p>Данные используются исключительно для работы функционала Сервиса: аутентификация, синхронизация библиотеки между устройствами, отображение профиля и ведение статистики просмотра. Данные не используются для рекламы и не продаются.</p>
<h4>4. Хранение и удаление</h4>
<p>Данные хранятся до момента удаления аккаунта пользователем либо удаления Сервиса. В любой момент вы можете удалить аккаунт (см. «Удаление аккаунта» внизу страницы) — при этом все серверные данные профиля удаляются безвозвратно.</p>
<h4>5. Передача третьим лицам</h4>
<p>Мы не передаём ваши данные третьим лицам, за исключением случаев, предусмотренных законом. Обратите внимание: встроенные сторонние плееры (Kodik, Anilibria, Kinobox и другие) загружаются напрямую вашим браузером с их серверов и могут иметь собственные политики конфиденциальности.</p>
<h4>6. Ваши права</h4>
<p>Вы вправе запросить уточнение или удаление своих данных, написав на почту из раздела «Поддержка».</p>`,
    },
    offer: {
        title: 'Публичная оферта',
        html: `
<h4>1. Предмет оферты</h4>
<p>Настоящий документ является публичной офертой Администратора сайта MediaServer любому дееспособному физическому лицу (далее — «Пользователь») о предоставлении доступа к functionalities Сервиса на условиях, описанных ниже.</p>
<h4>2. Акцепт оферты</h4>
<p>Акцептом (принятием) настоящей оферты является начало использования Сервиса Пользователем, а также регистрация учётной записи. С момента акцепта Пользователь считается согласным со всеми условиями оферты, Пользовательского соглашения и Политики конфиденциальности.</p>
<h4>3. Условия предоставления</h4>
<p>Сервис предоставляется на безвозмездной основе. Администратор не принимает на себя обязательств по бесперебойной работе Сервиса, актуальности данных и технической поддержке в каком-либо объёме. Доступ может быть ограничен или прекращён в любое время по усмотрению Администратора.</p>
<h4>4. Права и обязанности</h4>
<p>Пользователь обязуется использовать Сервис в личных некоммерческих целях, не нарушать работу Сервиса и не использовать учётные записи третьих лиц. Все имущественные права на контент, доступный через Сервис, принадлежат их правообладателям.</p>
<h4>5. Изменение условий</h4>
<p>Администратор вправе в одностороннем порядке изменять условия оферты. Новая редакция вступает в силу с момента публикации на данной странице.</p>`,
    },
    rights: {
        title: 'Информация для правообладателей',
        html: `
<p>Сайт MediaServer не размещает, не хранит и не передаёт пользователям видеофайлы. Все материалы доступны через встраиваемые сторонние плееры (Kodik, Anilibria, Kinobox и другие), работающие независимо от нашего сайта.</p>
<h4>Порядок обращения</h4>
<p>Если вы являетесь правообладателем (или его законным представителем) и считаете, что материалы, доступные через Сервис, нарушают ваши права, направьте обращение на e-mail, указанный в разделе «Поддержка», включив в него:</p>
<ul>
<li>наименование и контакты правообладателя;</li>
<li>ссылку на страницу Сервиса, содержащую спорный материал;</li>
<li>документальное подтверждение прав (номер свидетельства, договор и т.п.);</li>
<li>суть претензии.</li>
</ul>
<p>Обращения рассматриваются в срок до 10 рабочих дней. При подтверждении прав спорная карточка будет удалена из каталога Сервиса.</p>`,
    },
    delete: {
        title: 'Удаление аккаунта',
        html: `
<p>Удаление аккаунта является необратимым. При удалении со всех серверов безвозвратно стираются:</p>
<ul>
<li>учётная запись (логин и хеш пароля);</li>
<li>библиотека: избранное, статусы просмотра, оценки;</li>
<li>история просмотров и прогресс;</li>
<li>загруженные аватар и баннер.</li>
</ul>
<p>Локальные данные в вашем браузере (если вы пользовались без входа) после удаления не изменяются — их можно очистить самостоятельно через настройки браузера.</p>`,
    },
    sitemap: {
        title: 'Карта сайта',
        html: `
<ul class="space-y-2">
<li><a href="/" class="foot-link" onclick="closeLegalModal(); goHome();return false;">Главная</a></li>
<li><a href="/catalog" class="foot-link" onclick="closeLegalModal(); openCatalog();return false;">Каталог</a></li>
<li><a href="/anime" class="foot-link" onclick="closeLegalModal(); openAnime();return false;">Аниме и расписание</a></li>
<li><a href="/random" class="foot-link" onclick="closeLegalModal(); openRandomModal();return false;">Случайный тайтл</a></li>
<li><a href="/favorites" class="foot-link" onclick="closeLegalModal(); openLibrary('favorites');return false;">Избранное</a></li>
<li><a href="/watching" class="foot-link" onclick="closeLegalModal(); openLibrary('watching');return false;">Смотрю</a></li>
<li><a href="/planned" class="foot-link" onclick="closeLegalModal(); openLibrary('planned');return false;">Буду смотреть</a></li>
<li><a href="/watched" class="foot-link" onclick="closeLegalModal(); openLibrary('watched');return false;">Просмотрено</a></li>
<li><a href="/history" class="foot-link" onclick="closeLegalModal(); openLibrary('history');return false;">История просмотров</a></li>
<li><a href="/profile" class="foot-link" onclick="closeLegalModal(); openProfile();return false;">Профиль</a></li>
</ul>`,
    },
};

function openLegalPage(id) {
    const page = LEGAL_PAGES[id];
    if (!page) return;
    $('#legalTitle').textContent = page.title;
    let html = page.html;
    if (id === 'delete') {
        html += accountUser
            ? '<div class="pt-3"><button type="button" class="btn-primary h-11 px-6 rounded-xl text-sm" onclick="closeLegalModal(); confirmDeleteAccount()">Удалить мой аккаунт</button></div>'
            : '<p class="text-xs text-faint pt-3">Вы не вошли в аккаунт — удалять нечего. Удаление доступно после входа.</p>';
    }
    const body = $('#legalBody');
    body.innerHTML = html;
    body.scrollTop = 0;
    $('#legalModal').classList.remove('hidden');
    lockPageScroll();
}
function closeLegalModal() {
    $('#legalModal').classList.add('hidden');
    unlockPageScroll();
}

/* жанры в футере → каталог с готовым фильтром */
function openCatalogWithGenre(genre) {
    catalogGenres.clear();
    if (genre) catalogGenres.add(genre);
    renderGenreUI();
    openCatalog();
}

/* ============================================================
   ШЛЮЗ ДОСТУПА ПО КОДАМ
   ============================================================ */
let gateMode = 'register';
function setGateMode(m) {
    gateMode = m;
    $('#gateTabReg').classList.toggle('btn-primary', m === 'register');
    $('#gateTabReg').classList.toggle('btn-ghost', m !== 'register');
    $('#gateTabLog').classList.toggle('btn-primary', m === 'login');
    $('#gateTabLog').classList.toggle('btn-ghost', m !== 'login');
    $('#gateSubmit').textContent = m === 'register' ? 'Зарегистрироваться' : 'Войти';
    $('#gateCode').placeholder = 'Код доступа';
}
function showGate(mode) {
    const g = $('#accessGate'); if (!g) return;
    if (!g.classList.contains('hidden') && g.dataset.mode === mode) return;
    g.dataset.mode = mode;
    g.classList.remove('hidden');
    lockPageScroll();
    const msg = $('#gateMsg');
    if (mode === 'revoked') {
        msg.innerHTML = '<b style="color:#A67CFF">Код доступа отозван.</b> Аккаунт и история сохранены, но сайт недоступен. Обратитесь к администратору за новым кодом — либо войдите другим аккаунтом.';
        setGateMode('login');
    } else {
        msg.textContent = 'Сайт закрытый. Для доступа нужен личный код администратора.';
        setGateMode('register');
    }
    $('#gateError').classList.add('hidden');
}
function hideGate() {
    $('#accessGate')?.classList.add('hidden');
    unlockPageScroll();
}
async function accessInit() {
    try {
        const res = await fetch('/api/access/status', { cache: 'no-store' });
        const s = await res.json();
        if (s.gate === 'auth' || s.gate === 'revoked') showGate(s.gate);
        else hideGate();
    } catch (e) {
        console.warn('[gate] /api/access/status недоступен:', e);
    }
}
async function gateSubmit(e) {
    e.preventDefault();
    const err = $('#gateError'); err.classList.add('hidden');
    const btn = $('#gateSubmit'); btn.disabled = true;
    try {
        const url = gateMode === 'register' ? '/api/account/register' : '/api/account/login';
        const res = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: $('#gateLogin').value.trim(),
                password: $('#gatePass').value,
                code: $('#gateCode').value.trim(),
            })
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.detail || 'Ошибка');
        location.reload();
    } catch (ex) {
        err.textContent = ex.message; err.classList.remove('hidden');
    } finally { btn.disabled = false; }
}
(() => {
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
        const res = await origFetch(...args);
        if (res.status === 401 || res.status === 403) {
            try {
                const j = await res.clone().json();
                if (j && j.gate) showGate(j.gate);
            } catch (e) { }
        }
        return res;
    };
})();

/* ============================================================
   ФОНОВОЕ СВЕЧЕНИЕ: генерация сфер по высоте страницы
   ============================================================ */
   /* детерминированный ГПСЧ: набор фигур стабилен между перерисовками */
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function buildBgGlow(force) {
    const host = $('#bgGlow'); if (!host) return;
    if (document.body.classList.contains('glow-off')) { host.innerHTML = ''; return; }
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, window.innerHeight);
    const isMobile = window.innerWidth < 768;
    const perScreen = isMobile ? 2.6 : 4.2;              // фигур на экран высотой
    const cap = isMobile ? 18 : 56;
    const count = Math.max(isMobile ? 6 : 8, Math.min(cap, Math.round(docH / window.innerHeight * perScreen)));
    const key = 'fig' + count + ':' + Math.round(docH / 200);   // похожая высота = тот же набор
    if (!force && host.dataset.key === key) return;
    host.dataset.key = key;

    const rnd = mulberry32(20250613);
    // квадраты чаще, точки — мелкий акцент
    const types = ['square', 'square', 'square', 'circle', 'circle', 'diamond', 'dot', 'dot'];
    let html = '';
    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(rnd() * types.length)];
        const top = (rnd() * 100).toFixed(2) + '%';
        const left = (rnd() * 100).toFixed(1) + '%';
        if (type === 'dot') {
            const s = 3 + Math.round(rnd() * 4);          // 3–7px
            html += `<span class="bg-fig bg-fig--dot" style="top:${top};left:${left};width:${s}px;height:${s}px;--fig-dur:${(4 + rnd() * 4).toFixed(1)}s;--fig-del:${(-rnd() * 6).toFixed(1)}s;"></span>`;
        } else {
            const s = 26 + Math.round(rnd() * 72);        // 26–98px
            const from = type === 'diamond' ? 45 : Math.round(rnd() * 90);
            html += `<span class="bg-fig bg-fig--${type}" style="top:${top};left:${left};width:${s}px;height:${s}px;--fig-from:${from}deg;--fig-dur:${(22 + rnd() * 34).toFixed(0)}s;--fig-del:${(-rnd() * 40).toFixed(0)}s;"></span>`;
        }
    }
    host.innerHTML = html;
}

/* пересборка при заметном изменении высоты страницы (смена раздела и т.п.) */
let _glowResizeT = null, _glowLastH = 0;
function watchBgGlow() {
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
            clearTimeout(_glowResizeT);
            _glowResizeT = setTimeout(() => {
                const h = document.body.scrollHeight;
                if (Math.abs(h - _glowLastH) > 150) { _glowLastH = h; buildBgGlow(); }
            }, 250);
        }).observe(document.body);
    }
    window.addEventListener('resize', () => buildBgGlow(true), { passive: true });
}

function applyGlowSetting() {
    const off = localStorage.getItem('mediaserver_glow') === 'off';
    document.body.classList.toggle('glow-off', off);
    if (off) $('#bgGlow').innerHTML = '';
    else { _glowLastH = document.body.scrollHeight; buildBgGlow(true); }
}

function toggleBgGlow(on) {
    localStorage.setItem('mediaserver_glow', on ? 'on' : 'off');
    applyGlowSetting();
    toast(on ? 'Декор включен' : 'Декор выключен');
}

/* ===== Настройки: вкладка «Оформление» ===== */
function stAppearanceTab() {
    const glowOn = localStorage.getItem('mediaserver_glow') !== 'off';
    return `
<section class="st-card">
    <div class="st-card-head">
        <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg><span class="min-w-0">Фоновый декор</span></h3>
        <p>Фиолетовая сетка и геометрические фигуры на фоне сайта. Отключи, если сайт подтормаживает на слабом ПК</p>
    </div>
    <label class="st-toggle">
        <input type="checkbox" ${glowOn ? 'checked' : ''} onchange="toggleBgGlow(this.checked)">
        <span class="st-toggle-track"><span class="st-toggle-knob"></span></span>
        <span class="flex-1 min-w-0">Показывать сетку и фигуры</span>
    </label>
</section>`;
}

/* ============================================================
   INIT
   ============================================================ */
function bindEvents() {
    $('#btnDrawer').addEventListener('click', () => {
        $('#sidebar').classList.contains('open') ? closeDrawer() : openDrawer();
    });
    // hover-раскрытие дропдаунов шапки (стиль animeon).
    // Только для устройств с мышью; на тач — клик как раньше.
    // Задержки: 120мс на открытие (защита от случайного провода курсора),
    // 220мс на закрытие (курсор успевает доехать до пунктов меню).
    if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        [['topCatWrap', 'topCatMenu', 'topCatBtn'],
            ['acctWrap', 'acctMenu', 'btnAccount']].forEach(([wrapId, menuId, btnId]) => {
            const wrap = document.getElementById(wrapId);
            if (!wrap) return;
            let openT = null, closeT = null;
            wrap.addEventListener('mouseenter', () => {
                clearTimeout(closeT);
                if (openT) return;
                openT = setTimeout(() => {
                    openT = null;
                    const m = document.getElementById(menuId);
                    if (!m || !m.classList.contains('hidden')) return;
                    closeTopDds();
                    m.classList.remove('hidden');
                    document.getElementById(btnId)?.setAttribute('aria-expanded', 'true');
                    if (menuId === 'acctMenu') calcAcctStats();
                }, 120);
            });
            wrap.addEventListener('mouseleave', () => {
                clearTimeout(openT); openT = null;
                closeT = setTimeout(() => {
                    const m = document.getElementById(menuId);
                    if (m && !m.classList.contains('hidden')) {
                        m.classList.add('hidden');
                        document.getElementById(btnId)?.setAttribute('aria-expanded', 'false');
                    }
                }, 220);
            });
        });
    }
    // поиск: колесо и палец над модалкой не скроллят страницу —
    // прокручивается только список результатов (#smResults)
    $('#searchModal').addEventListener('wheel', (e) => {
        if (!(e.target instanceof Node) || !e.target.closest('#smResults')) e.preventDefault();
    }, { passive: false });
    $('#searchModal').addEventListener('touchmove', (e) => {
        if (!(e.target instanceof Node) || !e.target.closest('#smResults')) e.preventDefault();
    }, { passive: false });
    // поиск: клик/фокус на строке шапки открывает модальный поиск
    $('#searchInput').addEventListener('mousedown', e => { e.preventDefault(); openSearchModal(); });
    $('#searchInput').addEventListener('focus', () => { openSearchModal(); $('#searchInput').blur(); });
    $('#smInput')?.addEventListener('input', onSmInput);
    $('#smInput')?.addEventListener('keydown', smKeydown);
    $$('.sm-mode').forEach(b => b.addEventListener('click', () => setSmMode(b.dataset.mode)));
    $('#searchInput').addEventListener('focus', () => {
        const q = $('#searchInput').value.trim();
        if (!q || currentGridType === 'search') return;
        if (window._lastSearchQuery !== q || !(window._lastSearchResults || []).length) return;
        renderSearchDropdown(window._lastSearchResults, q);
        $('#searchDropdown').classList.remove('hidden');
        $('#searchInput').setAttribute('aria-expanded', 'true');
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeDrawer();
        closeTopDds();
    });

    document.addEventListener('click', (e) => {
        if (!(e.target instanceof Node && e.target.closest('#topCatWrap, #acctWrap'))) closeTopDds();
        const lsStatusMenu = $('#lsStatusMenu');
        if (lsStatusMenu && !lsStatusMenu.classList.contains('hidden') &&
            !(e.target instanceof Node && e.target.closest('#lsStatusMenu, .ls-status-btn'))) lsStatusMenu.classList.add('hidden');
        const dd = $('#searchDropdown');
        if (dd && !dd.classList.contains('hidden')) {
            if (!(e.target instanceof Node && e.target.closest('#searchWrap'))) dismissSearchDropdown();
        }
        const gp = $('#cfGenrePanel');
        if (gp && !gp.classList.contains('hidden')) {
            if (!(e.target instanceof Node && e.target.closest('#cfGenreWrap'))) gp.classList.add('hidden');
        }
    });

    // Каталог: чипы, Enter, live-фильтры
    $('#cfTypes').addEventListener('click', e => {
        const b = e.target.closest('button[data-ct]');
        if (!b) return;
        $$('#cfTypes button[data-ct]').forEach(x => x.classList.toggle('is-active', x === b));
        applyCatalogFilters();
    });
    let cqTimer = null;
    $('#cfQuery').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); clearTimeout(cqTimer); applyCatalogFilters(); }
    });
    $('#cfQuery').addEventListener('input', () => {
        clearTimeout(cqTimer);
        cqTimer = setTimeout(applyCatalogFilters, 600);
    });
    ['#cfYear1', '#cfYear2'].forEach(s => $(s).addEventListener('change', applyCatalogFilters));
    $('#cfRating').addEventListener('change', applyCatalogFilters);
    $('#cfSort').addEventListener('change', applyCatalogFilters);
    $('#cfRich').addEventListener('change', applyCatalogFilters);

    // Случайное: чипы + live-фильтры
    $('#randomTypeChips').addEventListener('click', e => {
        const b = e.target.closest('button[data-rt]');
        if (b) toggleRandomType(b.dataset.rt);
    });
    ['#rfYear1', '#rfYear2'].forEach(s => $(s).addEventListener('change', loadRandom));
    $('#rfRating').addEventListener('change', loadRandom);

    const modal = document.getElementById('accountModal');
    let pressInside = false;
    modal.addEventListener('pointerdown', (e) => {
        pressInside = !!(e.target instanceof Node && e.target.closest('.modal-panel'));
    }, true);
    modal.addEventListener('click', (e) => {
        if (pressInside) return;
        if (!(e.target instanceof Node) || !e.target.isConnected) return;
        if (!e.target.closest('.modal-panel')) closeAccountModal();
    });
    // поиск по «Моему списку»
    const lsSearch = $('#lsSearch');
    if (lsSearch) {
        let t = null;
        lsSearch.addEventListener('input', () => {
            $('#lsSearchClear')?.classList.toggle('hidden', !lsSearch.value.trim());
            clearTimeout(t);
            t = setTimeout(() => { listPage = 1; renderList(); }, 200);
        });
    }
    bindLsDropBar();
    document.addEventListener('dragover', e => {
        const g = $('#lsDragGhost');
        if (g && !g.classList.contains('hidden')) {
            g.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    }, false);
}

(async function init() {
    await apiReady;
    setAccountMode('login');
    updateSidebarCounts();
    buildGenreList();
    renderGenreUI();
    initCustomSelects();
    bindEvents();
    bindTooltips();
    $('#gateForm').addEventListener('submit', gateSubmit);
    accessInit();
    setInterval(accessInit, 30000);
    loadHome();
    initAccount();
    // вернулись после входа через Google (запасной редирект-поток)
    (() => {
        const q = new URLSearchParams(location.search);
        if (q.get('gok')) {
            toast((q.get('gnew') === '1' ? 'Добро пожаловать, ' : 'С возвращением, ') + q.get('gok') + ' 👋');
            history.replaceState({}, '', '/');
        } else if (q.get('glinked')) {
            toast('✔ Google привязан к аккаунту');
            history.replaceState({}, '', '/settings');
        } else if (q.get('gerr')) {
            toast('Google: ' + q.get('gerr'), 'error');
            history.replaceState({}, '', location.pathname.startsWith('/settings') ? '/settings' : '/');
        }
    })();
    routeFromLocation();
    applyGlowSetting();
    watchBgGlow();
    bindHeroSlider();
    ensureScrollProgressRing();
    ensureTooltips();
    // скролл рядов не всплывает — ловим на capture
    document.addEventListener('scroll', (e) => {
        if (e.target instanceof Element && e.target.classList.contains('row-scroller')) updateRowArrows();
    }, { capture: true, passive: true });
    (() => {
        const btn = $('#scrollTopBtn'); if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('show', window.scrollY > 700);
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    })();
    // футер: год + контакты
    $('#footYear').textContent = new Date().getFullYear();
    const em = $('#footEmail'), emLabel = em ? em.previousElementSibling : null;
    if (em) {
        if (FOOTER_CONTACTS.email) {
            em.textContent = FOOTER_CONTACTS.email;
            em.href = 'mailto:' + FOOTER_CONTACTS.email;
        } else {
            em.style.display = 'none';
            if (emLabel) emLabel.style.display = 'none';
        }
    }
    const tg = $('#footTelegram'), tgLabel = $('#footTgLabel');
    if (tg && tgLabel) {
        if (FOOTER_CONTACTS.telegram) {
            tg.textContent = FOOTER_CONTACTS.telegram;
            tg.href = 'https://t.me/' + FOOTER_CONTACTS.telegram.replace('@', '');
        } else { tg.style.display = 'none'; tgLabel.style.display = 'none'; }
    }
})();