/* ============================================
   Interactive Features: Search, Progress Bar,
   Keyboard Nav, Bookmarks, Streak/XP, ELI5
   ============================================ */

const Features = (() => {
  const STORAGE_PREFIX = 'masai_';

  /* ---- 1. Reading Progress Bar ---- */
  function initProgressBar() {
    if (document.querySelector('.landing-body')) return; // skip landing page
    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    bar.innerHTML = '<div class="reading-progress-fill"></div>';
    document.body.prepend(bar);

    const fill = bar.querySelector('.reading-progress-fill');
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = `${Math.min(100, pct)}%`;
    });
  }

  /* ---- 2. Full-Text Search ---- */
  function initSearch() {
    // Build search index from sidebar links + content
    const searchIndex = buildSearchIndex();

    // Create search UI
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-header">
          <input type="text" class="search-input" placeholder="Search topics, concepts, code..." autofocus>
          <button class="search-close">✕</button>
        </div>
        <div class="search-results"></div>
        <div class="search-footer">
          <span class="search-hint">↑↓ Navigate · Enter to open · Esc to close</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.search-input');
    const results = overlay.querySelector('.search-results');
    const closeBtn = overlay.querySelector('.search-close');
    let selectedIndex = -1;

    // Add search button to navbar
    const nav = document.querySelector('.nav-controls');
    if (nav) {
      const searchBtn = document.createElement('button');
      searchBtn.className = 'search-btn';
      searchBtn.innerHTML = '🔍';
      searchBtn.title = 'Search (Ctrl+K)';
      searchBtn.addEventListener('click', () => openSearch());
      nav.prepend(searchBtn);
    }

    function openSearch() {
      overlay.classList.add('active');
      input.focus();
      input.value = '';
      results.innerHTML = '<div class="search-empty">Start typing to search across all modules...</div>';
      selectedIndex = -1;
    }

    function closeSearch() {
      overlay.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '<div class="search-empty">Start typing to search across all modules...</div>';
        selectedIndex = -1;
        return;
      }
      const matches = searchIndex.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query)
      ).slice(0, 15);

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">No results found</div>';
        return;
      }

      results.innerHTML = matches.map((m, i) => `
        <a href="${m.url}" class="search-result-item ${i === 0 ? 'selected' : ''}">
          <span class="search-result-module">${m.module}</span>
          <span class="search-result-title">${highlightMatch(m.title, query)}</span>
          <span class="search-result-preview">${highlightMatch(m.preview, query)}</span>
        </a>
      `).join('');
      selectedIndex = 0;
    });

    input.addEventListener('keydown', e => {
      const items = results.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, items.length - 1); updateSelected(items); }
      if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); updateSelected(items); }
      if (e.key === 'Enter' && items[selectedIndex]) { items[selectedIndex].click(); closeSearch(); }
      if (e.key === 'Escape') closeSearch();
    });

    function updateSelected(items) {
      items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
      if (items[selectedIndex]) items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }

    function highlightMatch(text, query) {
      if (!query) return text;
      const idx = text.toLowerCase().indexOf(query);
      if (idx === -1) return text.substring(0, 80);
      const start = Math.max(0, idx - 20);
      const end = Math.min(text.length, idx + query.length + 40);
      let snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
      return snippet.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
    }

    // Global keyboard shortcut
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    });
  }

  function buildSearchIndex() {
    const index = [];
    // Index current page topics
    document.querySelectorAll('.topic-section').forEach(section => {
      const h2 = section.querySelector('h2');
      const content = section.querySelector('.content-text');
      const id = section.id;
      const moduleMatch = id.match(/m(\d)/);
      const moduleNum = moduleMatch ? moduleMatch[1] : '?';
      index.push({
        title: h2 ? h2.textContent : '',
        keywords: content ? content.textContent.substring(0, 500) : '',
        preview: content ? content.textContent.substring(0, 120) : '',
        module: `Module ${moduleNum}`,
        url: `#${id}`
      });
    });

    // Cross-module index (static)
    const modules = [
      { file: 'module1.html', name: 'Module 1: Foundations', topics: [
        'AI Landscape & Career Path', 'Python Environment Setup', 'Command Line & Git Basics', 'Variables & Data Types',
        'Conditionals & Logic', 'Loops', 'Functions & Modules', 'Data Structures', 'NumPy Essentials',
        'JSON & Data Interchange', 'Pandas Fundamentals', 'SQL for Data', 'APIs: The Agent\'s Hands'
      ]},
      { file: 'module2.html', name: 'Module 2: ML Fundamentals', topics: [
        'ML Problem Framing', 'Data Preparation & Feature Engineering', 'Data Leakage & Cross-Validation',
        'Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forests & Ensembles',
        'Gradient Descent Deep Dive', 'Regularization', 'Classification Metrics', 'Regression Metrics',
        'K-Means Clustering', 'PCA', 'Hyperparameter Tuning', 'Model Selection & Comparison', 'ML Pipeline End-to-End'
      ]},
      { file: 'module3.html', name: 'Module 3: GenAI & Agents', topics: [
        'LLM Concepts & Tokenization', 'Prompt Engineering', 'Working with Local Models',
        'LangChain Essentials', 'RAG Foundations', 'Embeddings & Vector Stores', 'Building a RAG Application',
        'Multimodal Pipelines', 'Agent Patterns', 'Memory & Control Flow', 'Graph-Based Agents (LangGraph)',
        'Structured Output', 'AI Security', 'AI-Assisted Coding'
      ]},
      { file: 'module4.html', name: 'Module 4: Agentic Design', topics: [
        'LLM Internals', 'Version Control & Rate Limits', 'Retrieval & Grounding', 'Advanced RAG',
        'Agent Communication Protocols', 'Output Validation & Guardrails', 'Memory Architecture',
        'Advanced Orchestration', 'Resilience & Fallbacks', 'Tracing & Debugging', 'Evaluation & Testing',
        'SLIs/SLOs & Monitoring', 'Deployment (FastAPI & Streamlit)', 'Ops: Caching & Concurrency',
        'Maintenance & DR', 'Capstone Project'
      ]},
      { file: 'module5.html', name: 'Module 5: Platforms & Capstone', topics: [
        'OpenAI Assistants & Tool Use', 'Claude Tool Use & Computer Use', 'AWS Bedrock Agents',
        'Google Vertex AI Agents', 'Multi-Agent Frameworks', 'Model Context Protocol (MCP)',
        'Production Prompt Management', 'E2E Testing & CI/CD for AI', 'Ethics, Bias & Responsible AI',
        'Capstone: RAG-Powered Q&A System', 'Capstone: Multi-Agent Research Assistant',
        'Capstone: Customer Support Agent', 'What\'s Next: The Agentic Future'
      ]}
    ];

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    modules.forEach(mod => {
      if (mod.file === currentFile) return; // already indexed above
      mod.topics.forEach((topic, i) => {
        index.push({
          title: topic,
          keywords: topic.toLowerCase(),
          preview: `${mod.name} · Topic ${i + 1}`,
          module: mod.name.split(':')[0],
          url: `${mod.file}#${mod.file.replace('.html', '').replace('module', 'm')}-topic${i + 1}`
        });
      });
    });

    // Also add feature pages
    ['glossary.html:Glossary:Searchable A-Z glossary of all terms',
     'dashboard.html:Progress Dashboard:Track your completion and stats',
     'flashcards.html:Flashcards:Spaced repetition review',
     'challenges.html:Code Challenges:Timed coding exercises',
     'certificate.html:Certificate:Generate your completion certificate'
    ].forEach(entry => {
      const [url, title, preview] = entry.split(':');
      index.push({ title, keywords: title.toLowerCase(), preview, module: 'Feature', url });
    });

    return index;
  }

  /* ---- 3. Keyboard Navigation ---- */
  function initKeyboardNav() {
    const sections = document.querySelectorAll('.topic-section');
    if (!sections.length) return;

    document.addEventListener('keydown', e => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const current = getCurrentSection(sections);
        const next = e.key === 'j'
          ? Math.min(current + 1, sections.length - 1)
          : Math.max(current - 1, 0);
        sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (e.key === 'n' || e.key === 'p') {
        // Next/previous module
        const moduleLinks = { 'module1.html': 'module2.html', 'module2.html': 'module3.html', 'module3.html': 'module4.html', 'module4.html': 'module5.html' };
        const prevLinks = { 'module2.html': 'module1.html', 'module3.html': 'module2.html', 'module4.html': 'module3.html', 'module5.html': 'module4.html' };
        const current = window.location.pathname.split('/').pop();
        if (e.key === 'n' && moduleLinks[current]) window.location.href = moduleLinks[current];
        if (e.key === 'p' && prevLinks[current]) window.location.href = prevLinks[current];
      }
    });

    function getCurrentSection(sections) {
      let closest = 0;
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top <= 100) closest = i;
      });
      return closest;
    }
  }

  /* ---- 4. Bookmarks & Notes ---- */
  function initBookmarks() {
    const sections = document.querySelectorAll('.topic-section');
    if (!sections.length) return;
    const bookmarks = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'bookmarks') || '{}');
    const notes = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'notes') || '{}');

    sections.forEach(section => {
      const header = section.querySelector('.topic-header') || section.querySelector('h2');
      if (!header) return;
      const id = section.id;

      const controls = document.createElement('div');
      controls.className = 'bookmark-controls';

      const bookmarkBtn = document.createElement('button');
      bookmarkBtn.className = 'bookmark-btn' + (bookmarks[id] ? ' active' : '');
      bookmarkBtn.innerHTML = bookmarks[id] ? '★' : '☆';
      bookmarkBtn.title = 'Bookmark this topic';
      bookmarkBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (bookmarks[id]) { delete bookmarks[id]; bookmarkBtn.innerHTML = '☆'; bookmarkBtn.classList.remove('active'); }
        else { bookmarks[id] = { title: header.textContent, url: window.location.pathname + '#' + id, date: Date.now() }; bookmarkBtn.innerHTML = '★'; bookmarkBtn.classList.add('active'); }
        localStorage.setItem(STORAGE_PREFIX + 'bookmarks', JSON.stringify(bookmarks));
      });

      const noteBtn = document.createElement('button');
      noteBtn.className = 'note-btn';
      noteBtn.innerHTML = '📝';
      noteBtn.title = 'Add a note';
      noteBtn.addEventListener('click', e => {
        e.stopPropagation();
        let noteArea = section.querySelector('.user-note-area');
        if (noteArea) { noteArea.remove(); return; }
        noteArea = document.createElement('div');
        noteArea.className = 'user-note-area';
        noteArea.innerHTML = `<textarea class="user-note-text" placeholder="Your notes for this topic...">${notes[id] || ''}</textarea>`;
        const textarea = noteArea.querySelector('textarea');
        textarea.addEventListener('input', () => {
          notes[id] = textarea.value;
          localStorage.setItem(STORAGE_PREFIX + 'notes', JSON.stringify(notes));
        });
        header.parentElement.insertBefore(noteArea, header.nextSibling);
        textarea.focus();
      });

      controls.appendChild(bookmarkBtn);
      controls.appendChild(noteBtn);
      if (header.tagName === 'H2') {
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.gap = '8px';
        header.appendChild(controls);
      } else {
        header.appendChild(controls);
      }
    });
  }

  /* ---- 5. Streak & XP System ---- */
  function initStreak() {
    const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'streak') || '{"xp":0,"streak":0,"lastVisit":null,"history":[]}');
    const today = new Date().toISOString().split('T')[0];

    if (data.lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (data.lastVisit === yesterday) {
        data.streak++;
      } else if (data.lastVisit) {
        data.streak = 1;
      } else {
        data.streak = 1;
      }
      data.xp += 10; // daily visit XP
      data.lastVisit = today;
      if (!data.history.includes(today)) data.history.push(today);
      localStorage.setItem(STORAGE_PREFIX + 'streak', JSON.stringify(data));
    }

    // Show streak badge in navbar
    const nav = document.querySelector('.nav-controls');
    if (nav) {
      const badge = document.createElement('div');
      badge.className = 'streak-badge';
      badge.innerHTML = `<span class="streak-fire">🔥</span><span class="streak-count">${data.streak}</span>`;
      badge.title = `${data.streak}-day streak · ${data.xp} XP`;
      nav.prepend(badge);
    }

    // Award XP for quiz completion
    window.addEventListener('quiz-passed', () => {
      data.xp += 25;
      localStorage.setItem(STORAGE_PREFIX + 'streak', JSON.stringify(data));
      showXPToast('+25 XP');
    });

    // Award XP for running code
    let codeRunCount = 0;
    window.addEventListener('code-executed', () => {
      codeRunCount++;
      if (codeRunCount % 3 === 0) {
        data.xp += 5;
        localStorage.setItem(STORAGE_PREFIX + 'streak', JSON.stringify(data));
        showXPToast('+5 XP');
      }
    });
  }

  function showXPToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
  }

  /* ---- 6. ELI5 Toggle ---- */
  function initELI5() {
    const sections = document.querySelectorAll('.topic-section');
    if (!sections.length) return;

    const eli5Data = {
      'topic1': 'Imagine AI is like teaching a dog tricks. You show it examples (training), and it learns patterns. Machine Learning is the dog learning, and LLMs are like really smart parrots that learned language from reading the entire internet.',
      'topic2': 'Setting up Python is like setting up a kitchen before cooking. You need the right tools (Python), a clean workspace (virtual environment), and a recipe book (packages).',
      'topic3': 'Git is like a save button for your entire project that remembers EVERY save you ever made. You can go back to any point in time, like a time machine for code.',
      'default': 'Think of this concept like building with LEGO blocks. Each piece is simple on its own, but combining them creates something complex and powerful.'
    };

    sections.forEach(section => {
      const contentText = section.querySelector('.content-text');
      if (!contentText) return;

      const toggle = document.createElement('button');
      toggle.className = 'eli5-toggle';
      toggle.innerHTML = '🧒 Explain Simply';
      toggle.title = 'Show simplified explanation';

      const eli5Box = document.createElement('div');
      eli5Box.className = 'eli5-box';
      eli5Box.style.display = 'none';

      const topicNum = section.id.match(/topic(\d+)/)?.[1];
      const explanation = eli5Data['topic' + topicNum] || eli5Data['default'];
      eli5Box.innerHTML = `<div class="eli5-label">🧒 Simple Explanation</div><p>${explanation}</p>`;

      toggle.addEventListener('click', () => {
        const isVisible = eli5Box.style.display !== 'none';
        eli5Box.style.display = isVisible ? 'none' : 'block';
        toggle.innerHTML = isVisible ? '🧒 Explain Simply' : '🧒 Hide Simple Version';
      });

      contentText.prepend(eli5Box);
      contentText.prepend(toggle);
    });
  }

  /* ---- 7. Keyboard Shortcuts Help ---- */
  function initShortcutsHelp() {
    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'shortcuts-overlay';
    helpOverlay.innerHTML = `
      <div class="shortcuts-modal">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <div class="shortcut-grid">
          <div class="shortcut-item"><kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>/</kbd><span>Search</span></div>
          <div class="shortcut-item"><kbd>j</kbd> / <kbd>k</kbd><span>Next / Previous topic</span></div>
          <div class="shortcut-item"><kbd>n</kbd> / <kbd>p</kbd><span>Next / Previous module</span></div>
          <div class="shortcut-item"><kbd>Esc</kbd><span>Close search / modal</span></div>
          <div class="shortcut-item"><kbd>?</kbd><span>Show this help</span></div>
        </div>
        <button class="shortcuts-close">Close</button>
      </div>
    `;
    document.body.appendChild(helpOverlay);
    helpOverlay.querySelector('.shortcuts-close').addEventListener('click', () => helpOverlay.classList.remove('active'));
    helpOverlay.addEventListener('click', e => { if (e.target === helpOverlay) helpOverlay.classList.remove('active'); });

    document.addEventListener('keydown', e => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        helpOverlay.classList.toggle('active');
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    initProgressBar();
    initSearch();
    initKeyboardNav();
    initBookmarks();
    initStreak();
    initELI5();
    initShortcutsHelp();
  }

  return { init, showXPToast };
})();

document.addEventListener('DOMContentLoaded', () => Features.init());
