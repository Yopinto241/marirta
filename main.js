// --- Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
  });
}

// --- Quick dropdown (desktop)
const quickBtn = document.getElementById('quickMenuBtn');
const quickMenu = document.getElementById('quickMenu');
if (quickBtn && quickMenu) {
  const closeQuick = () => { quickMenu.classList.add('hidden'); quickBtn.setAttribute('aria-expanded','false'); };
  const toggleQuick = () => {
    const isHidden = quickMenu.classList.contains('hidden');
    document.querySelectorAll('#quickMenu').forEach(m => m.classList.add('hidden'));
    if (isHidden) { quickMenu.classList.remove('hidden'); quickBtn.setAttribute('aria-expanded','true'); }
    else { closeQuick(); }
  };
  quickBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleQuick(); });
  document.addEventListener('click', (e) => { if (!quickMenu.contains(e.target)) closeQuick(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuick(); });
}

// --- Language (simple persist)
const btnSw = document.getElementById('btnSw');
const btnEn = document.getElementById('btnEn');
const btnSwM = document.getElementById('btnSwM');
const btnEnM = document.getElementById('btnEnM');

function setLang(lang) {
  document.documentElement.lang = lang;
  // toggle active states
  [btnSw, btnSwM].forEach(b => b && b.classList.toggle('active', lang==='sw'));
  [btnEn, btnEnM].forEach(b => b && b.classList.toggle('active', lang==='en'));
  localStorage.setItem('site-lang', lang);
  // re-render dynamic sections (news/projects) after lang change
  renderHome();
}
[btnSw, btnSwM].forEach(b => b && b.addEventListener('click', () => setLang('sw')));
[btnEn, btnEnM].forEach(b => b && b.addEventListener('click', () => setLang('en')));
setLang(localStorage.getItem('site-lang') || 'sw');

// --- IntersectionObserver for reveal animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

// --- Fallback assets/content (no data.json required)
const FALLBACK_NEWS = [
  { img:'assets/a1.jpg', title_sw:'Kikao na Wajasiriamali', title_en:'SME Forum', summary:'Kujadili mikopo midogo na masoko mapya.' },
  { img:'assets/a2.jpg', title_sw:'Warsha ya Afya ya Uzazi', title_en:'Health Workshop', summary:'Elimu kwa wasichana kuhusu afya ya uzazi.' },
  { img:'assets/a3.jpg', title_sw:'Ziara ya Shule', title_en:'School Visit', summary:'Kuhamasisha stadi za TEHAMA kwa wanafunzi.' },
  { img:'assets/as.jpg', title_sw:'Kampeni ya Upandaji Miti', title_en:'Tree Planting', summary:'Mazigira bora kwa vizazi vijavyo.' }
];
const FALLBACK_PROJECTS = [
  { img:'assets/m1.jpg', title_sw:'Uwezeshaji wa Vijana', title_en:'Youth Empowerment', desc:'Mafunzo ya ujasiriamali na mitaji midogo.' },
  { img:'assets/m2.jpg', title_sw:'Kituo cha TEHAMA', title_en:'ICT Hub', desc:'Stadi za msingi za TEHAMA kwa vijana.' },
  { img:'assets/m3.jpg', title_sw:'Afya ya Mama na Mtoto', title_en:'Mother & Child Health', desc:'Huduma za elimu na uchunguzi wa awali.' },
  { img:'assets/m4.jpg', title_sw:'Elimu ya Mtoto wa Kike', title_en:'Girl Education', desc:'Msaada wa vifaa vya shule na semina.' }
];
const FALLBACK_SLIDES = ['assets/m5.jpg','assets/m6.jpg','assets/m8.jpg','assets/m9.jpg','assets/mk.jpg','assets/ml.jpg'];

// Helper to attach reveal to children
function revealify(container) {
  if (!container) return;
  container.querySelectorAll('.card').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

// Ensure flip-card container has height matching front face
function sizeFlipContainer(el) {
  if (!el) return;
  const measure = () => {
    const front = el.querySelector('.flip-front');
    if (front) {
      // Force layout update after images load
      const h = front.offsetHeight || front.getBoundingClientRect().height;
      if (h > 0) el.style.height = h + 'px';
    }
  };
  // Recalculate on resize and image load
  measure();
  const imgs = el.querySelectorAll('img');
  imgs.forEach(img => {
    if (img.complete) return;
    img.addEventListener('load', measure);
  });
  window.addEventListener('resize', measure);
}

// --- Load data.json and render home sections
async function getData() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load');
    return await res.json();
  } catch (e) {
    return { news: [], projects: [], gallery: [], speeches: [], partners: [], posts: [], events: [] };
  }
}

