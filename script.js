const works = [
  { id:'w1',
     title:'מגזין קוץ — גיליון חופש',
      desc:'תיאור קצר',
      hero:'assets/images/kotz7-hero.jpeg',
       media:[
       {type:'img', src:'assets/images/kotz7-img1.png'},
       {type:'img', src:'assets/images/shraga-hero.jpeg'},
       {type:'img', src:'assets/images/shraga-hero.jpeg'}
      ]},

  { id:'w2',
     title:'הדבר שיותר גדול מאיתנו',
      desc:'הדבר שיותר גדול מאיתנו',
      hero:'assets/images/the-thing-hero.jpg',
      media:[
      {type:'img',src:'assets/images/the-thing-1.jpg'}
    ]},

  { id:'w3',
     title:'ירושוליים',
      desc:'ירושוליים',
      hero:'assets/images/jerusaliam-hero.jpg',
      media:[
      {type:'img',src:'assets/images/w3-1.jpg'}
      ]},

  { id:'w4',
     title:'המדריך לקטסטרופה',
     desc:'תיאור קצר',
     hero:'assets/images/catastrophie-hero.jpg',
     media:[{
     type:'img',src:'assets/images/w4-1.jpg'}
    ]},

  { id:'w5',
    title:'מפת דרכים',
     desc:'תיאור קצר',
     hero:'assets/images/road-map-hero.jpg',
     media:[
     {type:'img', src:'assets/images/w5-1.jpg'}
     ]},

  { id:'w6',
    title:'פונט ליליאן',
     desc:'תיאור קצר',
      hero:'assets/images/lilien-hero.jpg', media:[{type:'img', src:'assets/images/w6-1.jpg'}
      ]},

  { id:'w7',
    title:'פונט שרגא',
    desc:'<p><strong>שרגא</strong> הוא פונט כותרות סריפי, עם השפעות של סוג אות מסוג ״בלאק־לאטר״  — מבלי להתפשר על האופי העברי של האות.</p> <p>הסקיצות הראשונות התחילו ב־2022 בעקבות כרזות של שרגא וייל — ״דיברות השומר הצעיר״. התהליך עבגר דרך הורדה של פרטים שמפריעים לקריאות בעיצוב המקורי ויצירת סגנון אות עכשווית ששומרת על המאפיינים הגוטיים של האותיות המקוריות.</p>',
    hero:'assets/images/shraga-hero.jpeg',
    media:[
      {type:'img', src:'assets/images/w7-1.jpg'}
    ]},

  { id:'w8',
     title:'פונט פושטק',
      desc:'תיאור קצר',
      hero:'assets/images/pustak-hero.jpeg',
      media:[
        {type:'img', src:'assets/images/w8-1.jpg'}
     ]},
  { id:'w9',
     title:'מגזין גחליליות',
     desc:'תיאור קצר',
     hero:'assets/images/gahliliot-hero.jpg',
     media:[
       {type:'img', src:'assets/images/w9-1.jpg'}
     ]
   },
];



const byId = (id) => document.getElementById(id);
const stageEl = byId('stage');
// Ensure stage fills the viewport width without unexpected padding/margins
stageEl.style.margin = '0';
stageEl.style.padding = stageEl.style.padding || '0';
// פדים אסימטריים מעודכנים: קרוב יותר לעליון, רחוק יותר מהתחתון
const PADS = { top: 0, right: 20, bottom: 100, left: 20 };
let maxZ = works.length; // z-index הגבוה הנוכחי

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// בדיקת חפיפה בין שני מלבנים (למניעת חפיפות בוטות)
function rectsIntersect(a, b, gap = 20) {
  return !(
    a.right + gap < b.left - gap ||
    a.left - gap > b.right + gap ||
    a.bottom + gap < b.top - gap ||
    a.top - gap > b.bottom + gap
  );
}
// ניסיון לקרוא מידות – עם fallback ברירת מחדל אם ה-CSS לא נטען עדיין
function measureWrap(wrap){
  // טריק לכפות layout
  void stageEl.offsetWidth;
  let r = wrap.getBoundingClientRect();
  let w = r.width, h = r.height;
  if (!w || !h) {
    // כשרואים 0 זה אומר שלרוב ה-CSS לא נטען/הנתיב ל-styles.css לא נכון
    console.warn('[portfolio] wrap has zero size – using fallback. ודא שהקובץ styles/styles.css נטען נכון');
    w = 300; h = 200; // fallback
  }
  return {w, h};
}

