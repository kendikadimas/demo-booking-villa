// ===========================
// VILLA SANTARA — SPA Router
// ===========================

/* -------------------------------------------------------
   DATA
------------------------------------------------------- */
const VILLAS = [
  { id: 1, name: 'Villa Kayu Indah',    price: 2500000, location: 'Ubud, Bali',     img: 'images/villa_1.png',    rating: 4.93, reviews: 128, host: 'Wayan Santara', avatar: 'W' },
  { id: 2, name: 'Villa Kolam Sunrise', price: 3800000, location: 'Seminyak, Bali', img: 'images/villa_2.png',    rating: 4.85, reviews: 94,  host: 'Made Sunari',   avatar: 'M' },
  { id: 3, name: 'Villa Bale Agung',    price: 5500000, location: 'Canggu, Bali',   img: 'images/villa_3.png',    rating: 5.00, reviews: 62,  host: 'Nyoman Rasa',   avatar: 'N' },
  { id: 4, name: 'Villa Tepi Samudra',  price: 7200000, location: 'Jimbaran, Bali', img: 'images/villa_hero.png', rating: 4.97, reviews: 41,  host: 'Ketut Dharma',  avatar: 'K' },
];

/* -------------------------------------------------------
   APP STATE
------------------------------------------------------- */
const State = {
  currentPage: 'home',
  selectedVilla: VILLAS[0],
  booking: {
    name: '', email: '', phone: '', guests: '', occasion: '', request: '',
    checkin: null, checkout: null,
    nights: 0, payment: '', total: 0,
  }
};

const CalState = {
  current: new Date(),
  start: null, end: null, selecting: false,
  bookedRanges: [
    { start: new Date(2026,5,10), end: new Date(2026,5,14) },
    { start: new Date(2026,5,20), end: new Date(2026,5,23) },
    { start: new Date(2026,6,5),  end: new Date(2026,6,9)  },
    { start: new Date(2026,6,18), end: new Date(2026,6,21) },
  ]
};

/* -------------------------------------------------------
   PAGE ROUTER
------------------------------------------------------- */
const PAGES = ['home','detail','booking-step1','booking-step2','booking-step3','success'];

function goTo(pageName, direction = 'forward') {
  const current = document.querySelector('.page.active');
  const next = document.getElementById(`page-${pageName}`);
  if (!next || !current) return;

  const fromClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
  const inClass   = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

  current.classList.add(fromClass);
  next.classList.add('entering', inClass);

  setTimeout(() => {
    current.classList.remove('active', fromClass);
    next.classList.remove('entering', inClass);
    next.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    State.currentPage = pageName;
    updateNavbar(pageName);
    // Re-render Lucide icons in the newly active page
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }, 300);
}

function updateNavbar(page) {
  const searchPill   = document.getElementById('navSearchPill');
  const breadcrumb   = document.getElementById('navBreadcrumb');
  const categories   = document.getElementById('navCategories');
  const breadTitle   = document.getElementById('breadcrumbTitle');

  const isHome = page === 'home';
  searchPill.style.display  = isHome ? '' : 'none';
  categories.style.display  = isHome ? '' : 'none';
  breadcrumb.style.display  = isHome ? 'none' : 'flex';

  const TITLES = {
    'detail':          'Detail Villa',
    'booking-step1':   'Data Diri (1/3)',
    'booking-step2':   'Pembayaran (2/3)',
    'booking-step3':   'Konfirmasi (3/3)',
    'success':         'Booking Berhasil',
  };
  if (breadTitle) breadTitle.textContent = TITLES[page] || '';
}

