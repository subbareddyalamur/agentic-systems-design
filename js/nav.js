/* ============================================
   Navigation, Theme Toggle, Sidebar, Progress
   ============================================ */

const Nav = (() => {
  const THEME_KEY = 'masai_theme';

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeButton(saved);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeButton(next);
      });
    });
  }

  function updateThemeButton(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar on link click (mobile)
    sidebar.querySelectorAll('.topic-list a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('.topic-section');
    const links = document.querySelectorAll('.sidebar .topic-list a');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  function initLandingProgress() {
    const progress = JSON.parse(localStorage.getItem('masai_quiz_progress') || '{}');

    document.querySelectorAll('.module-card').forEach(card => {
      const moduleId = card.dataset.moduleId;
      const topicCount = parseInt(card.dataset.topicCount || '0');
      if (!moduleId || !topicCount) return;

      let completed = 0;
      Object.keys(progress).forEach(key => {
        if (key.startsWith(moduleId + '-') && progress[key]?.passed) {
          completed++;
        }
      });

      const fillEl = card.querySelector('.progress-bar .fill');
      const textEl = card.querySelector('.progress-text');
      if (fillEl) fillEl.style.width = `${(completed / topicCount) * 100}%`;
      if (textEl) textEl.textContent = `${completed}/${topicCount} complete`;
    });
  }

  function init() {
    initTheme();
    initSidebar();
    initScrollSpy();
    initLandingProgress();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Nav.init());