async function renderHome() {
  const lang = document.documentElement.lang || 'sw';
  const newsWrap = document.getElementById('homeNewsList');
  const projWrap = document.getElementById('homeProjectsGrid');
  const galWrap  = document.getElementById('homeGalleryGrid');
  const rotNews = document.getElementById('newsRotator');
  const rotProj = document.getElementById('projRotator');
  const sliderTrack = document.getElementById('homeSliderTrack');
  if (!newsWrap && !projWrap && !rotNews && !sliderTrack) return; // not on home

  const data = await getData();

  // News
  if (newsWrap) {
    newsWrap.innerHTML = '';
    const list = (data.news && data.news.length) ? data.news.slice(0,6) : FALLBACK_NEWS;
    list.forEach((n) => {
      const title = n.title_sw && lang==='sw' ? n.title_sw : (n.title_en || n.title_sw || 'Habari');
      const summary = n.summary || '';
      const img = n.img || 'assets/a1.jpg';
      newsWrap.insertAdjacentHTML('beforeend', `
        <div class="card flip-card auto-flip h-64">
          <div class="flip-inner">
            <div class="flip-face flip-front bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <img src="${img}" alt="${title}" class="w-full h-40 object-cover" loading="lazy">
              <div class="p-3 font-semibold">${title}</div>
            </div>
            <a href="news.html" class="flip-face flip-back bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <div class="p-4">
                <h3 class="font-semibold mb-2">${title}</h3>
                ${summary ? `<p class=\"text-gray-700 text-sm mb-3\">${summary}</p>` : ''}
                <span class="text-sky-700 underline">Soma zaidi →</span>
              </div>
            </a>
          </div>
        </div>
      `);
    });
    revealify(newsWrap);
  }

  // Projects
  if (projWrap) {
    projWrap.innerHTML = '';
    const plist = (data.projects && data.projects.length) ? data.projects.slice(0,6) : FALLBACK_PROJECTS;
    plist.forEach((p) => {
      const title = p.title_sw && lang==='sw' ? p.title_sw : (p.title_en || p.title_sw || 'Mradi');
      const desc  = p.desc_sw && lang==='sw' ? p.desc_sw : (p.desc_en || p.desc_sw || '');
      const img = p.img || 'assets/m1.jpg';
      projWrap.insertAdjacentHTML('beforeend', `
        <div class="card flip-card auto-flip h-64">
          <div class="flip-inner">
            <div class="flip-face flip-front bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <img src="${img}" alt="${title}" class="w-full h-40 object-cover" loading="lazy">
              <div class="p-3 font-semibold">${title}</div>
            </div>
            <a href="projects.html" class="flip-face flip-back bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <div class="p-4">
                <h3 class="font-semibold mb-2">${title}</h3>
                ${desc ? `<p class=\"text-gray-700 text-sm mb-3\">${desc}</p>`:''}
                <span class="text-sky-700 underline">Maelezo zaidi →</span>
              </div>
            </a>
          </div>
        </div>
      `);
    });
    revealify(projWrap);
  }

  // Home Gallery (preview)
  if (galWrap) {
    galWrap.innerHTML = '';
    const gimgs = FALLBACK_SLIDES.slice(0,6).map(src => ({img:src}));
    gimgs.forEach(g => {
      galWrap.insertAdjacentHTML('beforeend', `
        <a href="gallery.html" class="card block bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl transition">
          <img src="${g.img}" alt="Picha" class="w-full h-44 object-cover" loading="lazy">
        </a>
      `);
    });
    revealify(galWrap);
  }

  // Rotators (flip every 120s)
  if (rotNews) {
    const front = { imgEl: document.getElementById('newsRotImg'), titleEl: document.getElementById('newsRotTitle'), textEl: document.getElementById('newsRotText') };
    const back  = { imgEl: document.getElementById('newsRotImgB'), titleEl: document.getElementById('newsRotTitleB'), textEl: document.getElementById('newsRotTextB') };
    const items = FALLBACK_NEWS;
    let i = 0; let flipped = false;
    function apply(target, item) {
      if (target.imgEl) target.imgEl.src = item.img;
      if (target.titleEl) target.titleEl.textContent = item.title_sw;
      if (target.textEl) target.textEl.textContent = item.summary;
    }
    apply(front, items[0]); apply(back, items[1] || items[0]);
    // Size the container to avoid collapse with absolute faces
    sizeFlipContainer(rotNews);
    if (!rotNews.classList.contains('flip-hover')) {
      setInterval(() => {
        i = (i + 1) % items.length;
        flipped = !flipped;
        rotNews.classList.toggle('flip-rotated', flipped);
        const target = flipped ? front : back;
        const srcIdx = (i + 1) % items.length;
        apply(target, items[srcIdx]);
      }, 3000);
    }
  }

  if (rotProj) {
    const front = { imgEl: document.getElementById('projRotImg'), titleEl: document.getElementById('projRotTitle'), textEl: document.getElementById('projRotText') };
    const back  = { imgEl: document.getElementById('projRotImgB'), titleEl: document.getElementById('projRotTitleB'), textEl: document.getElementById('projRotTextB') };
    const items = FALLBACK_PROJECTS.map(p => ({ img:p.img, title_sw:p.title_sw, summary:p.desc }));
    let i = 0; let flipped = false;
    function apply(target, item) {
      if (target.imgEl) target.imgEl.src = item.img;
      if (target.titleEl) target.titleEl.textContent = item.title_sw;
      if (target.textEl) target.textEl.textContent = item.summary || '';
    }
    apply(front, items[0]); apply(back, items[1] || items[0]);
    sizeFlipContainer(rotProj);
    if (!rotProj.classList.contains('flip-hover')) {
      setInterval(() => {
        i = (i + 1) % items.length;
        flipped = !flipped;
        rotProj.classList.toggle('flip-rotated', flipped);
        const target = flipped ? front : back;
        const srcIdx = (i + 1) % items.length;
        apply(target, items[srcIdx]);
      }, 3000);
    }
  }

  // Slideshow
  if (sliderTrack) {
    sliderTrack.innerHTML = '';
    FALLBACK_SLIDES.forEach(src => {
      sliderTrack.insertAdjacentHTML('beforeend', `<div class="slider-slide"><img src="${src}" alt="Picha" class="w-full h-64 md:h-96 object-cover"></div>`);
    });
    let idx = 0; const total = FALLBACK_SLIDES.length; let playing = true;
    function go(n){ idx = (n+total)%total; sliderTrack.style.transform = `translateX(-${idx*100}%)`; }
    const prev = document.getElementById('slidePrev');
    const next = document.getElementById('slideNext');
    prev && prev.addEventListener('click', ()=>{ go(idx-1); });
    next && next.addEventListener('click', ()=>{ go(idx+1); });
    setInterval(()=>{ if(playing) go(idx+1); }, 5000);
  }
}

// Additional renders for inner pages
async function renderProjectsPage() {
  const wrap = document.getElementById('projectsGrid');
  const rot = document.getElementById('projPageRotator');
  if (!wrap && !rot) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();

  if (wrap) {
    wrap.innerHTML = '';
    const items = (data.projects && data.projects.length) ? data.projects : FALLBACK_PROJECTS;
    items.forEach(p => {
      const title = p.title_sw && lang==='sw' ? p.title_sw : (p.title_en || p.title_sw || 'Mradi');
      const desc  = p.desc_sw && lang==='sw' ? p.desc_sw : (p.desc_en || p.desc_sw || '');
      wrap.insertAdjacentHTML('beforeend', `
        <article class="card bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl transition">
          <img src="${p.img}" alt="${title}" class="w-full h-44 object-cover" loading="lazy">
          <div class="p-4">
            <h3 class="font-semibold text-lg">${title}</h3>
            ${desc ? `<p class=\"text-gray-700 mt-1\">${desc}</p>`:''}
          </div>
        </article>
      `);
    });
    revealify(wrap);
  }

  if (rot) {
    const front = { imgEl: document.getElementById('projPageRotImg'), titleEl: document.getElementById('projPageRotTitle'), textEl: document.getElementById('projPageRotText') };
    const back  = { imgEl: document.getElementById('projPageRotImgB'), titleEl: document.getElementById('projPageRotTitleB'), textEl: document.getElementById('projPageRotTextB') };
    const items = FALLBACK_PROJECTS.map(p => ({ img:p.img, title_sw:p.title_sw, summary:p.desc }));
    let i = 0; let flipped = false;
    function apply(target, item) {
      if (target.imgEl) target.imgEl.src = item.img;
      if (target.titleEl) target.titleEl.textContent = item.title_sw;
      if (target.textEl) target.textEl.textContent = item.summary || '';
    }
    apply(front, items[0]); apply(back, items[1] || items[0]);
    setInterval(() => {
      i = (i + 1) % items.length;
      flipped = !flipped;
      rot.classList.toggle('flip-rotated', flipped);
      const target = flipped ? front : back;
      const srcIdx = (i + 1) % items.length;
      apply(target, items[srcIdx]);
    }, 120000);
  }
}

async function renderNewsPage() {
  const list = document.getElementById('newsList');
  const rot = document.getElementById('newsPageRotator');
  if (!list && !rot) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();

  if (list) {
    list.innerHTML = '';
    const items = (data.news && data.news.length) ? data.news : FALLBACK_NEWS;
    items.forEach(n => {
      const title = n.title_sw && lang==='sw' ? n.title_sw : (n.title_en || n.title_sw || 'Habari');
      const date = n.date ? new Date(n.date).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '';
      list.insertAdjacentHTML('beforeend', `
        <article class="card bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
          ${date ? `<div class=\"text-sm text-gray-500\">${date}</div>`:''}
          <h3 class="font-semibold mt-1">${title}</h3>
          ${n.summary ? `<p class=\"text-gray-700 mt-1\">${n.summary}</p>` : ''}
          <a class="text-sky-700 hover:underline mt-2 inline-block" href="news.html">Soma zaidi →</a>
        </article>
      `);
    });
    revealify(list);
  }

  if (rot) {
    const front = { imgEl: document.getElementById('newsPageRotImg'), titleEl: document.getElementById('newsPageRotTitle'), textEl: document.getElementById('newsPageRotText') };
    const back  = { imgEl: document.getElementById('newsPageRotImgB'), titleEl: document.getElementById('newsPageRotTitleB'), textEl: document.getElementById('newsPageRotTextB') };
    const items = FALLBACK_NEWS;
    let i = 0; let flipped = false;
    function apply(target, item) {
      if (target.imgEl) target.imgEl.src = item.img;
      if (target.titleEl) target.titleEl.textContent = item.title_sw;
      if (target.textEl) target.textEl.textContent = item.summary;
    }
    apply(front, items[0]); apply(back, items[1] || items[0]);
    setInterval(() => {
      i = (i + 1) % items.length;
      flipped = !flipped;
      rot.classList.toggle('flip-rotated', flipped);
      const target = flipped ? front : back;
      const srcIdx = (i + 1) % items.length;
      apply(target, items[srcIdx]);
    }, 120000);
  }
}

async function renderGalleryPage() {
  const grid = document.getElementById('galleryGrid');
  const vgrid = document.getElementById('videoGrid');
  if (!grid && !vgrid) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();

  if (grid) {
    grid.innerHTML = '';
    (data.gallery || []).filter(g => (g.type || 'image') === 'image').forEach(g => {
      const title = lang === 'sw' ? (g.title_sw || '') : (g.title_en || g.title_sw || '');
      grid.insertAdjacentHTML('beforeend', `
        <figure class="card bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl transition">
          <img src="${g.img}" alt="${title || 'Picha'}" class="w-full h-56 object-cover" loading="lazy">
          ${title ? `<figcaption class=\"p-3 text-sm text-gray-700\">${title}</figcaption>` : ''}
        </figure>
      `);
    });
    revealify(grid);
  }

  if (vgrid) {
    vgrid.innerHTML = '';
    (data.gallery || []).filter(g => (g.type || 'image') === 'video').forEach(g => {
      const title = lang === 'sw' ? (g.title_sw || '') : (g.title_en || g.title_sw || '');
      const src = g.embed || g.url || '';
      vgrid.insertAdjacentHTML('beforeend', `
        <div class="card bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 hover:shadow-xl transition">
          <div class="aspect-video w-full bg-black">
            <iframe src="${src}" title="${title || 'Video'}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
          </div>
          ${title ? `<div class=\"p-3 text-sm text-gray-700\">${title}</div>` : ''}
        </div>
      `);
    });
    revealify(vgrid);
  }
}

// --- Kick off
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderProjectsPage();
  renderNewsPage();
  renderGalleryPage();
  renderSpeechesPage();
  renderPartnersPage();
  renderBlogPage();
  renderEventsPage();
  startAutoFlip();
  highlightActiveNav();
  setupHeaderScroll();
});

// Auto flip all cards with .auto-flip every few seconds (singleton)
let __autoFlipTimer;
function startAutoFlip() {
  if (__autoFlipTimer) return;
  __autoFlipTimer = setInterval(() => {
    document.querySelectorAll('.auto-flip').forEach(card => {
      card.classList.toggle('flip-active');
    });
  }, 3000);
}

// Active nav highlighting (desktop + mobile)
function highlightActiveNav() {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a.nav-link, #mobileMenu a.mobile-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    const match = href === path || (path === '' && (href === 'index.html' || href === './'));
    a.classList.toggle('active', !!match);
  });
}

// Header scroll style toggle
function setupHeaderScroll() {
  const header = document.querySelector('header.sticky');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// New page renders
async function renderSpeechesPage() {
  const wrap = document.getElementById('speechesList');
  if (!wrap) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();
  wrap.innerHTML = '';
  (data.speeches || []).forEach(s => {
    const title = lang === 'sw' ? (s.title_sw || s.title) : (s.title_en || s.title);
    const date = s.date ? new Date(s.date).toLocaleDateString(lang==='sw'?'sw-TZ':'en-GB',{day:'2-digit',month:'long',year:'numeric'}) : '';
    wrap.insertAdjacentHTML('beforeend', `
      <article class="card bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition">
        ${date ? `<div class=\"text-sm text-gray-500\">${date}</div>` : ''}
        <h3 class="font-semibold mt-1">${title}</h3>
        ${s.summary ? `<p class=\"text-gray-700 mt-1\">${lang==='sw'?(s.summary_sw||s.summary):(s.summary_en||s.summary)}</p>` : ''}
        ${s.embed ? `<div class=\"mt-3 aspect-video\"><iframe class=\"w-full h-full\" src=\"${s.embed}\" loading=\"lazy\" frameborder=\"0\" allowfullscreen></iframe></div>`: ''}
        ${s.file ? `<a class=\"text-sky-700 hover:underline mt-2 inline-block\" href=\"${s.file}\">Pakua PDF</a>`: ''}
      </article>
    `);
  });
  revealify(wrap);
}

async function renderPartnersPage() {
  const grid = document.getElementById('partnersGrid');
  if (!grid) return;
  const data = await getData();
  grid.innerHTML = '';
  (data.partners || []).forEach(p => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="card bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-xl transition text-center">
        <img src="${p.logo}" alt="${p.name}" class="mx-auto h-16 object-contain" loading="lazy">
        <div class="font-semibold mt-2">${p.name}</div>
        ${p.desc ? `<p class=\"text-gray-700 text-sm mt-1\">${p.desc}</p>` : ''}
        ${p.link ? `<a class=\"text-sky-700 hover:underline text-sm mt-2 inline-block\" href=\"${p.link}\" target=\"_blank\" rel=\"noopener\">Tembelea tovuti →</a>` : ''}
      </div>
    `);
  });
  revealify(grid);
}

async function renderBlogPage() {
  const list = document.getElementById('blogList');
  if (!list) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();
  list.innerHTML = '';
  (data.posts || []).forEach(b => {
    const title = lang === 'sw' ? (b.title_sw || b.title) : (b.title_en || b.title);
    const date = b.date ? new Date(b.date).toLocaleDateString(lang==='sw'?'sw-TZ':'en-GB',{day:'2-digit',month:'long',year:'numeric'}) : '';
    list.insertAdjacentHTML('beforeend', `
      <article class="card bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition">
        ${date ? `<div class=\"text-sm text-gray-500\">${date}</div>` : ''}
        <h3 class="font-semibold mt-1">${title}</h3>
        ${b.summary ? `<p class=\"text-gray-700 mt-1\">${lang==='sw'?(b.summary_sw||b.summary):(b.summary_en||b.summary)}</p>` : ''}
        ${b.link ? `<a class=\"text-sky-700 hover:underline mt-2 inline-block\" href=\"${b.link}\">Soma zaidi →</a>` : ''}
      </article>
    `);
  });
  revealify(list);
}

async function renderEventsPage() {
  const list = document.getElementById('eventsList');
  if (!list) return;
  const lang = document.documentElement.lang || 'sw';
  const data = await getData();
  list.innerHTML = '';
  (data.events || []).forEach(ev => {
    const title = lang === 'sw' ? (ev.title_sw || ev.title) : (ev.title_en || ev.title);
    const date = ev.date ? new Date(ev.date).toLocaleString(lang==='sw'?'sw-TZ':'en-GB',{weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '';
    list.insertAdjacentHTML('beforeend', `
      <div class="card bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
        <div class="text-sm text-gray-500">${date}</div>
        <div class="font-semibold">${title}</div>
        ${ev.location ? `<div class=\"text-gray-600\">${ev.location}</div>` : ''}
        ${ev.link ? `<a class=\"text-sky-700 hover:underline mt-2 inline-block\" href=\"${ev.link}\">Maelezo zaidi →</a>` : ''}
      </div>
    `);
  });
  revealify(list);
}
