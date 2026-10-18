'use strict';

// No network calls, HTML injection, user-data storage, or third-party scripts.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const locationMap = document.getElementById('location-map');
  const mapFallback = document.getElementById('map-fallback');
  function showMapFallback() {
    locationMap.hidden = true;
    mapFallback.hidden = false;
  }
  if (locationMap && mapFallback) {
    window.addEventListener('securitypolicyviolation', event => {
      if (event.effectiveDirective === 'frame-src' && event.blockedURI.startsWith('https://widgets.2gis.com')) showMapFallback();
    });
    locationMap.addEventListener('error', showMapFallback);
  }
  const serviceData = Object.freeze({
    diagnostics: { name: 'Диагностика и автоэлектрика', title: 'Сначала — разобраться.', description: 'Ошибки на приборной панели, сбои электроники или проблемы с запуском — повод начать с диагностики. Занимаемся электронными системами и установкой дополнительного оборудования.', image: 'diagnostics.jpg', alt: 'Автомобиль в ремонтной зоне Smart Auto', tag: 'ДИАГНОСТИКА / 01' },
    suspension: { name: 'Ремонт подвески', title: 'Вернём порядок в ходовой.', description: 'Стук, вибрация или изменившееся поведение машины на дороге? Обсудим диагностику ходовой части и ремонт подвески. Необходимые запчасти можно подобрать в сервисе.', image: 'suspension.jpg', alt: 'Работа мастера с подвеской автомобиля в Smart Auto', tag: 'ПОДВЕСКА / 02' },
    maintenance: { name: 'Техническое обслуживание', title: 'Забота по плану.', description: 'Замена масла и технических жидкостей — важная часть регулярного обслуживания. При записи сообщите модель, пробег автомобиля и что меняли в последний раз.', image: 'hero.jpg', alt: 'Автомобиль с открытым капотом в мастерской Smart Auto', tag: 'ОБСЛУЖИВАНИЕ / 03' },
    alignment: { name: 'Развал-схождение', title: 'Держим верное направление.', description: 'Автомобиль уводит в сторону или шины изнашиваются неравномерно? Уточните возможность проверки и регулировки углов установки колёс для вашей модели.', image: 'alignment.jpg', alt: 'Автомобиль на стенде развала-схождения в Smart Auto', tag: 'РАЗВАЛ-СХОЖДЕНИЕ / 04' },
    climate: { name: 'Заправка автокондиционера', title: 'Комфорт в салоне.', description: 'Если кондиционер стал хуже охлаждать, обсудите обслуживание системы. В Smart Auto доступны заправка и дозаправка автокондиционера. Тип хладагента и объём работ уточняются по автомобилю.', image: 'workshop.jpg', alt: 'Ремонтные посты Smart Auto', tag: 'КОНДИЦИОНЕР / 05' },
    parts: { name: 'Подбор запчастей', title: 'Нужная деталь — по вашему авто.', description: 'Подбираем запчасти со склада и под заказ. Сообщите VIN, марку, модель и год выпуска: наличие, производителя, стоимость и срок поставки уточним для вашего запроса.', image: 'parts.jpg', alt: 'Детали двигателя в мастерской Smart Auto', tag: 'ЗАПЧАСТИ / 06' }
  });
  const choices = Array.from(document.querySelectorAll('[data-service]'));
  choices.forEach(button => {
    button.addEventListener('click', () => {
      const item = serviceData[button.dataset.service];
      if (!item || !Object.hasOwn(serviceData, button.dataset.service)) return;
      choices.forEach(choice => {
        const active = choice === button;
        choice.classList.toggle('active', active);
        choice.setAttribute('aria-pressed', String(active));
      });
      document.getElementById('service-title').textContent = item.title;
      document.getElementById('service-description').textContent = item.description;
      document.getElementById('service-tag').textContent = item.tag;
      const image = document.getElementById('service-image');
      image.src = './assets/' + item.image;
      image.alt = item.alt;
      const book = document.getElementById('service-book');
      book.dataset.book = item.name;
      book.setAttribute('aria-label', 'Обсудить: ' + item.name);
      if (window.matchMedia('(max-width: 600px)').matches) {
        document.getElementById('service-detail').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      }
    });
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  }
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  let dialogTrigger = null;
  function openDialog(dialog, trigger) {
    dialogTrigger = trigger;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (dialogTrigger instanceof HTMLElement && document.contains(dialogTrigger)) dialogTrigger.focus({ preventScroll: true });
      dialogTrigger = null;
    });
  });
  const bookingDialog = document.getElementById('booking-dialog');
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
    document.getElementById('booking-topic').textContent = button.dataset.book || 'Консультация и запись';
    openDialog(bookingDialog, button);
  }));
  document.getElementById('privacy-open').addEventListener('click', event => openDialog(document.getElementById('privacy-dialog'), event.currentTarget));

  const gallery = Object.freeze([
    { image: 'workshop-wide.jpg', caption: 'Рабочие посты Smart Auto' },
    { image: 'alignment.jpg', caption: 'Стенд развала-схождения' },
    { image: 'suspension.jpg', caption: 'Работа с подвеской автомобиля' },
    { image: 'reception.jpg', caption: 'Зона приёма клиентов' }
  ]);
  const galleryDialog = document.getElementById('gallery-dialog');
  let photoIndex = 0;
  function showPhoto(index) {
    photoIndex = ((index % gallery.length) + gallery.length) % gallery.length;
    const item = gallery[photoIndex];
    const image = document.getElementById('gallery-image');
    image.src = './assets/' + item.image;
    image.alt = item.caption;
    document.getElementById('gallery-caption').textContent = item.caption;
    document.getElementById('gallery-count').textContent = (photoIndex + 1) + ' / ' + gallery.length;
  }
  document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.gallery);
    if (!Number.isInteger(index) || index < 0 || index >= gallery.length) return;
    showPhoto(index);
    openDialog(galleryDialog, button);
  }));
  document.getElementById('gallery-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  document.getElementById('gallery-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  galleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  });

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('pending'); observer.observe(element); });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        document.documentElement.classList.remove('motion-enabled');
        document.querySelectorAll('.pending').forEach(element => element.classList.remove('pending'));
        observer.disconnect();
      }
    });
  }
  const hero = document.querySelector('.hero');
  const film = document.querySelector('.workshop-film');
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    if (reducedMotion.matches || window.innerWidth < 801) return;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0) hero.style.setProperty('--hero-shift', Math.min(90, Math.max(0, -heroRect.top * .12)) + 'px');
    const filmRect = film.getBoundingClientRect();
    if (filmRect.top < window.innerHeight && filmRect.bottom > 0) film.style.setProperty('--film-shift', ((window.innerHeight / 2 - filmRect.top - filmRect.height / 2) * .075) + 'px');
  }
  window.addEventListener('scroll', () => {
    if (!scheduled && !document.hidden) { scheduled = true; window.requestAnimationFrame(updateScroll); }
  }, { passive: true });
})();