// Clamp a tile inside the viewport with a given padding (default EDGE_PAD).
// Also logs useful coordinates for debugging.
function clampIntoViewport(tile, pads = PADS){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // current box (includes current transform state)
  const rect = tile.getBoundingClientRect();

  let dx = 0, dy = 0;
  if (rect.left   < pads.left)           dx = Math.max(dx, pads.left - rect.left);
  if (rect.right  > vw - pads.right)     dx = Math.min(dx, (vw - pads.right) - rect.right);
  if (rect.top    < pads.top)            dy = Math.max(dy, pads.top - rect.top);
  if (rect.bottom > vh - pads.bottom)    dy = Math.min(dy, (vh - pads.bottom) - rect.bottom);

  if (dx || dy){
    const curLeft = parseFloat(tile.style.left || '0');
    const curTop  = parseFloat(tile.style.top  || '0');
    tile.style.left = (curLeft + dx) + 'px';
    tile.style.top  = (curTop  + dy) + 'px';
  }

  const newRect = tile.getBoundingClientRect();
  console.log('[clamp]', {
    id: tile.dataset.id,
    pads,
    before: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
    after:  { left: newRect.left, top: newRect.top, right: newRect.right, bottom: newRect.bottom },
    viewport: { width: vw, height: vh }
  });
}

let placedRects = [];

function placeRandomly(tile, drift = 0, animScaleUp = 1){
  const stageRect = stageEl.getBoundingClientRect();
  const wrap = tile.querySelector('.thumb-wrap');

  // Read base size (from CSS) and apply random scale 0.9–1.3
  const { w: baseW, h: baseH } = measureWrap(wrap);
  const scale = 0.9 + Math.random() * 0.4; // 0.9–1.3 (קטנה קלה)
  wrap.style.transform = `scale(${scale})`;
  wrap.style.transformOrigin = 'top left';

  // Map scale to blur: smaller scale -> stronger blur (1.0px..3.5px)
  (function(){
    const minS = 0.9, maxS = 1.3;   // scale range in use
    const minB = 1.0, maxB = 3.5;   // blur range in px
    const t = Math.max(0, Math.min(1, (maxS - scale) / (maxS - minS))); // 0..1 (inverted)
    const blurPx = (minB + t * (maxB - minB)).toFixed(2);
    tile.style.setProperty('--blur', `${blurPx}px`);
  })();

  const w = baseW * scale;
  const h = baseH * scale;

  // אסימטרי: קטן יותר למעלה, גדול יותר למטה
  const visualPad = 6;
  const extraScalePx = Math.max(0, Math.ceil((animScaleUp - 1) * Math.max(w, h)));
  const padL = PADS.left  + visualPad + Math.ceil(Math.abs(drift)) + extraScalePx;
  const padR = PADS.right + visualPad + Math.ceil(Math.abs(drift)) + extraScalePx;
  const padT = PADS.top   + visualPad + Math.ceil(Math.abs(drift)) + extraScalePx;
  const padB = PADS.bottom+ visualPad + Math.ceil(Math.abs(drift)) + extraScalePx;

  // Safe placement window: [pad, width - w - pad] × [pad, height - h - pad]
  const minLeft = padL;
  const minTop  = padT;
  const maxLeft = stageRect.width  - w - padR;
  const maxTop  = stageRect.height - h - padB;

  const rangeW = Math.max(0, maxLeft - minLeft);
  const rangeH = Math.max(0, maxTop  - minTop);

  const attemptsMax = 400;
  let attempt = 0;
  let placedRect;

  while (attempt < attemptsMax){
    const left = Math.floor(Math.random() * rangeW) + minLeft;
    // הטיה עדינה כלפי מעלה: חזקת 1.6 יוצרת הסתברות גבוהה יותר לקרוב ל-top
    const top  = Math.floor(Math.pow(Math.random(), 1.6) * rangeH) + minTop;
    const candidate = { left, top, right: left + w, bottom: top + h };
    const clashes = placedRects.some(r => rectsIntersect(r, candidate, 40)); // פיזור גדול יותר
    if(!clashes){ placedRect = candidate; break; }
    attempt++;
  }

  if(!placedRect){
    const left = Math.floor(Math.random() * rangeW) + minLeft;
    // הטיה עדינה כלפי מעלה: חזקת 1.6 יוצרת הסתברות גבוהה יותר לקרוב ל-top
    const top  = Math.floor(Math.pow(Math.random(), 1.6) * rangeH) + minTop;
    placedRect = { left, top, right: left + w, bottom: top + h };
  }

  tile.style.left = placedRect.left + 'px';
  tile.style.top  = placedRect.top + 'px';
  placedRects.push(placedRect);
}




