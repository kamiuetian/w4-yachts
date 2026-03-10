(() => {
  const body = document.body;

  // Theme toggle (persisted)
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const storedTheme = (() => {
    try { return localStorage.getItem('theme'); } catch (_) { return null; }
  })();

  if (storedTheme === 'light') body.classList.add('light-mode');
  if (themeToggle) themeToggle.textContent = body.classList.contains('light-mode') ? '☀️' : '🌙';

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const mode = body.classList.contains('light-mode') ? 'light' : 'dark';
      try { localStorage.setItem('theme', mode); } catch (_) {}
      themeToggle.textContent = mode === 'light' ? '☀️' : '🌙';
    });
  }

  // Mobile menu
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.classList.toggle('open', !isOpen);
    });
  }

  // Inquiry modal
  const modal = document.querySelector('[data-inquiry-modal]');
  const openers = Array.from(document.querySelectorAll('[data-open-inquiry]'));
  const closers = modal ? Array.from(modal.querySelectorAll('[data-close-inquiry]')) : [];
  let lastActive = null;

  const openModal = () => {
    if (!modal) return;
    lastActive = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');

    // Clear any prior message and re-enable submit
    const form = modal.querySelector('form[data-async-form]');
    if (form) {
      const msg = form.querySelector('[data-form-message]');
      if (msg) msg.textContent = '';
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = false;
      // focus first input
      const first = form.querySelector('input, select, textarea, button');
      if (first) first.focus({ preventScroll: true });
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    if (lastActive && typeof lastActive.focus === 'function') {
      try { lastActive.focus({ preventScroll: true }); } catch (_) { lastActive.focus(); }
    }
  };

  for (const opener of openers) {
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  for (const closer of closers) {
    closer.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  // Optional: open modal if URL hash is #inquiry
  if (location && location.hash === '#inquiry') {
    // Wait a tick so layout is ready
    setTimeout(() => openModal(), 0);
  }

  // Async forms (JSON response supported by /form/w4contact.php)
  const forms = document.querySelectorAll('form[data-async-form]');
  forms.forEach((form) => {
    const submitButton = form.querySelector('button[type="submit"]');
    const formMessage = form.querySelector('[data-form-message]');

    form.addEventListener('submit', async (e) => {
      // If action is missing, fallback to normal submit
      if (!form.action) return;

      e.preventDefault();

      if (submitButton) submitButton.disabled = true;
      if (formMessage) formMessage.textContent = 'Sending...';

      // Clear honeypot fields right before submit to avoid browser autofill false positives.
      const honeypot = form.querySelector('input[name="contact_website"], input[name="website"]');
      if (honeypot) honeypot.value = '';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data && data.success) {
          if (formMessage) formMessage.textContent = data.message || 'Inquiry sent successfully.';
          form.reset();
          // Keep hidden fields intact (reset() clears them)
          const portfolio = form.querySelector('input[name="portfolio"]');
          if (portfolio) portfolio.value = portfolio.value || 'w4';
        } else {
          if (formMessage) formMessage.textContent = (data && data.message) ? data.message : 'Unable to send your inquiry right now.';
        }
      } catch (err) {
        if (formMessage) formMessage.textContent = 'Network error — please try again in a moment.';
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
})();