/* -------------------------------------------------------
   INIT
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Init Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setDateInputMin();
  initNavbar();
  initCategoryFilter();
  initVillaCards();
  initFavorites();
  initDetailPage();   // initDetailPage internally handles calendar events
  initStep1();
  initStep2();
  initStep3();
  initSuccess();
  initScrollTop();
  initSwipeBack();
  updateNavbar('home');
});

/* -------------------------------------------------------
   NAVBAR
------------------------------------------------------- */
function initNavbar() {
  document.getElementById('logoBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (State.currentPage !== 'home') goTo('home', 'back');
  });

  document.getElementById('navBackBtn')?.addEventListener('click', () => {
    const BACK = {
      'detail':        'home',
      'booking-step1': 'detail',
      'booking-step2': 'booking-step1',
      'booking-step3': 'booking-step2',
      'success':       'home',
    };
    const dest = BACK[State.currentPage] || 'home';
    goTo(dest, 'back');
  });

  document.getElementById('heroBookBtn')?.addEventListener('click', () => {
    document.getElementById('villas-section')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('heroListBtn')?.addEventListener('click', () => {
    document.getElementById('villas-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('quickSearchForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const ci = document.getElementById('hs-checkin')?.value;
    const co = document.getElementById('hs-checkout')?.value;
    if (ci) { const d = new Date(ci); d.setHours(0,0,0,0); CalState.start = d; }
    if (co) { const d = new Date(co); d.setHours(0,0,0,0); CalState.end = d; }
    updateNbDate();
    document.getElementById('villas-section')?.scrollIntoView({ behavior: 'smooth' });
    showToast('info', '🔍 Menampilkan villa tersedia untuk tanggal Anda');
  });

  document.getElementById('hostBtn')?.addEventListener('click', () => showToast('info', '🏡 Fitur daftar villa segera hadir!'));
  document.getElementById('userMenuBtn')?.addEventListener('click', () => showToast('info', '👤 Login untuk simpan favorit'));
  document.getElementById('navSearchBtn')?.addEventListener('click', () => document.getElementById('hs-checkin')?.focus());
}

/* -------------------------------------------------------
   CATEGORY FILTER
------------------------------------------------------- */
function initCategoryFilter() {
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const filter = item.dataset.filter;
      document.querySelectorAll('.villa-card').forEach(card => {
        const type = card.dataset.type || '';
        const show = filter === 'all' || type.includes(filter);
        card.style.opacity = show ? '1' : '0';
        card.style.transform = show ? '' : 'scale(0.95)';
        setTimeout(() => { card.style.display = show ? '' : 'none'; }, show ? 0 : 200);
        if (show) { setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10); }
      });
    });
  });
}

/* -------------------------------------------------------
   VILLA CARDS
------------------------------------------------------- */
function initVillaCards() {
  document.querySelectorAll('.villa-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.villa-fav')) return;
      const vid = parseInt(card.dataset.villaId) || 1;
      State.selectedVilla = VILLAS.find(v => v.id === vid) || VILLAS[0];
      loadDetailPage();
      goTo('detail', 'forward');
    });
  });
}

function initFavorites() {
  document.querySelectorAll('.villa-fav').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const active = btn.classList.toggle('active');
      btn.textContent = active ? '❤️' : '🤍';
      showToast(active ? 'success' : 'info', active ? '❤️ Disimpan ke favorit' : 'Dihapus dari favorit');
    });
  });
}

/* -------------------------------------------------------
   DETAIL PAGE
------------------------------------------------------- */
function loadDetailPage() {
  const v = State.selectedVilla;
  setText('detailTitle',    `${v.name} di ${v.location} — Villa Eksklusif`);
  setText('detailRating',   `★ ${v.rating}`);
  setText('detailReviewCount', `${v.reviews} ulasan`);
  setText('detailLocation', v.location);
  setText('detailHostName', `Disewakan oleh ${v.host}`);
  setText('detailHostAvatar', v.avatar);
  setText('detailReviewTitle', `★ ${v.rating} · ${v.reviews} ulasan`);

  setText('cardPrice', `Rp ${v.price.toLocaleString('id-ID')} / malam`);
  setText('cardRating', `★ ${v.rating} · ${v.reviews} ulasan`);

  const imgs = [v.img, 'images/villa_1.png','images/villa_2.png','images/villa_3.png','images/villa_hero.png'];
  ['detailMainPhoto','detailPhoto2','detailPhoto3','detailPhoto4','detailPhoto5'].forEach((id,i) => {
    const el = document.getElementById(id); if(el) el.src = imgs[i] || v.img;
  });

  renderCalendar();
  updatePriceCard();
}

