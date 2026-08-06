/* ============================================================
   REBRAR - script.js
   ============================================================ */

/* ---------- GOOGLE SHEETS CONFIGURATION ---------- */
// REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOFeiyPFMJmpbdy0RAvc_uVYm9AecivjxsiwCT51pFAJTi9OGlCT9ythR6kSGZ_vCw/exec';

/* ---------- Navbar Scroll ---------- */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ---------- Mobile Menu ---------- */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

/* ---------- Active nav link ---------- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ---------- Scroll Fade-in ---------- */
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));
}

/* ---------- FAQ Accordion ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (q) {
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});

/* ---------- Portfolio Filter ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const portCards = document.querySelectorAll('.port-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        card.style.opacity = '0';
        setTimeout(() => { card.style.opacity = '1'; card.style.transition = 'opacity 0.35s'; }, 20);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* ---------- GOOGLE SHEETS FORM SUBMISSION HELPER ---------- */
function submitFormToGoogleSheets(form, successElementId) {
  // Add timestamp
  const timestampField = form.querySelector('input[name="Timestamp"]');
  if (timestampField) {
    timestampField.value = new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'});
  }

  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.result === 'success') {
      form.style.display = 'none';
      const successEl = document.getElementById(successElementId);
      if (successEl) successEl.style.display = 'block';
    } else {
      throw new Error(data.error || 'Submission failed');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error submitting the form. Please try again or contact us directly at rebrar.contact@gmail.com');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}

/* ---------- Book Form Validation & Submission ---------- */
const bookForm = document.getElementById('bookForm');
if (bookForm) {
  bookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'name', rule: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
      { id: 'phone', rule: v => /^[0-9+\s\-()]{8,15}$/.test(v.trim()), msg: 'Enter a valid phone number.' },
      { id: 'email', rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email address.' },
      { id: 'business', rule: v => v.trim().length > 0, msg: 'Please describe your business.' },
      { id: 'budget', rule: v => v !== '', msg: 'Please select a budget range.' },
      { id: 'website_type', rule: v => v !== '', msg: 'Please select a website type.' },
    ];

    fields.forEach(field => {
      const group = document.getElementById(field.id)?.closest('.form-group');
      const input = document.getElementById(field.id);
      if (!input || !group) return;
      const errorEl = group.querySelector('.error-msg');
      if (!field.rule(input.value)) {
        group.classList.add('error');
        if (errorEl) errorEl.textContent = field.msg;
        valid = false;
      } else {
        group.classList.remove('error');
      }
    });

    if (valid) {
      submitFormToGoogleSheets(bookForm, 'formSuccess');
    }
  });

  bookForm.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.closest('.form-group')?.classList.remove('error');
    });
  });
}

/* ---------- Contact Form Validation & Submission ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'c_name', rule: v => v.trim().length >= 2, msg: 'Please enter your name.' },
      { id: 'c_email', rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email.' },
      { id: 'c_message', rule: v => v.trim().length >= 10, msg: 'Please write a short message (min 10 chars).' },
    ];

    fields.forEach(field => {
      const group = document.getElementById(field.id)?.closest('.form-group');
      const input = document.getElementById(field.id);
      if (!input || !group) return;
      const errorEl = group.querySelector('.error-msg');
      if (!field.rule(input.value)) {
        group.classList.add('error');
        if (errorEl) errorEl.textContent = field.msg;
        valid = false;
      } else {
        group.classList.remove('error');
      }
    });

    if (valid) {
      submitFormToGoogleSheets(contactForm, 'contactSuccess');
    }
  });

  contactForm.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.closest('.form-group')?.classList.remove('error');
    });
  });
}

/* ---------- Animated Counters ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + (el.dataset.suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + (el.dataset.suffix || '');
    }
  }, 16);
}

const counters = document.querySelectorAll('[data-counter]');
if (counters.length) {
  const cObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        cObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObserver.observe(c));
}