function renderStage(){
  stageEl.innerHTML = '';
  placedRects = [];
  const randomized = shuffle([...works]);

  randomized.forEach((work, idx) => {
    const tile = document.createElement('figure');
    tile.className = 'tile';
    tile.dataset.id = work.id;
    tile.style.zIndex = String(idx + 1);

    const wrap = document.createElement('div');
    wrap.className = 'thumb-wrap';

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = work.hero;
    img.alt = work.title;
    img.loading = 'lazy';

    img.addEventListener('load', () => {
      // after the image knows its natural size, make sure the tile still fits
      clampIntoViewport(tile, PADS);
    });

    // אם יש בעיית נתיב לתמונה – נראה אזהרה בקונסול ועל האריח עצמו
    img.addEventListener('error', () => {
      console.error(`[portfolio] לא ניתן לטעון תמונה: ${img.src}`);
      wrap.style.outline = '2px dashed red';
      wrap.title = 'שגיאת טעינת תמונה – בדוק נתיב';
      // מחליפים לפלייסהולדר כדי שלא תיעלם לגמרי
      img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20">Missing Image</text></svg>`);
    });

    const caption = document.createElement('div');
    caption.className = 'caption';
    const label = document.createElement('span');
    label.className = 'caption-label';
    label.textContent = work.title;
    caption.appendChild(label);

    wrap.appendChild(img);
    wrap.appendChild(caption);
    tile.appendChild(wrap);
    stageEl.appendChild(tile);

    // Floating parameters first, so we can keep tiles inside safe bounds including drift
    const floatDuration = (8 + Math.random() * 6).toFixed(2);   // 8–14s
    const floatMax = 40; // ריחוף מורגש אך עדין
    const floatX = +(Math.random() * 2 * floatMax - floatMax).toFixed(1); // -2.5..+2.5
    const floatY = +(Math.random() * 2 * floatMax - floatMax).toFixed(1); // -2.5..+2.5
    const drift = Math.max(Math.abs(floatX), Math.abs(floatY));

    tile.classList.add('float');
    tile.style.setProperty('--dur', `${floatDuration}s`);
    tile.style.setProperty('--fx', `${floatX}px`);
    tile.style.setProperty('--fy', `${floatY}px`);

    const s0 = (0.99 + Math.random() * 0.01).toFixed(3); // 0.990–1.000
    const s1 = (1.00 + Math.random() * 0.01).toFixed(3); // 1.000–1.010
    tile.style.setProperty('--s0', s0);
    tile.style.setProperty('--s1', s1);

    // Now place the tile with safe margins (EDGE_PAD + drift + breathing scale)
    placeRandomly(tile, drift, parseFloat(s1));

    // clamp inside viewport (guarantee bottom/top/left/right stay within screen)
    clampIntoViewport(tile, PADS);

    tile.addEventListener('mouseenter', () => {
      maxZ += 1;
      tile.style.zIndex = String(maxZ);
    });
    // החשיפה לצבע נשלטת גלובלית ע"י מיקום העכבר
    tile.addEventListener('click', () => openModal(work.id));
  });
  // אתחול מצב חשיפה לפי מיקום עכבר נוכחי
  updateRevealForAllTiles();
}

// מיקום עכבר גלובלי (לברירת מחדל באמצע המסך עד התזוזה הראשונה)
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
// חשיפה לפי רבע: רק אריחים שמרכזם מימין ולמטה מהעכבר (cx>mouseX && cy>mouseY) יהיו בצבע
function updateRevealForAllTiles(){
  const mx = mousePos.x, my = mousePos.y;
  document.querySelectorAll('.tile').forEach(tile => {
    const r  = tile.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const isReveal = (cx > mx) && (cy > my); // רבע ימין-למטה
    tile.classList.toggle('reveal', isReveal);
  });
}


// ===== MODAL =====
const overlay = byId('overlay');
const closeBtn = byId('closeBtn');
const workTitle = byId('workTitle');
const workDesc = byId('workDesc');
const workGallery = byId('workGallery');


