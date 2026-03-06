const body = document.body;
const themeToggle = document.querySelector('[data-theme-toggle]');
const mobileToggle = document.querySelector('[data-mobile-toggle]');
const navLinks = document.querySelector('[data-mobile-nav]');
const siteHeader = document.querySelector('.site-header');

const savedTheme = localStorage.getItem('w4-theme');
if (savedTheme === 'light') {
  body.classList.add('light-mode');
}

if (themeToggle) {
  const syncThemeLabel = () => {
    const light = body.classList.contains('light-mode');
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.innerHTML = light ? '☀️' : '🌙';
  };
  syncThemeLabel();
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('w4-theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    syncThemeLabel();
  });
}

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

window.addEventListener('scroll', () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 8);
});

const forms = document.querySelectorAll('form[data-async-form]');
forms.forEach((form) => {
  const messageBox = form.querySelector('[data-form-message]');
  const submitButton = form.querySelector('button[type="submit"]');
  const sourceUrl = form.querySelector('input[name="source_url"]');
  if (sourceUrl && !sourceUrl.value) {
    sourceUrl.value = window.location.href;
  }

  const setMessage = (text, isError = false) => {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.classList.add('visible');
    messageBox.classList.toggle('error', isError);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;
    if (messageBox) {
      messageBox.classList.remove('visible', 'error');
      messageBox.textContent = '';
    }

    const payload = new FormData(form);
    payload.set('response', 'json');
    if (sourceUrl) {
      payload.set('source_url', sourceUrl.value || window.location.href);
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: payload,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      let data = null;
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      if (!response.ok || !data || data.success !== true) {
        throw new Error((data && data.message) || 'Unable to send your inquiry right now.');
      }

      setMessage(data.message || 'Inquiry sent successfully.');
      form.reset();
      if (sourceUrl) {
        sourceUrl.value = sourceUrl.defaultValue || window.location.href;
      }
    } catch (error) {
      setMessage(error.message || 'Unable to send your inquiry right now.', true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
