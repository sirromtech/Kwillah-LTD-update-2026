/* Kwilah Business Consultants – site script (no dependencies) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggler = $('.navbar-toggler'), menu = $('#navbarCollapse');
  if (toggler && menu) {
    toggler.addEventListener('click', function () {
      var open = menu.classList.toggle('show');
      toggler.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Navbar shadow + back-to-top
  var nav = $('#mainNav'), top = $('.back-to-top');
  var onScroll = function () {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (top) top.classList.toggle('show', y > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  // Reveal, progress bars and counters when scrolled into view
  var countUp = function (el) {
    var target = +el.getAttribute('data-count'), start = null;
    if (reduced) { el.textContent = target; return; }
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1500, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var activate = function (el) {
    if (el.hasAttribute('data-count')) countUp(el);
    else if (el.hasAttribute('data-value')) el.style.width = el.getAttribute('data-value') + '%';
    else el.classList.add('in');
  };
  var watched = $$('.reveal, [data-count], .progress-bar[data-value]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    watched.forEach(function (el) { io.observe(el); });
  } else { watched.forEach(activate); }

  // Rotating words (home)
  var words = $$('.rotating-words .word');
  if (words.length > 1 && !reduced) {
    var i = 0;
    setInterval(function () { words[i].classList.remove('active'); i = (i + 1) % words.length; words[i].classList.add('active'); }, 3000);
  }

  // Service "See more" toggles
  $$('.toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var list = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      list.hidden = !open;
      btn.firstChild.nodeValue = open ? 'Hide ' : 'See more ';
    });
  });

  // Click-to-load Google Maps (saves ~1 MB per map until needed)
  $$('.map-embed').forEach(function (box) {
    var b = $('button', box);
    if (b) b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-src'); f.loading = 'lazy'; f.title = 'Map'; f.allowFullscreen = true;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = ''; box.appendChild(f);
    });
  });

  // Contact form -> WhatsApp or email (works on static hosting, no server needed)
  var form = $('#contactForm');
  if (form) {
    var pkg = new URLSearchParams(location.search).get('package');
    if (pkg) {
      var opt = $('option[data-key="' + pkg + '"]', form);
      if (opt) opt.selected = true;
    }
    var via = 'whatsapp';
    $$('button[data-via]', form).forEach(function (b) { b.addEventListener('click', function () { via = b.getAttribute('data-via'); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = $('#formResponse'), F = form.elements;
      var name = F.name.value.trim(), msg = F.message.value.trim();
      if (!name || !msg) { out.textContent = 'Please enter your name and a message.'; (name ? F.message : F.name).focus(); return; }
      out.textContent = '';
      var subject = F.subject.value;
      var body = 'Hello Kwilah, my name is ' + name + '.\n\nEnquiry: ' + subject + '\n\n' + msg +
        (F.phone.value.trim() ? '\n\nPhone: ' + F.phone.value.trim() : '');
      if (via === 'email') {
        location.href = 'mailto:kwilahltd@gmail.com?subject=' + encodeURIComponent('Website enquiry: ' + subject) + '&body=' + encodeURIComponent(body);
      } else {
        window.open('https://wa.me/67578334123?text=' + encodeURIComponent(body), '_blank', 'noopener');
      }
    });
  }

  // Footer year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
