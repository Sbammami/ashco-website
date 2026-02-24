/* ============================================
   ASHCO ENERGY LIMITED — MAIN JAVASCRIPT
   ============================================ */

'use strict';

/* === NAVBAR SCROLL EFFECT === */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar style
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top visibility
  if (scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

/* === ACTIVE NAV LINK ON SCROLL === */
const sections = document.querySelectorAll('section[id], .section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

sections.forEach(sec => sectionObserver.observe(sec));

/* === MOBILE MENU === */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});

// Close on link click
mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    mobileMenu.setAttribute('aria-hidden', true);
  });
});

/* === BACK TO TOP === */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* === SMOOTH SCROLL FOR ANCHOR LINKS === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* === COUNTER ANIMATION === */
function animateCounter(el, target, duration = 1800) {
  const startTime = performance.now();
  const startVal = 0;

  function ease(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(ease(progress) * target);

    // Format with commas
    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* === INTERSECTION OBSERVER FOR COUNTERS === */
const counterEls = document.querySelectorAll('[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/* === REVEAL ON SCROLL === */
const revealEls = document.querySelectorAll(
  '.value-card, .service-card, .project-card, .stat-card, .cert-item, .why-card, .pillar, .contact-card'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay based on sibling index
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObserver.observe(el));

/* === CONTACT FORM === */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = contactForm.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#e74c3c';
      }
    });

    if (!valid) return;

    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    btnText.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      contactForm.reset();
      btnText.textContent = 'Send Message';
      submitBtn.disabled = false;

      setTimeout(() => {
        formSuccess.classList.remove('show');
      }, 6000);
    }, 1200);
  });
}

/* === HERO PARALLAX EFFECT (subtle) === */
const heroShapes = document.querySelectorAll('.shape');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  heroShapes.forEach((shape, i) => {
    const speed = (i + 1) * 0.08;
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

/* === TICKER PAUSE ON HOVER === */
const ticker = document.querySelector('.ticker-track');
if (ticker) {
  const tickerBar = document.querySelector('.ticker-bar');
  tickerBar.addEventListener('mouseenter', () => {
    ticker.style.animationPlayState = 'paused';
  });
  tickerBar.addEventListener('mouseleave', () => {
    ticker.style.animationPlayState = 'running';
  });
}

/* === KEYBOARD ACCESSIBILITY === */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    mobileMenu.setAttribute('aria-hidden', true);
  }
});
