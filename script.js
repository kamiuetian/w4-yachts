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