function initDetailPage() {
  // Calendar nav
  document.getElementById('calPrev')?.addEventListener('click', () => {
    CalState.current = new Date(CalState.current.getFullYear(), CalState.current.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById('calNext')?.addEventListener('click', () => {
    CalState.current = new Date(CalState.current.getFullYear(), CalState.current.getMonth() + 1, 1);
    renderCalendar();
  });

  // Booking card date inputs
  document.getElementById('checkIn')?.addEventListener('change', e => {
    const d = new Date(e.target.value); d.setHours(0, 0, 0, 0);
    if (!isNaN(d)) { CalState.start = d; renderCalendar(); updateNbDate(); updatePriceCard(); }
  });
  document.getElementById('checkOut')?.addEventListener('change', e => {
    const d = new Date(e.target.value); d.setHours(0, 0, 0, 0);
    if (!isNaN(d)) { CalState.end = d; renderCalendar(); updateNbDate(); updatePriceCard(); }
  });

  // Reservasi button — always navigate
  document.getElementById('goToBookingBtn')?.addEventListener('click', () => {
    saveBookingState();
    loadSummaries();
    updateSumDateHighlight();
    goTo('booking-step1', 'forward');
  });

  document.getElementById('showAllPhotos')?.addEventListener('click', openGallery);

  // Render calendar on first load
  renderCalendar();
}

/* -------------------------------------------------------
   CALENDAR
------------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const myEl = document.getElementById('calMonthYear');
  if (!grid) return;

  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const yr = CalState.current.getFullYear(), mo = CalState.current.getMonth();
  if (myEl) myEl.textContent = `${MONTHS[mo]} ${yr}`;

  const today = new Date(); today.setHours(0,0,0,0);
  grid.innerHTML = '';

  DAYS.forEach(d => { const el = ce('div','cal-day-name'); el.textContent = d; grid.appendChild(el); });
  for (let i = 0; i < new Date(yr,mo,1).getDay(); i++) grid.appendChild(ce('div','cal-day empty'));

  const dim = new Date(yr,mo+1,0).getDate();
  for (let d = 1; d <= dim; d++) {
    const date = new Date(yr,mo,d); date.setHours(0,0,0,0);
    const el = ce('div','cal-day'); el.textContent = d;
    const isPast = date < today, isBook = isDateBooked(date);
    const isS = CalState.start && date.getTime()===CalState.start.getTime();
    const isE = CalState.end   && date.getTime()===CalState.end.getTime();

    if (isPast||isBook) {
      el.classList.add(isBook?'booked-day':'disabled');
    } else {
      if (date.getTime()===today.getTime()) el.classList.add('today');
      if (isS&&isE)       el.classList.add('selected');
      else if (isS)       el.classList.add('range-start');
      else if (isE)       el.classList.add('range-end');
      else if (inRange(date)) el.classList.add('range');
      el.addEventListener('click', () => clickDay(date));
      el.addEventListener('mouseenter', () => { if (CalState.selecting&&CalState.start&&!CalState.end) hoverDay(date); });
    }
    grid.appendChild(el);
  }
  updateCalDisplay();
  updatePriceCard();
}

function clickDay(date) {
  if (!CalState.selecting || !CalState.start) {
    CalState.start = date; CalState.end = null; CalState.selecting = true;
  } else {
    if (date.getTime()===CalState.start.getTime()) { CalState.start=null; CalState.selecting=false; renderCalendar(); return; }
    const [s,e] = date < CalState.start ? [date,CalState.start] : [CalState.start,date];
    if (rangeBooked(s,e)) { showToast('error','Rentang mengandung tanggal yang sudah dipesan'); CalState.start=null;CalState.end=null;CalState.selecting=false; renderCalendar(); return; }
    CalState.start=s; CalState.end=e; CalState.selecting=false;
    syncDateInputs(); updateNbDate();
  }
  renderCalendar();
}

function hoverDay(hover) {
  document.querySelectorAll('.cal-day:not(.empty):not(.disabled):not(.booked-day)').forEach(el => {
    el.classList.remove('range','range-end');
    const d = parseInt(el.textContent); if (isNaN(d)) return;
    const date = new Date(CalState.current.getFullYear(), CalState.current.getMonth(), d); date.setHours(0,0,0,0);
    const end = hover > CalState.start ? hover : CalState.start;
    if (date > CalState.start && date < end) el.classList.add('range');
    if (date.getTime()===end.getTime()) el.classList.add('range-end');
  });
}

function updateCalDisplay() {
  const fmt = d => d ? d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : 'Pilih tanggal';
  setText('calCheckIn',  fmt(CalState.start));
  setText('calCheckOut', fmt(CalState.end));
  const n = getNights();
  const cn = document.getElementById('calNights');
  if (cn) {
    if (CalState.start && CalState.end) { cn.innerHTML = `<strong>${n} malam</strong> dipilih`; cn.style.background=''; }
    else if (CalState.start) { cn.textContent='Pilih tanggal check-out'; cn.style.background=''; }
    else { cn.textContent='Klik tanggal check-in untuk mulai'; cn.style.background=''; }
  }
}

function isDateBooked(d)  { return CalState.bookedRanges.some(r => d>=r.start && d<=r.end); }
function inRange(d)       { return CalState.start&&CalState.end && d>CalState.start && d<CalState.end; }
function rangeBooked(s,e) { const d=new Date(s); while(d<=e){if(isDateBooked(d))return true;d.setDate(d.getDate()+1);}return false; }
function getNights()      { return CalState.start&&CalState.end ? Math.round((CalState.end-CalState.start)/86400000) : 0; }

function syncDateInputs() {
  const ci=document.getElementById('checkIn'), co=document.getElementById('checkOut');
  if(ci&&CalState.start) ci.value = fmtDate(CalState.start);
  if(co&&CalState.end)   co.value = fmtDate(CalState.end);
}
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fmtDateLong(d) { return d ? d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '—'; }
function fmtDateShort(d){ return d ? d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '—'; }

function updateNbDate() {
  const el = document.getElementById('nbDateDisplay');
  if (!el) return;
  if (CalState.start && CalState.end) {
    el.textContent = `${CalState.start.toLocaleDateString('id-ID',{day:'numeric',month:'short'})} – ${CalState.end.toLocaleDateString('id-ID',{day:'numeric',month:'short'})}`;
  } else el.textContent = 'Tambahkan tanggal';
}

/* -------------------------------------------------------
   PRICE
------------------------------------------------------- */
function calcPrice() {
  const v = State.selectedVilla;
  const nights = getNights();
  const sub     = v.price * nights;
  const cleaning= nights>0 ? 250000 : 0;
  const tax     = Math.round(sub*0.11) + (nights>0?300000:0);
  return { nights, sub, cleaning, tax, total: sub+cleaning+tax, price: v.price };
}

function updatePriceCard() {
  const { nights, sub, cleaning, tax, total, price } = calcPrice();
  const fmt = n => n>0 ? `Rp ${n.toLocaleString('id-ID')}` : '—';
  setText('sumNightLabel', nights>0 ? `Rp ${price.toLocaleString('id-ID')} × ${nights} malam` : `Rp ${price.toLocaleString('id-ID')} / malam`);
  setText('sumSubtotal', fmt(sub));
  setText('sumCleaning', fmt(cleaning));
  setText('sumTax', fmt(tax));
  setText('sumTotal', nights>0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');
}

function loadSummaries() {
  const v = State.selectedVilla;
  const { nights, sub, cleaning, tax, total, price } = calcPrice();
  const fmt = n => n>0 ? `Rp ${n.toLocaleString('id-ID')}` : '—';
  const ci = fmtDateShort(CalState.start), co = fmtDateShort(CalState.end);
  const nl = nights>0 ? `Rp ${price.toLocaleString('id-ID')} × ${nights} malam` : `Rp ${price.toLocaleString('id-ID')}`;

  [1,2,3].forEach(i => {
    setText(`sum${i}Img`,     null, 'src', v.img);
    setText(`sum${i}Type`,    `Villa di ${v.location}`);
    setText(`sum${i}Name`,    v.name);
    setText(`sum${i}Rating`,  v.rating);
    setText(`sum${i}CheckIn`,  ci);
    setText(`sum${i}CheckOut`, co);
    setText(`sum${i}Nights`,  nights>0 ? `${nights} malam` : '—');
    setText(`sum${i}NightLabel`, nl);
    setText(`sum${i}Subtotal`, fmt(sub));
    setText(`sum${i}Cleaning`, fmt(cleaning));
    setText(`sum${i}Tax`,      fmt(tax));
    setText(`sum${i}Total`,    nights>0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');
  });

  State.booking.nights = nights;
  State.booking.total  = total;
  State.booking.checkin  = CalState.start;
  State.booking.checkout = CalState.end;
}

/* -------------------------------------------------------
   SAVE BOOKING STATE
------------------------------------------------------- */
function saveBookingState() {
  State.booking.checkin  = CalState.start;
  State.booking.checkout = CalState.end;
  State.booking.nights   = getNights();
}

/* -------------------------------------------------------
   STEP 1: Data Diri
------------------------------------------------------- */
function initStep1() {
  // Sync step1 date inputs with CalState on page load
  const s1ci = document.getElementById('s1-checkin');
  const s1co = document.getElementById('s1-checkout');

  if (s1ci) {
    s1ci.min = new Date().toISOString().split('T')[0];
    s1ci.addEventListener('change', e => {
      const d = new Date(e.target.value); d.setHours(0,0,0,0);
      if (!isNaN(d)) { CalState.start = d; updateSumDateHighlight(); loadSummaries(); }
    });
  }
  if (s1co) {
    s1co.min = new Date().toISOString().split('T')[0];
    s1co.addEventListener('change', e => {
      const d = new Date(e.target.value); d.setHours(0,0,0,0);
      if (!isNaN(d)) { CalState.end = d; updateSumDateHighlight(); loadSummaries(); }
    });
  }

  document.getElementById('backFromStep1')?.addEventListener('click', () => goTo('detail', 'back'));
  document.getElementById('nextToStep2')?.addEventListener('click', () => {
    // Sync date inputs into CalState first
    const ci = document.getElementById('s1-checkin');
    const co = document.getElementById('s1-checkout');
    if (ci?.value && !CalState.start) { const d=new Date(ci.value);d.setHours(0,0,0,0);CalState.start=d; }
    if (co?.value && !CalState.end)   { const d=new Date(co.value);d.setHours(0,0,0,0);CalState.end=d; }

    if (!validateStep1()) return;
    State.booking.name    = document.getElementById('bk-name').value.trim();
    State.booking.email   = document.getElementById('bk-email').value.trim();
    State.booking.phone   = document.getElementById('bk-phone').value.trim();
    State.booking.guests  = document.getElementById('bk-guests').value;
    State.booking.occasion= document.getElementById('bk-occasion').value;
    State.booking.request = document.getElementById('bk-request').value.trim();
    loadSummaries();
    goTo('booking-step2', 'forward');
  });
}

function updateSumDateHighlight() {
  const s1ci = document.getElementById('s1-checkin');
  const s1co = document.getElementById('s1-checkout');
  const nd   = document.getElementById('s1-nights-display');

  if (s1ci && CalState.start) s1ci.value = fmtDate(CalState.start);
  if (s1co && CalState.end)   s1co.value = fmtDate(CalState.end);

  // Set checkout min = checkin + 1
  if (s1ci?.value && s1co) {
    const nextDay = new Date(CalState.start || s1ci.value);
    nextDay.setDate(nextDay.getDate() + 1);
    s1co.min = fmtDate(nextDay);
  }

  // Show nights count
  if (nd) {
    const n = getNights();
    if (n > 0) {
      nd.textContent = `${n} malam dipilih — Total estimasi: Rp ${calcPrice().total.toLocaleString('id-ID')}`;
      nd.style.display = 'block';
    } else {
      nd.style.display = 'none';
    }
  }
}

function validateStep1() {
  // Check dates first
  if (!CalState.start || !CalState.end) {
    // Highlight the date fields
    document.getElementById('s1-checkin')?.closest('.form-group-ab')?.classList.add('has-error');
    document.getElementById('s1-checkout')?.closest('.form-group-ab')?.classList.add('has-error');
    showToast('error', 'Pilih tanggal check-in dan check-out');
    document.getElementById('s1-date-group')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  if (CalState.end <= CalState.start) {
    showToast('error', 'Tanggal check-out harus setelah check-in');
    return false;
  }

  const fields = [
    { id:'bk-name',   cond: v => v.length >= 2 },
    { id:'bk-email',  cond: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id:'bk-phone',  cond: v => /^[0-9+\-\s()]{8,15}$/.test(v) },
    { id:'bk-guests', cond: v => v !== '' },
  ];
  let ok = true;
  fields.forEach(({ id, cond }) => {
    const el = document.getElementById(id);
    const g  = el?.closest('.form-group-ab');
    if (!el || !cond(el.value.trim())) { g?.classList.add('has-error'); ok = false; }
    else g?.classList.remove('has-error');
  });
  if (!ok) showToast('error', 'Harap isi semua data yang wajib diisi');
  return ok;
}

/* -------------------------------------------------------
   STEP 2: Pembayaran
------------------------------------------------------- */
function initStep2() {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.addEventListener('click', () => selectPayment(m));
    m.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPayment(m);} });
  });

  document.getElementById('backFromStep2')?.addEventListener('click', () => goTo('booking-step1', 'back'));
  document.getElementById('nextToStep3')?.addEventListener('click', () => {
    if (!State.booking.payment) { showToast('error','Pilih metode pembayaran terlebih dahulu'); return; }
    fillReviewPage();
    goTo('booking-step3', 'forward');
  });
}

function selectPayment(selected) {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('selected');
    const c = m.querySelector('.pm-check');
    if (c) c.innerHTML = '<i data-lucide="check" width="14" height="14"></i>';
    if (c) c.style.display = 'none';
  });
  selected.classList.add('selected');
  const c = selected.querySelector('.pm-check');
  if (c) { c.style.display = 'flex'; c.innerHTML = '<i data-lucide="check" width="14" height="14"></i>'; }
  State.booking.payment = selected.querySelector('.pm-name')?.textContent || '';
  renderPaymentFields(selected.dataset.payment);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderPaymentFields(type) {
  const container = document.getElementById('paymentFields');
  if (!container) return;

  if (type === 'cc') {
    container.innerHTML = `
      <div style="margin-top:20px;padding:20px;background:#F7F7F7;border-radius:12px;border:1px solid #DDD;">
        <p style="font-size:13px;font-weight:700;color:#222;margin-bottom:16px;">Detail Kartu Kredit / Debit</p>
        <div class="form-group-ab"><label class="form-label-ab">Nomor Kartu</label><input class="form-input-ab" id="cc-num" type="text" placeholder="1234 5678 9012 3456" maxlength="19" /></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
          <div class="form-group-ab"><label class="form-label-ab">Masa Berlaku</label><input class="form-input-ab" id="cc-exp" type="text" placeholder="MM/YY" maxlength="5" /></div>
          <div class="form-group-ab"><label class="form-label-ab">CVV</label><input class="form-input-ab" id="cc-cvv" type="password" placeholder="&bull;&bull;&bull;" maxlength="4" /></div>
        </div>
        <div class="form-group-ab" style="margin-top:12px;"><label class="form-label-ab">Nama di Kartu</label><input class="form-input-ab" id="cc-name" type="text" placeholder="Sesuai kartu" /></div>
      </div>`;
    document.getElementById('cc-num')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,16);
      e.target.value = v.match(/.{1,4}/g)?.join(' ')||v;
    });
    document.getElementById('cc-exp')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,4);
      if (v.length>=2) v = v.substring(0,2)+'/'+v.substring(2);
      e.target.value = v;
    });
  } else if (type === 'transfer') {
    container.innerHTML = `
      <div style="margin-top:20px;background:#F7F7F7;border-radius:12px;padding:20px;border:1px solid #DDD;">
        <p style="font-size:13px;font-weight:700;color:#222;margin-bottom:14px;">Rekening Tujuan Transfer</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${[['BCA','1234-5678-90'],['Mandiri','9876-5432-10'],['BNI','1111-2222-33'],['BRI','4444-5555-66']].map(([b,n])=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;border-radius:8px;border:1px solid #EEE;">
            <span style="font-size:14px;color:#717171;">${b}</span>
            <strong style="font-size:14px;letter-spacing:1px;">${n}</strong>
          </div>`).join('')}
        </div>
        <div style="margin-top:12px;padding:12px;background:#FFF8F9;border-radius:8px;border:1px solid #FFE4E8;">
          <p style="font-size:12px;color:#FF385C;"><strong>A/N: Villa Santara Indonesia</strong></p>
          <p style="font-size:12px;color:#717171;margin-top:4px;">Kirim bukti transfer ke WhatsApp: <strong>+62 812 3456 7890</strong></p>
        </div>
      </div>`;
  } else if (type === 'va') {
    container.innerHTML = `
      <div style="margin-top:20px;background:#F7F7F7;border-radius:12px;padding:20px;border:1px solid #DDD;">
        <p style="font-size:13px;font-weight:700;color:#222;margin-bottom:14px;">Pilih Bank Virtual Account</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${['BCA VA','Mandiri VA','BNI VA','BRI VA','Permata VA','CIMB VA'].map(b=>`
          <div class="payment-method" style="padding:10px;cursor:pointer;" onclick="this.parentElement.querySelectorAll('.payment-method').forEach(x=>{x.classList.remove('selected');x.style.borderColor='';});this.classList.add('selected');this.style.borderColor='#222';">
            <div class="pm-info"><div class="pm-name" style="font-size:13px;">${b}</div></div>
          </div>`).join('')}
        </div>
        <p style="font-size:12px;color:#717171;margin-top:12px;">Nomor VA akan dikirim ke email setelah konfirmasi.</p>
      </div>`;
  } else if (type === 'qris') {
    container.innerHTML = `
      <div style="margin-top:20px;background:#F7F7F7;border-radius:12px;padding:24px;text-align:center;border:1px solid #DDD;">
        <p style="font-size:13px;font-weight:700;color:#222;margin-bottom:16px;">QRIS — Scan untuk Bayar</p>
        <div style="width:160px;height:160px;margin:0 auto 16px;background:#fff;border:2px solid #DDD;border-radius:12px;display:flex;align-items:center;justify-content:center;">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="50" height="50" rx="4" stroke="#222" stroke-width="4" fill="none"/>
            <rect x="18" y="18" width="24" height="24" rx="2" fill="#222"/>
            <rect x="65" y="5" width="50" height="50" rx="4" stroke="#222" stroke-width="4" fill="none"/>
            <rect x="78" y="18" width="24" height="24" rx="2" fill="#222"/>
            <rect x="5" y="65" width="50" height="50" rx="4" stroke="#222" stroke-width="4" fill="none"/>
            <rect x="18" y="78" width="24" height="24" rx="2" fill="#222"/>
            <rect x="65" y="65" width="8" height="8" fill="#222"/>
            <rect x="78" y="65" width="8" height="8" fill="#222"/>
            <rect x="91" y="65" width="24" height="8" fill="#222"/>
            <rect x="65" y="78" width="8" height="8" fill="#222"/>
            <rect x="78" y="91" width="8" height="8" fill="#222"/>
            <rect x="91" y="78" width="8" height="37" fill="#222"/>
            <rect x="104" y="78" width="11" height="8" fill="#222"/>
          </svg>
        </div>
        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          ${['GoPay','OVO','DANA','ShopeePay','LinkAja'].map(a=>`<span style="font-size:12px;background:#fff;border:1px solid #DDD;padding:4px 10px;border-radius:20px;">${a}</span>`).join('')}
        </div>
        <p style="font-size:12px;color:#717171;">QRIS berlaku selama <strong>15 menit</strong> setelah klik konfirmasi</p>
      </div>`;
  }
}

/* -------------------------------------------------------
   STEP 3: Konfirmasi
------------------------------------------------------- */
function fillReviewPage() {
  const b = State.booking, v = State.selectedVilla;
  const { total } = calcPrice();
  setText('rev-villa',    v.name);
  setText('rev-name',     b.name);
  setText('rev-email',    b.email);
  setText('rev-phone',    b.phone);
  setText('rev-checkin',  fmtDateLong(CalState.start));
  setText('rev-checkout', fmtDateLong(CalState.end));
  setText('rev-nights',   b.nights>0 ? `${b.nights} malam` : '—');
  setText('rev-payment',  b.payment || '—');
  setText('rev-total',    total>0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');
  loadSummaries();
}

function initStep3() {
  document.getElementById('backFromStep3')?.addEventListener('click', () => goTo('booking-step2', 'back'));
  document.getElementById('submitBooking')?.addEventListener('click', submitBooking);
}

/* -------------------------------------------------------
   SUBMIT
------------------------------------------------------- */
function submitBooking() {
  const btn = document.getElementById('submitBooking');
  if (!btn) return;
  btn.textContent = '⏳ Memproses pembayaran...';
  btn.disabled = true;

  setTimeout(() => {
    const b = State.booking, v = State.selectedVilla;
    const { total } = calcPrice();
    const bookId = genId();

    setText('suc-name',     b.name);
    setText('suc-id',       bookId);
    setText('suc-villa',    v.name);
    setText('suc-checkin',  fmtDateLong(CalState.start));
    setText('suc-checkout', fmtDateLong(CalState.end));
    setText('suc-nights',   b.nights>0?`${b.nights} malam`:'—');
    setText('suc-payment',  b.payment||'—');
    setText('suc-total',    total>0?`Rp ${total.toLocaleString('id-ID')}`:'—');
    setText('suc-email',    b.email||'email Anda');

    btn.textContent = '🔒 Konfirmasi & Bayar Sekarang';
    btn.disabled = false;
    goTo('success', 'forward');

    // Reset state for next booking
    CalState.start = null; CalState.end = null;
    State.booking = { name:'',email:'',phone:'',guests:'',occasion:'',request:'',checkin:null,checkout:null,nights:0,payment:'',total:0 };
    ['bk-name','bk-email','bk-phone','bk-request'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
    ['bk-guests','bk-occasion'].forEach(id => { const e=document.getElementById(id); if(e) e.selectedIndex=0; });
    document.getElementById('paymentFields').innerHTML = '';
    document.querySelectorAll('.payment-method').forEach(m => { m.classList.remove('selected'); const c=m.querySelector('.pm-check');if(c)c.textContent=''; });
    syncDateInputs(); updateNbDate(); updatePriceCard();
  }, 2000);
}

function genId() {
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'VS-'+Array.from({length:8},()=>c[Math.floor(Math.random()*c.length)]).join('');
}

/* -------------------------------------------------------
   SUCCESS PAGE
------------------------------------------------------- */
function initSuccess() {
  document.getElementById('sucBackHome')?.addEventListener('click', () => goTo('home', 'back'));
  document.getElementById('sucBookAnother')?.addEventListener('click', () => goTo('home', 'back'));
}

/* -------------------------------------------------------
   GALLERY LIGHTBOX
------------------------------------------------------- */
function openGallery() {
  const imgs = ['images/villa_hero.png','images/villa_1.png','images/villa_2.png','images/villa_3.png'];
  let cur = 0;
  const ov = document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;';
  const closeB = Object.assign(document.createElement('button'),{innerHTML:'✕'});
  closeB.style.cssText='position:absolute;top:20px;right:24px;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:22px;width:48px;height:48px;border-radius:50%;cursor:pointer;';
  closeB.onclick=()=>document.body.removeChild(ov);
  const img=document.createElement('img');
  img.src=imgs[cur]; img.style.cssText='max-width:90vw;max-height:75vh;border-radius:14px;object-fit:contain;';
  const ctr=document.createElement('div');
  ctr.style.cssText='color:#fff;font-size:13px;margin-top:12px;';
  ctr.textContent=`${cur+1} / ${imgs.length}`;
  const navRow=document.createElement('div');
  navRow.style.cssText='display:flex;gap:12px;margin-top:12px;';
  ['‹','›'].forEach((t,i)=>{
    const b=Object.assign(document.createElement('button'),{textContent:t});
    b.style.cssText='background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;width:48px;height:48px;border-radius:50%;cursor:pointer;font-size:20px;';
    b.onclick=()=>{ cur=i===0?(cur-1+imgs.length)%imgs.length:(cur+1)%imgs.length; img.src=imgs[cur]; ctr.textContent=`${cur+1} / ${imgs.length}`; };
    navRow.appendChild(b);
  });
  ov.append(closeB,img,ctr,navRow);
  ov.addEventListener('click',e=>{if(e.target===ov)document.body.removeChild(ov);});
  document.body.appendChild(ov);
}

/* -------------------------------------------------------
   UTILS
------------------------------------------------------- */
function setText(id, val, attr, attrVal) {
  const el = document.getElementById(id);
  if (!el) return;
  if (attr) el[attr] = attrVal;
  else el.textContent = val ?? '';
}
function ce(tag, cls) { const el=document.createElement(tag); el.className=cls; return el; }

function setDateInputMin() {
  const today = new Date().toISOString().split('T')[0];
  ['checkIn','checkOut','hs-checkin','hs-checkout'].forEach(id => {
    const el=document.getElementById(id); if(el) el.min=today;
  });
}

function showToast(type, msg) {
  const c = document.querySelector('.toast-container'); if(!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type==='error'?'error':''}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(()=>{ t.style.transition='all .3s ease'; t.style.opacity='0'; t.style.transform='translateY(10px)'; setTimeout(()=>t.remove(),300); },3500);
}

function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => btn?.classList.toggle('visible', window.scrollY > 500));
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------------------------------------------------------
   MOBILE: Touch swipe back gesture
------------------------------------------------------- */
function initSwipeBack() {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].screenY - touchStartY);
    // Swipe right (from left edge) = go back
    if (dx > 80 && dy < 60 && touchStartX < 40 && State.currentPage !== 'home') {
      document.getElementById('navBackBtn')?.click();
    }
  }, { passive: true });
}

/* -------------------------------------------------------
   MOBILE: isMobile helper
------------------------------------------------------- */
function isMobile() {
  return window.innerWidth <= 600;
}
