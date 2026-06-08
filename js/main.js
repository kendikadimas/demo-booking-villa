// ===========================
// VILLA SANTARA — MAIN JS (Airbnb Style)
// ===========================

/* -------------------------------------------------------
   DATA
------------------------------------------------------- */
const VILLAS = [
  { id: 1, name: 'Villa Kayu Indah',    price: 2500000, location: 'Ubud, Bali',      img: 'images/villa_1.png', rating: 4.93, reviews: 128 },
  { id: 2, name: 'Villa Kolam Sunrise', price: 3800000, location: 'Seminyak, Bali',  img: 'images/villa_2.png', rating: 4.85, reviews: 94  },
  { id: 3, name: 'Villa Bale Agung',    price: 5500000, location: 'Canggu, Bali',    img: 'images/villa_3.png', rating: 5.00, reviews: 62  },
  { id: 4, name: 'Villa Tepi Samudra',  price: 7200000, location: 'Jimbaran, Bali',  img: 'images/villa_hero.png', rating: 4.97, reviews: 41 },
];

let selectedVillaId = 1; // default

/* -------------------------------------------------------
   STATE
------------------------------------------------------- */
const CalState = {
  current: new Date(),
  start: null,
  end: null,
  selecting: false,
  bookedRanges: [
    { start: new Date(2026, 5, 10), end: new Date(2026, 5, 14) },
    { start: new Date(2026, 5, 20), end: new Date(2026, 5, 23) },
    { start: new Date(2026, 6, 5),  end: new Date(2026, 6, 9)  },
    { start: new Date(2026, 6, 18), end: new Date(2026, 6, 21) },
  ]
};