function openModal(workId){
  const work = works.find(w => w.id === workId);
  if(!work) return;
  workTitle.textContent = work.title;
  // מאפשר הדגשה עם <strong> בתיאור (התוכן מגיע ממערך works שהוא בשליטתך)
  workDesc.innerHTML = work.desc;
  workGallery.innerHTML = '';
  for(const m of work.media){
    if(m.type === 'img'){
      const im = document.createElement('img');
      im.src = m.src; im.alt = work.title; im.loading = 'lazy';
      im.addEventListener('error', () => console.error(`[portfolio] לא ניתן לטעון מדיה: ${im.src}`));
      workGallery.appendChild(im);
    } else if (m.type === 'video' || m.type === 'gif'){
      const vid = document.createElement('video');
      vid.src = m.src; vid.controls = true; vid.loop = true; vid.playsInline = true; vid.muted = true;
      workGallery.appendChild(vid);
    }
  }
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
  document.body.style.cursor = 'auto'; // show cursor while modal is open
  closeBtn.focus();
}

function closeModal(){
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('no-scroll');
  document.body.style.cursor = 'none'; // hide cursor again when modal closes
}

// סגירה בלחיצה על רקע – כל לחיצה שלא בתוך .modal תסגור
overlay.addEventListener('click', (e) => {
  if (!e.target.closest('.modal')) closeModal();
});
closeBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const isWorkOpen = overlay.classList.contains('open');
  const isAboutOpen = aboutOverlay && aboutOverlay.classList.contains('open');
  if (isWorkOpen) closeModal();
  if (isAboutOpen) {
    aboutOverlay.setAttribute('aria-hidden', 'true');
    aboutOverlay.classList.remove('open');
  }
});

// אל תסגור/תפתח כשנלחץ בתוך גוף המודל
document.querySelector('.modal')?.addEventListener('click', (e) => e.stopPropagation());
document.querySelector('.about-modal')?.addEventListener('click', (e) => e.stopPropagation());

// ===== INIT =====
renderStage();

// ===== Crosshair follow mouse (robust) =====
function initCrosshair(){
  const h = document.querySelector('.crosshair-h');
  const v = document.querySelector('.crosshair-v');

  let moves = 0;
  const onMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    if (h) h.style.top  = y + 'px';
    if (v) v.style.left = x + 'px';
    mousePos.x = x;
    mousePos.y = y;
    updateRevealForAllTiles();
    if (++moves % 50 === 0) { console.log('[crosshair] move', x, y); }
  };
  window.addEventListener('mousemove', onMove, { passive: true });
}

// נריץ אחרי שהדף נטען לחלוטין (כולל הוספת ה-crosshair ל-DOM)
window.addEventListener('load', initCrosshair, { once: true });

// fallback: אם המסמך כבר נטען, תריץ עכשיו
if (document.readyState !== 'loading') {
  initCrosshair();
}
// Re-clamp all tiles on resize to keep them inside the viewport
window.addEventListener('resize', () => {
  document.querySelectorAll('.tile').forEach(t => clampIntoViewport(t, PADS));
  updateRevealForAllTiles();
});

// Hide the mouse cursor globally
document.body.style.cursor = 'none';

// ===== Reload button: spin icon then refresh =====
(function(){
  const btn = document.getElementById('reloadBtn');
  if(!btn) return;
  let busy = false;
  btn.addEventListener('click', () => {
    if(busy) return;
    busy = true;
    btn.classList.add('spin');
    setTimeout(() => {
      btn.classList.remove('spin');
      location.reload();
    }, 1500); // 1.5s
  });
})();

const aboutBtn = document.getElementById('aboutBtn');
const aboutOverlay = document.getElementById('aboutOverlay');
const aboutCloseBtn = document.getElementById('aboutCloseBtn');

// סגירה בלחיצה על רקע של חלון האודות – כל לחיצה שלא בתוך .about-modal תסגור
aboutOverlay.addEventListener('click', (e) => {
  if (!e.target.closest('.about-modal')) {
    aboutOverlay.setAttribute('aria-hidden', 'true');
    aboutOverlay.classList.remove('open');
  }
});

aboutBtn.addEventListener('click', () => {
  aboutOverlay.setAttribute('aria-hidden', 'false');
  aboutOverlay.classList.add('open');
  document.body.style.cursor = 'default';
});

aboutCloseBtn.addEventListener('click', () => {
  aboutOverlay.setAttribute('aria-hidden', 'true');
  aboutOverlay.classList.remove('open');
});