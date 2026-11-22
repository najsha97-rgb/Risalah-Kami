/**
 * ==========================================================================
 * RISALAH KAMI: TETRALOGI FIKRAH AL-IMAM HASAN AL-BANNA
 * Client-Side JavaScript Logic (Al-Raqā'iq & Tanẓīr Inspired Engine)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    currentRisalahId: 'dawatuna',
    currentSectionIndex: 0,
    currentViewMode: 'full', // 'full', 'summary', 'quotes'
    fontSize: parseFloat(localStorage.getItem('risalah_reader_font_size')) || 1.06,
    theme: localStorage.getItem('risalah_reader_theme') || 'dark'
  };

  // DOM Elements
  const readingProgress = document.getElementById('readingProgress');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const fontDecBtn = document.getElementById('fontDecBtn');
  const fontIncBtn = document.getElementById('fontIncBtn');

  const searchOpenBtn = document.getElementById('searchOpenBtn');
  const searchModal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClearBtn = document.getElementById('searchClearBtn');

  const downloadModalBtn = document.getElementById('downloadModalBtn');
  const downloadModal = document.getElementById('downloadModal');
  const downloadCloseBtn = document.getElementById('downloadCloseBtn');

  const sidebarToggle = document.getElementById('sidebarToggle');
  const chapterSidebar = document.getElementById('chapterSidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const chapterList = document.getElementById('chapterList');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const sidebarRisalahBadge = document.getElementById('sidebarRisalahBadge');
  const sidebarRisalahName = document.getElementById('sidebarRisalahName');

  const featRandomQuoteBtn = document.getElementById('featRandomQuoteBtn');
  const featSummaryBtn = document.getElementById('featSummaryBtn');
  const featDocsBtn = document.getElementById('featDocsBtn');

  const risalahTabs = document.querySelectorAll('.risalah-tab');
  const headerTabBtns = document.querySelectorAll('.header-tab-btn');

  // Hero Card Elements
  const heroTitle = document.getElementById('heroTitle');
  const heroArabic = document.getElementById('heroArabic');
  const heroDesc = document.getElementById('heroDesc');
  const metaFasalCount = document.getElementById('metaFasalCount');
  const metaSubCount = document.getElementById('metaSubCount');
  const metaQuoteCount = document.getElementById('metaQuoteCount');

  // Subheading Banner Elements
  const bannerSectionNumber = document.getElementById('bannerSectionNumber');
  const bannerArabicGold = document.getElementById('bannerArabicGold');
  const activeSectionHeading = document.getElementById('activeSectionHeading');

  // Views Containers
  const fullTextView = document.getElementById('fullTextView');
  const summaryView = document.getElementById('summaryView');
  const quotesView = document.getElementById('quotesView');
  const activeChapterContent = document.getElementById('activeChapterContent');
  const summaryGrid = document.getElementById('summaryGrid');
  const quotesGrid = document.getElementById('quotesGrid');

  // Pager Elements
  const prevChapterBtn = document.getElementById('prevChapterBtn');
  const nextChapterBtn = document.getElementById('nextChapterBtn');
  const prevChapterTitle = document.getElementById('prevChapterTitle');
  const nextChapterTitle = document.getElementById('nextChapterTitle');
  const toast = document.getElementById('toast');

  // Initialize App
  initApp();

  function initApp() {
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    renderCurrentRisalah();
    setupEventListeners();
    registerServiceWorker();
  }

  // Get Current Risalah Object
  function getCurrentRisalah() {
    return RISALAH_DATA.find(r => r.id === state.currentRisalahId) || RISALAH_DATA[0];
  }

  // Render Whole Risalah Context
  function renderCurrentRisalah() {
    const risalah = getCurrentRisalah();
    const rIdx = RISALAH_DATA.findIndex(r => r.id === state.currentRisalahId) + 1;

    // 1. Update Hero Card
    heroTitle.textContent = risalah.title.toUpperCase();
    heroArabic.textContent = risalah.arabic_title;
    heroDesc.textContent = risalah.subtitle;

    metaFasalCount.textContent = `${risalah.sections_count} Bahagian Lengkap`;
    metaSubCount.textContent = `Risalah 0${rIdx} dari 04`;
    metaQuoteCount.textContent = `${risalah.quotes ? risalah.quotes.length : 10} Mutiara Hikmah`;

    // 2. Update Sidebar Title
    sidebarRisalahBadge.textContent = `RISALAH 0${rIdx}`;
    sidebarRisalahName.textContent = risalah.title;

    // 3. Render Sidebar Items
    renderSidebarChapters(risalah);

    // 4. Render Active View
    if (state.currentViewMode === 'full') {
      renderActiveSection();
    } else if (state.currentViewMode === 'summary') {
      renderSummary(risalah);
    } else if (state.currentViewMode === 'quotes') {
      renderQuotes(risalah);
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render Sidebar Chapters List
  function renderSidebarChapters(risalah, filterText = '') {
    chapterList.innerHTML = '';
    const q = filterText.toLowerCase().trim();

    risalah.sections.forEach((sec, idx) => {
      if (q && !sec.title.toLowerCase().includes(q)) return;

      const li = document.createElement('li');
      li.className = `chapter-item ${idx === state.currentSectionIndex ? 'active' : ''}`;
      li.innerHTML = `
        <span class="ch-num">${String(sec.number).padStart(2, '0')}.</span>
        <span class="ch-title">${sec.title}</span>
      `;
      li.addEventListener('click', () => {
        state.currentSectionIndex = idx;
        switchViewMode('full');
        renderActiveSection();
        closeSidebar();
      });
      chapterList.appendChild(li);
    });

    if (chapterList.children.length === 0) {
      chapterList.innerHTML = '<li class="text-muted" style="padding:10px;font-size:0.8rem;">Tiada tajuk berpadanan.</li>';
    }
  }

  // Render Active Section Content
  function renderActiveSection() {
    const risalah = getCurrentRisalah();
    const sec = risalah.sections[state.currentSectionIndex];
    if (!sec) return;

    // Update Subheading Banner
    bannerSectionNumber.textContent = `FASAL ${String(sec.number).padStart(2, '0')} / ${String(risalah.sections.length).padStart(2, '0')}`;
    
    // Ekstrak teks Arab dari tajuk fasal jika ada (cth: (المقياس))
    const arMatch = sec.title.match(/\(([\u0600-\u06FF\s]+)\)/);
    bannerArabicGold.textContent = arMatch ? arMatch[1] : risalah.arabic_title;
    activeSectionHeading.textContent = sec.title.replace(/\([\u0600-\u06FF\s]+\)/, '').trim();

    // Render HTML Content
    activeChapterContent.innerHTML = sec.html;

    // Highlight in sidebar
    const items = chapterList.querySelectorAll('.chapter-item');
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === state.currentSectionIndex);
    });

    // Pager controls
    updatePager(risalah);

    // Scroll to section banner
    const bannerElem = document.querySelector('.subheading-banner');
    if (bannerElem && window.scrollY > 200) {
      bannerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Pager Update
  function updatePager(risalah) {
    const total = risalah.sections.length;
    const current = state.currentSectionIndex;

    // Prev
    if (current > 0) {
      prevChapterBtn.disabled = false;
      prevChapterTitle.textContent = risalah.sections[current - 1].title;
    } else {
      prevChapterBtn.disabled = true;
      prevChapterTitle.textContent = 'Permulaan Risalah';
    }

    // Next
    if (current < total - 1) {
      nextChapterBtn.disabled = false;
      nextChapterTitle.textContent = risalah.sections[current + 1].title;
    } else {
      nextChapterBtn.disabled = true;
      nextChapterTitle.textContent = 'Akhir Risalah';
    }
  }

  // Render Summary View
  function renderSummary(risalah) {
    summaryGrid.innerHTML = '';
    if (!risalah.summary || risalah.summary.length === 0) {
      summaryGrid.innerHTML = '<p class="text-muted" style="padding:1.5rem;">Tiada ringkasan khusus untuk risalah ini.</p>';
      return;
    }

    risalah.summary.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'summary-card';
      card.innerHTML = `
        <div class="summary-card-header">FASAL ${String(idx + 1).padStart(2, '0')}</div>
        <h4>${item.title}</h4>
        <p>${item.brief}</p>
      `;
      card.addEventListener('click', () => {
        state.currentSectionIndex = idx;
        switchViewMode('full');
        renderActiveSection();
      });
      summaryGrid.appendChild(card);
    });
  }

  // Render Quotes View
  function renderQuotes(risalah) {
    quotesGrid.innerHTML = '';
    if (!risalah.quotes || risalah.quotes.length === 0) {
      quotesGrid.innerHTML = '<p class="text-muted" style="padding:1.5rem;">Tiada mutiara kata direkodkan untuk risalah ini.</p>';
      return;
    }

    risalah.quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      card.innerHTML = `
        <div class="quote-text">"${quote}"</div>
        <div class="quote-actions">
          <button class="quote-action-btn copy-btn"><i class="fas fa-copy"></i> Salin</button>
          <button class="quote-action-btn share-btn"><i class="fas fa-share-nodes"></i> Kongsi</button>
        </div>
      `;

      // Copy Action
      card.querySelector('.copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(`"${quote}" — Al-Imam Hasan al-Banna (${risalah.title})`)
          .then(() => showToast('Mutiara kata berjaya disalin!'))
          .catch(() => showToast('Gagal menyalin teks'));
      });

      // Share Action
      card.querySelector('.share-btn').addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: `Mutiara Kata ${risalah.title}`,
            text: `"${quote}" — Al-Imam Hasan al-Banna`,
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(`"${quote}" — Al-Imam Hasan al-Banna`);
          showToast('Pautan disalin ke papan keratan');
        }
      });

      quotesGrid.appendChild(card);
    });
  }

  // Switch View Mode (Full, Summary, Quotes)
  function switchViewMode(mode) {
    state.currentViewMode = mode;
    headerTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

    fullTextView.classList.toggle('active', mode === 'full');
    summaryView.classList.toggle('active', mode === 'summary');
    quotesView.classList.toggle('active', mode === 'quotes');

    const risalah = getCurrentRisalah();
    if (mode === 'summary') renderSummary(risalah);
    if (mode === 'quotes') renderQuotes(risalah);
    if (mode === 'full') renderActiveSection();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Risalah Tabs
    risalahTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        risalahTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentRisalahId = tab.dataset.risalah;
        state.currentSectionIndex = 0;
        renderCurrentRisalah();
      });
    });

    // Header Mode Tabs
    headerTabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchViewMode(btn.dataset.mode));
    });

    // Feature Cards (Sidebar)
    featRandomQuoteBtn.addEventListener('click', () => {
      switchViewMode('quotes');
      closeSidebar();
    });

    featSummaryBtn.addEventListener('click', () => {
      switchViewMode('summary');
      closeSidebar();
    });

    featDocsBtn.addEventListener('click', () => {
      downloadModal.classList.add('open');
      closeSidebar();
    });

    // Sidebar Search Filter
    sidebarSearchInput.addEventListener('input', (e) => {
      renderSidebarChapters(getCurrentRisalah(), e.target.value);
    });

    // Sidebar Controls
    sidebarToggle.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Pager Handlers
    prevChapterBtn.addEventListener('click', () => {
      if (state.currentSectionIndex > 0) {
        state.currentSectionIndex--;
        renderActiveSection();
      }
    });

    nextChapterBtn.addEventListener('click', () => {
      const risalah = getCurrentRisalah();
      if (state.currentSectionIndex < risalah.sections.length - 1) {
        state.currentSectionIndex++;
        renderActiveSection();
      }
    });

    // Theme Switcher
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });

    // Font Controls
    fontIncBtn.addEventListener('click', () => {
      if (state.fontSize < 1.45) {
        state.fontSize += 0.05;
        applyFontSize(state.fontSize);
      }
    });

    fontDecBtn.addEventListener('click', () => {
      if (state.fontSize > 0.85) {
        state.fontSize -= 0.05;
        applyFontSize(state.fontSize);
      }
    });

    // Search Handlers
    searchOpenBtn.addEventListener('click', openSearchModal);
    searchCloseBtn.addEventListener('click', closeSearchModal);
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });

    searchInput.addEventListener('input', handleSearchInput);
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.innerHTML = '<div class="search-placeholder">Taip kata kunci untuk memulakan carian...</div>';
      searchInput.focus();
    });

    // Download Modal Handlers
    downloadModalBtn.addEventListener('click', () => downloadModal.classList.add('open'));
    downloadCloseBtn.addEventListener('click', () => downloadModal.classList.remove('open'));
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) downloadModal.classList.remove('open');
    });

    // Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape') {
        closeSearchModal();
        downloadModal.classList.remove('open');
        closeSidebar();
      }
    });

    // Reading Progress
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
  }

  // Reading Progress Bar
  function updateReadingProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0) {
      const progress = (scrollTop / scrollHeight) * 100;
      readingProgress.style.width = `${progress}%`;
    }
  }

  // Sidebar Controls
  function openSidebar() {
    chapterSidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    chapterSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  // Search Logic
  function openSearchModal() {
    searchModal.classList.add('open');
    setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearchModal() {
    searchModal.classList.remove('open');
  }

  function handleSearchInput(e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q || q.length < 2) {
      searchResults.innerHTML = '<div class="search-placeholder">Taip sekurang-kurangnya 2 aksara...</div>';
      return;
    }

    const matches = [];
    RISALAH_DATA.forEach(r => {
      r.sections.forEach((sec, sIdx) => {
        const plainText = sec.html.replace(/<[^>]+>/g, ' ');
        const matchIdx = plainText.toLowerCase().indexOf(q);
        if (matchIdx !== -1) {
          const start = Math.max(0, matchIdx - 40);
          const end = Math.min(plainText.length, matchIdx + q.length + 60);
          let snippet = plainText.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < plainText.length) snippet = snippet + '...';

          const regex = new RegExp(`(${q})`, 'gi');
          const highlightedSnippet = snippet.replace(regex, '<mark style="background:#F59E0B;color:#000;border-radius:2px;padding:0 2px;">$1</mark>');

          matches.push({
            risalahId: r.id,
            risalahTitle: r.title,
            sectionIndex: sIdx,
            sectionTitle: sec.title,
            snippet: highlightedSnippet
          });
        }
      });
    });

    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="search-placeholder">Tiada padanan dijumpai untuk "<strong>${q}</strong>".</div>`;
      return;
    }

    searchResults.innerHTML = matches.map(m => `
      <div class="search-hit-item" data-risalah="${m.risalahId}" data-sec="${m.sectionIndex}">
        <span class="hit-risalah">${m.risalahTitle}</span>
        <div class="hit-title">${m.sectionTitle}</div>
        <div class="hit-snippet">${m.snippet}</div>
      </div>
    `).join('');

    searchResults.querySelectorAll('.search-hit-item').forEach(item => {
      item.addEventListener('click', () => {
        state.currentRisalahId = item.dataset.risalah;
        state.currentSectionIndex = parseInt(item.dataset.sec, 10);

        risalahTabs.forEach(t => t.classList.toggle('active', t.dataset.risalah === state.currentRisalahId));
        switchViewMode('full');
        renderCurrentRisalah();
        closeSearchModal();
      });
    });
  }

  // Theme Helpers
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('risalah_reader_theme', theme);
    state.theme = theme;
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeToggleBtn.setAttribute('title', theme === 'dark' ? 'Tukar ke Mod Terang' : 'Tukar ke Mod Gelap');
  }

  // Font Helpers
  function applyFontSize(size) {
    document.documentElement.style.setProperty('--reader-font-size', `${size}rem`);
    localStorage.setItem('risalah_reader_font_size', size);
    state.fontSize = size;
  }

  // Toast Helper
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('ServiceWorker berjaya didaftarkan untuk Risalah-Kami'))
        .catch(err => console.log('ServiceWorker gagal didaftarkan:', err));
    }
  }
});