/* -------------------------------------------------------
   INIT
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initCalendar();
  initCategoryFilter();
  initVillaCards();
  initBookingFlow();
  initPaymentMethods();
  initStepAccordion();
  initScrollReveal();
  initScrollTop();
  initQuickSearch();
  initFavorites();
  setDateInputMin();
  updateNbDateDisplay();
  updatePriceSummary();
});

/* -------------------------------------------------------
   NAVBAR
------------------------------------------------------- */
function initNavbar() {
  document.getElementById('navSearch')?.addEventListener('click', () => {
    document.getElementById('hs-checkin')?.focus();
    document.querySelector('.hero-searchbar-section')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('hostBtn')?.addEventListener('click', () =>
    showToast('info', '🏡 Daftarkan villa Anda — fitur segera hadir!')
  );
  document.getElementById('userMenuBtn')?.addEventListener('click', () =>
    showToast('info', '👤 Login untuk menyimpan properti favorit')
  );
}

/* -------------------------------------------------------
   MOBILE NAV
------------------------------------------------------- */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');
  const closeBtn  = document.getElementById('mobileNavClose');

  const open  = () => { mobileNav?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const close = () => { mobileNav?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

  hamburger?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', close));
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
        if (show) {
          card.style.display = '';
          requestAnimationFrame(() => card.style.opacity = '1');
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });
}

/* -------------------------------------------------------
   VILLA CARDS — click selects villa and jumps to detail
------------------------------------------------------- */
function initVillaCards() {
  document.querySelectorAll('.villa-card').forEach((card, idx) => {
    card.addEventListener('click', e => {
      if (e.target.closest('.villa-fav')) return;
      selectedVillaId = VILLAS[idx]?.id || 1;
      updateVillaInBookingCard();
      document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function updateVillaInBookingCard() {
  const v = VILLAS.find(x => x.id === selectedVillaId) || VILLAS[0];
  const priceEl = document.querySelector('.booking-card-price');
  if (priceEl) priceEl.innerHTML = `Rp ${v.price.toLocaleString('id-ID')} <span>/ malam</span>`;
  const ratingEl = document.querySelector('.booking-card-rating');
  if (ratingEl) ratingEl.innerHTML = `★ ${v.rating} · <a href="#reviews">${v.reviews} ulasan</a>`;
  // summary card
  const sImg  = document.getElementById('summaryVillaImg');
  const sName = document.getElementById('summaryVillaName');
  const sType = document.querySelector('.svi-type');
  if (sImg)  sImg.src = v.img;
  if (sName) sName.textContent = v.name;
  if (sType) sType.textContent = `Villa di ${v.location}`;
  updatePriceSummary();
}

/* -------------------------------------------------------
   CALENDAR
------------------------------------------------------- */
function initCalendar() {
  renderCalendar();
  document.getElementById('calPrev')?.addEventListener('click', () => {
    CalState.current = new Date(CalState.current.getFullYear(), CalState.current.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById('calNext')?.addEventListener('click', () => {
    CalState.current = new Date(CalState.current.getFullYear(), CalState.current.getMonth() + 1, 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const monthYearEl = document.getElementById('calMonthYear');
  if (!grid) return;

  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const year   = CalState.current.getFullYear();
  const month  = CalState.current.getMonth();
  if (monthYearEl) monthYearEl.textContent = `${MONTHS[month]} ${year}`;

  const today      = new Date(); today.setHours(0,0,0,0);
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  grid.innerHTML = '';

  DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name'; el.textContent = d;
    grid.appendChild(el);
  });
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d); date.setHours(0,0,0,0);
    const el = document.createElement('div');
    el.className = 'cal-day'; el.textContent = d;
    el.setAttribute('role','gridcell');
    el.setAttribute('aria-label', date.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}));

    const isPast   = date < today;
    const isBooked = isDateBooked(date);
    const isToday  = date.getTime() === today.getTime();
    const isStart  = CalState.start && date.getTime() === CalState.start.getTime();
    const isEnd    = CalState.end   && date.getTime() === CalState.end.getTime();
    const inRange  = isInRange(date);

    if (isPast || isBooked) {
      el.classList.add(isBooked ? 'booked-day' : 'disabled');
      if (isBooked) el.title = 'Sudah dipesan';
      el.setAttribute('aria-disabled','true');
    } else {
      if (isToday) el.classList.add('today');
      if (isStart && isEnd)   el.classList.add('selected');
      else if (isStart)       el.classList.add('range-start');
      else if (isEnd)         el.classList.add('range-end');
      else if (inRange)       el.classList.add('range');

      el.addEventListener('click', () => handleDayClick(date));
      el.addEventListener('mouseenter', () => {
        if (CalState.selecting && CalState.start && !CalState.end) previewRange(date);
      });
    }
    grid.appendChild(el);
  }

  updateCalDisplay();
  updatePriceSummary();
}

function handleDayClick(date) {
  if (!CalState.selecting || !CalState.start) {
    CalState.start = date; CalState.end = null; CalState.selecting = true;
  } else {
    if (date.getTime() === CalState.start.getTime()) {
      CalState.start = null; CalState.selecting = false; renderCalendar(); return;
    }
    const [s, e] = date < CalState.start ? [date, CalState.start] : [CalState.start, date];
    if (rangeHasBooked(s, e)) {
      showToast('error', '⚠️ Rentang tanggal mengandung hari yang sudah dipesan');
      CalState.start = null; CalState.end = null; CalState.selecting = false;
      renderCalendar(); return;
    }
    CalState.start = s; CalState.end = e; CalState.selecting = false;
    syncToFormInputs();
    updateNbDateDisplay();
    updateSummaryDates();
  }
  renderCalendar();
}

function previewRange(hover) {
  document.querySelectorAll('.cal-day:not(.empty):not(.disabled):not(.booked-day)').forEach(el => {
    el.classList.remove('range','range-end');
    const d = parseInt(el.textContent);
    if (isNaN(d)) return;
    const date = new Date(CalState.current.getFullYear(), CalState.current.getMonth(), d);
    date.setHours(0,0,0,0);
    const end = hover > CalState.start ? hover : CalState.start;
    if (date > CalState.start && date < end) el.classList.add('range');
    if (date.getTime() === end.getTime()) el.classList.add('range-end');
  });
}

function isDateBooked(d) { return CalState.bookedRanges.some(r => d >= r.start && d <= r.end); }
function isInRange(d)    { return CalState.start && CalState.end && d > CalState.start && d < CalState.end; }
function rangeHasBooked(s, e) { const d = new Date(s); while(d <= e){ if(isDateBooked(d)) return true; d.setDate(d.getDate()+1);} return false; }

function updateCalDisplay() {
  const fmt = d => d ? d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : 'Pilih tanggal';
  const e1 = document.getElementById('calCheckIn');
  const e2 = document.getElementById('calCheckOut');
  const calN = document.getElementById('calNights');
  if (e1) e1.textContent = fmt(CalState.start);
  if (e2) e2.textContent = fmt(CalState.end);

  if (CalState.start && CalState.end) {
    const n = getNights();
    if (calN) calN.innerHTML = `🌙 <strong>${n} malam</strong> dipilih — lihat detail harga di kanan`;
    calN.style.background = '#FFF8F9';
  } else if (CalState.start) {
    if (calN) { calN.textContent = '📅 Sekarang klik tanggal check-out'; calN.style.background = '#FFFBF0'; }
  } else {
    if (calN) { calN.textContent = '📅 Klik tanggal check-in di kalender'; calN.style.background = '#F7F7F7'; }
  }
}

function getNights() {
  if (!CalState.start || !CalState.end) return 0;
  return Math.round((CalState.end - CalState.start) / 86400000);
}

function fmtDateInput(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function syncToFormInputs() {
  const ci = document.getElementById('checkIn');
  const co = document.getElementById('checkOut');
  if (ci && CalState.start) ci.value = fmtDateInput(CalState.start);
  if (co && CalState.end)   co.value = fmtDateInput(CalState.end);
}

function updateNbDateDisplay() {
  const el = document.getElementById('nbDateDisplay');
  if (!el) return;
  if (CalState.start && CalState.end) {
    const s = CalState.start.toLocaleDateString('id-ID',{day:'numeric',month:'short'});
    const e = CalState.end.toLocaleDateString('id-ID',{day:'numeric',month:'short'});
    el.textContent = `${s} – ${e}`;
  } else {
    el.textContent = 'Tambahkan tanggal';
  }
}

/* -------------------------------------------------------
   PRICE SUMMARY
------------------------------------------------------- */
function updatePriceSummary() {
  const v       = VILLAS.find(x => x.id === selectedVillaId) || VILLAS[0];
  const price   = v.price;
  const nights  = getNights();
  const subtotal = price * nights;
  const cleaning = nights > 0 ? 250000 : 0;
  const tax      = Math.round(subtotal * 0.11) + (nights > 0 ? 300000 : 0);
  const total    = subtotal + cleaning + tax;
  const fmt      = n => n > 0 ? `Rp ${n.toLocaleString('id-ID')}` : '—';

  // --- Booking Card (right on detail page)
  set('sumNightLabel', nights > 0 ? `Rp ${price.toLocaleString('id-ID')} × ${nights} malam` : `Rp ${price.toLocaleString('id-ID')} / malam`);
  set('sumSubtotal', fmt(subtotal));
  set('sumCleaning', fmt(cleaning));
  set('sumTax', fmt(tax));
  set('sumTotal', nights > 0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');

  // --- Summary Card (booking page)
  set('sumNightLabelB', nights > 0 ? `Rp ${price.toLocaleString('id-ID')} × ${nights} malam` : `Rp ${price.toLocaleString('id-ID')} / malam`);
  set('sumSubtotalB', fmt(subtotal));
  set('sumCleaningB', fmt(cleaning));
  set('sumTaxB', fmt(tax));
  set('sumTotalB', nights > 0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');

  updateSummaryDates();
}

function updateSummaryDates() {
  const el = document.getElementById('summaryDates');
  if (!el) return;
  if (CalState.start && CalState.end) {
    const s = CalState.start.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
    const e = CalState.end.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
    const n = getNights();
    el.textContent = `${s} → ${e} (${n} malam)`;
  } else {
    el.textContent = 'Belum dipilih';
  }
}

function set(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

/* -------------------------------------------------------
   DATE INPUT MIN
------------------------------------------------------- */
function setDateInputMin() {
  const today = new Date().toISOString().split('T')[0];
  ['checkIn','checkOut','hs-checkin','hs-checkout'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
}

/* -------------------------------------------------------
   BOOKING FLOW
------------------------------------------------------- */
function initBookingFlow() {
  // Sync date inputs → calendar
  document.getElementById('checkIn')?.addEventListener('change', e => {
    const d = new Date(e.target.value); d.setHours(0,0,0,0);
    if (!isNaN(d.getTime())) {
      CalState.start = d;
      if (CalState.end && CalState.end <= CalState.start) { CalState.end = null; const co = document.getElementById('checkOut'); if(co) co.value=''; }
      renderCalendar(); updateNbDateDisplay(); updateSummaryDates();
    }
  });
  document.getElementById('checkOut')?.addEventListener('change', e => {
    const d = new Date(e.target.value); d.setHours(0,0,0,0);
    if (!isNaN(d.getTime())) { CalState.end = d; renderCalendar(); updateNbDateDisplay(); updateSummaryDates(); }
  });

  // "Reservasi" button → go to booking page
  document.getElementById('openBookingPanel')?.addEventListener('click', () => {
    if (!CalState.start || !CalState.end) {
      showToast('error', '⚠️ Pilih tanggal check-in dan check-out di kalender terlebih dahulu');
      document.getElementById('booking-calendar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    goToBookingPage();
  });

  // "Pesan Sekarang" hero button → scroll to detail
  document.querySelectorAll('a[href="#booking"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      if (document.getElementById('booking')?.style.display !== 'none' && document.getElementById('booking')?.style.display !== '') {
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      } else {
        document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Back button
  document.getElementById('backToDetail')?.addEventListener('click', goToDetailPage);

  // Submit (confirm & pay)
  document.getElementById('submitBooking')?.addEventListener('click', submitBooking);

  // Villa cards → detail
  document.querySelectorAll('.villa-card').forEach((card, idx) => {
    card.addEventListener('click', e => {
      if (e.target.closest('.villa-fav')) return;
      selectedVillaId = idx + 1;
      updateVillaInBookingCard();
      document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Photo grid show all
  document.getElementById('showAllPhotos')?.addEventListener('click', openGalleryLightbox);

  // Modal
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('successModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('modalSeeMore')?.addEventListener('click', () => { closeModal(); document.getElementById('villas')?.scrollIntoView({ behavior: 'smooth' }); });
}

function goToBookingPage() {
  updatePriceSummary();
  resetSteps();
  document.getElementById('detail').style.display  = 'none';
  document.getElementById('booking').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToDetailPage() {
  document.getElementById('booking').style.display = 'none';
  document.getElementById('detail').style.display  = '';
  document.getElementById('bookingCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* -------------------------------------------------------
   STEP ACCORDION
------------------------------------------------------- */
function initStepAccordion() {
  // Steps are: step1 (data diri), step2 (pembayaran), step3 (konfirmasi)
  // Step 1 is open by default. Next button expands next step.
  document.getElementById('nextStep1')?.addEventListener('click', () => {
    if (!validateStep1()) return;
    openStep(2);
  });
  document.getElementById('nextStep2')?.addEventListener('click', () => {
    openStep(3);
  });
}

function openStep(n) {
  [1,2,3].forEach(i => {
    const step    = document.getElementById(`step${i}`);
    const body    = document.getElementById(`step${i}Body`);
    const chevron = document.getElementById(`step${i}Chevron`);
    if (!step || !body) return;
    if (i <= n) {
      body.style.display = '';
      if (chevron) chevron.textContent = '∧';
      step.style.borderColor = '#222';
    } else {
      body.style.display = 'none';
      if (chevron) chevron.textContent = '∨';
      step.style.borderColor = '#DDDDDD';
    }
  });

  // If opening step 3, fill review summary
  if (n === 3) {
    const nights = getNights();
    const v = VILLAS.find(x => x.id === selectedVillaId) || VILLAS[0];
    const total = (v.price * nights) + 250000 + Math.round(v.price * nights * 0.11) + 300000;
    const pm = document.querySelector('.payment-method.selected .pm-name')?.textContent || '—';

    set('reviewPayment', pm);
    set('reviewTotal', nights > 0 ? `Rp ${total.toLocaleString('id-ID')}` : '—');

    if (CalState.start && CalState.end) {
      const s = CalState.start.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
      const e = CalState.end.toLocaleDateString('id-ID',   { day:'numeric', month:'short', year:'numeric' });
      set('reviewDates', `${s} → ${e}`);
    } else {
      set('reviewDates', '—');
    }
  }

  const firstInput = document.querySelector(`#step${n}Body input, #step${n}Body select`);
  firstInput?.focus();
}

function resetSteps() {
  [1,2,3].forEach(i => {
    const body = document.getElementById(`step${i}Body`);
    if (body) body.style.display = i === 1 ? '' : 'none';
    const step = document.getElementById(`step${i}`);
    if (step) step.style.borderColor = i === 1 ? '#222' : '#DDDDDD';
  });
}

function validateStep1() {
  const name  = document.getElementById('bk-name')?.value?.trim();
  const email = document.getElementById('bk-email')?.value?.trim();
  const phone = document.getElementById('bk-phone')?.value?.trim();
  let valid = true;
  const check = (id, cond) => {
    const g = document.getElementById(id)?.closest('.form-group-ab');
    if (!cond) { g?.classList.add('has-error'); valid = false; }
    else g?.classList.remove('has-error');
  };
  check('bk-name',  name && name.length >= 2);
  check('bk-email', email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  check('bk-phone', phone && /^[0-9+\-\s()]{8,15}$/.test(phone));
  if (!valid) showToast('error', '⚠️ Harap isi semua data dengan benar');
  return valid;
}

/* -------------------------------------------------------
   PAYMENT METHODS — expand fields on select
------------------------------------------------------- */
function initPaymentMethods() {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.addEventListener('click', () => selectPayment(m));
    m.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); selectPayment(m); }});
  });
}

function selectPayment(selected) {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('selected');
    m.setAttribute('aria-pressed','false');
    const chk = m.querySelector('.pm-check');
    if (chk) chk.textContent = '';
  });
  selected.classList.add('selected');
  selected.setAttribute('aria-pressed','true');
  const chk = selected.querySelector('.pm-check');
  if (chk) chk.textContent = '✓';

  // Show payment detail fields
  const type = selected.dataset.payment;
  renderPaymentFields(type);
}

function renderPaymentFields(type) {
  const container = document.getElementById('paymentFields');
  if (!container) return;
  container.innerHTML = '';

  const wrap = (label, html) => `
    <div class="form-group-ab" style="margin-top:14px;">
      <label class="form-label-ab">${label}</label>
      ${html}
    </div>`;

  if (type === 'cc') {
    container.innerHTML = `
      ${wrap('Nomor Kartu', `<input class="form-input-ab" id="cc-num" type="text" placeholder="1234 5678 9012 3456" maxlength="19" />`)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;">
        <div class="form-group-ab">
          <label class="form-label-ab">Masa Berlaku</label>
          <input class="form-input-ab" id="cc-exp" type="text" placeholder="MM/YY" maxlength="5" />
        </div>
        <div class="form-group-ab">
          <label class="form-label-ab">CVV</label>
          <input class="form-input-ab" id="cc-cvv" type="password" placeholder="•••" maxlength="4" />
        </div>
      </div>
      ${wrap('Nama di Kartu', `<input class="form-input-ab" id="cc-name" type="text" placeholder="Sesuai kartu" />`)}`;
    // Format card number
    document.getElementById('cc-num')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,16);
      e.target.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });
    document.getElementById('cc-exp')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'').substring(0,4);
      if (v.length >= 2) v = v.substring(0,2)+'/'+v.substring(2);
      e.target.value = v;
    });
  } else if (type === 'transfer') {
    container.innerHTML = `
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-top:14px;">
        <p style="font-size:14px;font-weight:700;color:#222;margin-bottom:12px;">📋 Instruksi Transfer Bank</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#717171;">Bank BCA</span><strong>1234-5678-90</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#717171;">Bank Mandiri</span><strong>9876-5432-10</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#717171;">Bank BNI</span><strong>1111-2222-33</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#717171;">A/N</span><strong>Villa Santara Indonesia</strong></div>
        </div>
        <p style="font-size:12px;color:#717171;margin-top:12px;">Transfer sesuai total. Bukti transfer dikirim ke WhatsApp <strong>+62 812 3456 7890</strong></p>
      </div>`;
  } else if (type === 'va') {
    container.innerHTML = `
      <div style="background:#F7F7F7;border-radius:12px;padding:20px;margin-top:14px;">
        <p style="font-size:14px;font-weight:700;color:#222;margin-bottom:12px;">🏧 Virtual Account</p>
        <p style="font-size:14px;color:#717171;margin-bottom:12px;">Pilih bank untuk Virtual Account:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${['BCA VA','Mandiri VA','BNI VA','BRI VA','Permata VA','CIMB VA'].map(b => `
            <div class="payment-method" style="padding:12px;cursor:pointer;" onclick="this.parentElement.querySelectorAll('.payment-method').forEach(x=>x.classList.remove('selected')); this.classList.add('selected');">
              <span class="pm-icon" style="font-size:16px;">🏦</span>
              <div class="pm-info"><div class="pm-name" style="font-size:13px;">${b}</div></div>
            </div>`).join('')}
        </div>
        <p style="font-size:12px;color:#717171;margin-top:12px;">Nomor VA akan dikirim ke email setelah konfirmasi booking.</p>
      </div>`;
  } else if (type === 'qris') {
    container.innerHTML = `
      <div style="background:#F7F7F7;border-radius:12px;padding:24px;margin-top:14px;text-align:center;">
        <p style="font-size:14px;font-weight:700;color:#222;margin-bottom:16px;">📱 Scan QRIS untuk Pembayaran</p>
        <div style="width:160px;height:160px;margin:0 auto 16px;background:#fff;border:2px solid #DDDDDD;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:80px;">
          ▣
        </div>
        <p style="font-size:13px;color:#717171;">Scan dengan GoPay, OVO, DANA, ShopeePay, atau aplikasi bank Anda.</p>
        <p style="font-size:12px;color:#B0B0B0;margin-top:8px;">QRIS berlaku selama 15 menit</p>
      </div>`;
  }
}

/* -------------------------------------------------------
   SUBMIT BOOKING
------------------------------------------------------- */
function submitBooking() {
  if (!CalState.start || !CalState.end) {
    showToast('error', '⚠️ Tanggal belum dipilih. Kembali ke halaman detail.');
    return;
  }
  if (!validateStep1()) { openStep(1); return; }
  if (!document.querySelector('.payment-method.selected')) {
    showToast('error', '⚠️ Pilih metode pembayaran terlebih dahulu');
    openStep(2); return;
  }

  const btn = document.getElementById('submitBooking');
  if (!btn) return;
  btn.textContent = '⏳ Memproses pembayaran...';
  btn.disabled = true;
  btn.style.opacity = '0.8';

  setTimeout(() => {
    btn.textContent = 'Konfirmasi dan bayar';
    btn.disabled = false;
    btn.style.opacity = '1';

    const name  = document.getElementById('bk-name').value;
    const villa = VILLAS.find(x => x.id === selectedVillaId) || VILLAS[0];
    const id    = genBookingId();

    set('modalGuestName', name);
    set('modalVillaName', villa.name);
    set('modalBookingId', id);
    // Fill modal dates
    if (CalState.start && CalState.end) {
      const s = CalState.start.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
      const e = CalState.end.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
      set('modalDates', `${s} → ${e}`);
      set('modalNights', `${getNights()} malam`);
    }
    // Total
    const v = villa;
    const nights = getNights();
    const total = (v.price * nights) + 250000 + Math.round(v.price * nights * 0.11) + 300000;
    set('modalTotal', `Rp ${total.toLocaleString('id-ID')}`);
    set('modalPayment', document.querySelector('.payment-method.selected .pm-name')?.textContent || '—');

    document.getElementById('successModal')?.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset state
    CalState.start = null; CalState.end = null;
    syncToFormInputs(); renderCalendar(); updateNbDateDisplay(); updatePriceSummary();
    document.getElementById('bk-name').value  = '';
    document.getElementById('bk-email').value = '';
    document.getElementById('bk-phone').value = '';
    const pf = document.getElementById('paymentFields');
    if (pf) pf.innerHTML = '';
  }, 2000);
}

function genBookingId() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'VS-' + Array.from({length:8}, () => c[Math.floor(Math.random()*c.length)]).join('');
}

function closeModal() {
  document.getElementById('successModal')?.classList.remove('active');
  document.body.style.overflow = '';
  goToDetailPage();
}

/* -------------------------------------------------------
   GALLERY LIGHTBOX
------------------------------------------------------- */
function openGalleryLightbox() {
  const imgs = ['images/villa_hero.png','images/villa_1.png','images/villa_2.png','images/villa_3.png'];
  let current = 0;

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;';

  const closeB = document.createElement('button');
  closeB.innerHTML = '✕';
  closeB.style.cssText = 'position:absolute;top:20px;right:24px;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;width:44px;height:44px;border-radius:50%;cursor:pointer;';
  closeB.onclick = () => document.body.removeChild(ov);

  const img = document.createElement('img');
  img.src = imgs[current];
  img.style.cssText = 'max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain;';

  const counter = document.createElement('div');
  counter.style.cssText = 'color:#fff;font-size:14px;margin-top:16px;';
  counter.textContent = `${current+1} / ${imgs.length}`;

  const nav = document.createElement('div');
  nav.style.cssText = 'display:flex;gap:16px;margin-top:16px;';
  ['‹ Prev','Next ›'].forEach((t,i) => {
    const b = document.createElement('button');
    b.textContent = t;
    b.style.cssText = 'background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:15px;';
    b.onclick = () => { current = i===0 ? (current-1+imgs.length)%imgs.length : (current+1)%imgs.length; img.src = imgs[current]; counter.textContent = `${current+1} / ${imgs.length}`; };
    nav.appendChild(b);
  });

  ov.append(closeB, img, counter, nav);
  ov.addEventListener('click', e => { if (e.target === ov) document.body.removeChild(ov); });
  document.body.appendChild(ov);
}

/* -------------------------------------------------------
   QUICK SEARCH
------------------------------------------------------- */
function initQuickSearch() {
  document.getElementById('quickSearchForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const ci = document.getElementById('hs-checkin')?.value;
    const co = document.getElementById('hs-checkout')?.value;
    if (ci) { const d = new Date(ci); d.setHours(0,0,0,0); CalState.start = d; }
    if (co) { const d = new Date(co); d.setHours(0,0,0,0); CalState.end = d; }
    syncToFormInputs(); renderCalendar(); updateNbDateDisplay(); updatePriceSummary();
    document.getElementById('villas')?.scrollIntoView({ behavior: 'smooth' });
    showToast('info', '🔍 Menampilkan villa tersedia untuk tanggal Anda');
  });
}

/* -------------------------------------------------------
   FAVORITES
------------------------------------------------------- */
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
   SCROLL REVEAL
------------------------------------------------------- */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        setTimeout(() => en.target.classList.add('visible'), parseInt(en.target.dataset.delay)||0);
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* -------------------------------------------------------
   SCROLL TO TOP
------------------------------------------------------- */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => btn?.classList.toggle('visible', window.scrollY > 500));
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------------------------------------------------------
   TOAST
------------------------------------------------------- */
function showToast(type, message) {
  const container = document.querySelector('.toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
