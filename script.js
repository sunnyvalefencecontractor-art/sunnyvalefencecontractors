(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('.site-header');
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  var contactForm = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');
  var yearEl = document.getElementById('year');
  var heroParallax = document.getElementById('heroParallax');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function setMenuOpen(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  menuToggle.addEventListener('click', function () {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      setMenuOpen(false);
    }
  });

  /* ── Scroll reveal ── */
  var revealSelectors = '.reveal, .reveal-left, .reveal-scale, .reveal-stagger';
  var revealEls = document.querySelectorAll(revealSelectors);

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── Animated counters ── */
  function animateCounter(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';

    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var duration = 1800;
    var start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = easeOutExpo(progress) * target;

      if (decimals > 0) {
        el.textContent = prefix + value.toFixed(decimals) + suffix;
      } else {
        el.textContent = prefix + Math.round(value) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  var counterEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counterEls.forEach(function (el) {
      var suffix = el.dataset.suffix || '';
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var val = parseFloat(el.dataset.count);
      el.textContent = decimals > 0 ? val.toFixed(decimals) + suffix : Math.round(val) + suffix;
    });
  }

  /* ── Hero parallax (mouse + scroll) ── */
  if (heroParallax && !prefersReduced) {
    var parallaxX = 0;
    var parallaxY = 0;
    var targetX = 0;
    var targetY = 0;

    document.querySelector('.hero').addEventListener('mousemove', function (e) {
      if (window.innerWidth < 1024) return;
      var rect = heroParallax.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width * 12;
      targetY = (e.clientY - cy) / rect.height * 12;
    }, { passive: true });

    document.querySelector('.hero').addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    function updateParallax() {
      parallaxX += (targetX - parallaxX) * 0.08;
      parallaxY += (targetY - parallaxY) * 0.08;
      var scrollY = window.scrollY * 0.04;
      heroParallax.style.transform =
        'perspective(900px) rotateY(' + parallaxX * 0.3 + 'deg) rotateX(' + (-parallaxY * 0.3) + 'deg) translateY(' + scrollY + 'px)';
      requestAnimationFrame(updateParallax);
    }
    requestAnimationFrame(updateParallax);
  }

  /* ── Nav active section highlight ── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = nav.querySelectorAll('a[href^="#"]:not(.nav-phone)');

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) {
      if (section.id) sectionObserver.observe(section);
    });
  }

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formNote.className = 'form-note';
    formNote.textContent = '';

    var name = contactForm.name.value.trim();
    var phone = contactForm.phone.value.trim();
    var service = contactForm.service.value;

    if (!name || !phone || !service) {
      formNote.className = 'form-note error';
      formNote.textContent = 'Please fill in all required fields.';
      return;
    }

    formNote.className = 'form-note success';
    formNote.textContent = 'Thanks! We\'ll be in touch within one business day.';
    contactForm.reset();
  });
})();
