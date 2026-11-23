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
    quoteFontMode: localStorage.getItem('risalah_quote_font_mode') || 'amiri', // 'amiri' (default), 'compare', 'almarai'
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
  const ummahPbiView = document.getElementById('ummahPbiView');
  const activeChapterContent = document.getElementById('activeChapterContent');
  const summaryGrid = document.getElementById('summaryGrid');
  const quotesGrid = document.getElementById('quotesGrid');
  const featUmmahPbiBtn = document.getElementById('featUmmahPbiBtn');

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

    // 4. Render Active View Secara Eksklusif
    switchViewMode(state.currentViewMode || 'full');

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Format teks Arab dalam tajuk fasal: bawa turun simbol kurungan '(' bersama teks ke bawah agar tidak terputus
  function formatTitleArabic(title) {
    if (!title) return '';
    // Buang sebarang tag HTML mentah sedia ada
    const clean = title.replace(/<[^>]+>/g, '').trim();

    // 1. Tajuk yang semata-mata kurungan, cth: "(هَلْ نَحْنُ قَوْمٌ عَمَلِيُّونَ؟)"
    if (clean.startsWith('(') && clean.endsWith(')')) {
      const inner = clean.slice(1, -1).trim();
      const innerFormatted = inner.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\.\,\?\:\!ـ\-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF])/g, '<span class="arabic-inline-almarai" dir="rtl">$1</span>');
      return `<span class="title-sub-wrap"><span class="title-bracket">(</span>${innerFormatted}<span class="title-bracket">)</span></span>`;
    }

    // 2. Tajuk dwibahasa dengan kurungan di hujung: "Tajuk BM (Arab / Transliterasi)"
    const m = clean.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      const mainPart = m[1].trim();
      const parenContent = m[2].trim();
      const parenFormatted = parenContent.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\.\,\?\:\!ـ\-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF])/g, '<span class="arabic-inline-almarai" dir="rtl">$1</span>');
      return `${mainPart} <span class="title-sub-wrap"><span class="title-bracket">(</span>${parenFormatted}<span class="title-bracket">)</span></span>`;
    }

    // 3. Tajuk tanpa kurungan luar, tetapi ada teks Arab
    return clean.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\.\,\?\:\!ـ\-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF])/g, '<span class="arabic-inline-almarai" dir="rtl">$1</span>');
  }

  // Render Sidebar Chapters List
  function renderSidebarChapters(risalah, filterText = '') {
    chapterList.innerHTML = '';
    const q = filterText.toLowerCase().trim();

    risalah.sections.forEach((sec, idx) => {
      if (q && !sec.title.toLowerCase().includes(q)) return;

      const li = document.createElement('li');
      li.className = `chapter-item ${idx === state.currentSectionIndex ? 'active' : ''}`;
      const titleWithoutNum = sec.title.replace(/^\s*\d+[\.\-\)]\s*/, '');
      li.innerHTML = `
        <span class="ch-num">${String(sec.number).padStart(2, '0')}.</span>
        <span class="ch-title">${formatTitleArabic(titleWithoutNum)}</span>
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

    // Ekstrak teks Arab dari tajuk fasal jika ada (cth: (المصارحة - Al-Muṣāraḥah) atau (المقياس))
    const arMatch = sec.title.match(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\.\,\?\:\!ـ\-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF])/);
    bannerArabicGold.textContent = arMatch ? arMatch[0].trim() : (sec.title_ar || risalah.arabic_title);
    
    // Tajuk bersih BM di bawah banner (buang nombor pendua dan kurungan Arab)
    const cleanHeading = sec.title
      .replace(/^\s*\d+[\.\-\)]\s*/, '')
      .replace(/\s*\([^)]*[\u0600-\u06FF][^)]*\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    activeSectionHeading.textContent = cleanHeading || sec.title;

    // Render HTML Content
    activeChapterContent.innerHTML = sec.html;

    // Safety pass: Pastikan sebarang teks Arab dalam tajuk (h1-h6) atau kurungan berformat Almarai Gold
    activeChapterContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach(el => {
      if (/[\u0600-\u06FF]/.test(el.innerHTML)) {
        // Jika el adalah heading dan belum ada pembungkus arabic-inline-almarai
        if (/^h[1-6]$/i.test(el.tagName) && !el.querySelector('.arabic-inline-almarai')) {
          el.innerHTML = el.innerHTML.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\.\,\?\:\!ـ\-]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF])/g, '<span class="arabic-inline-almarai" dir="rtl">$1</span>');
        }
      }
    });

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
      prevChapterTitle.innerHTML = formatTitleArabic(risalah.sections[current - 1].title);
    } else {
      prevChapterBtn.disabled = true;
      prevChapterTitle.textContent = 'Permulaan Risalah';
    }

    // Next
    if (current < total - 1) {
      nextChapterBtn.disabled = false;
      nextChapterTitle.innerHTML = formatTitleArabic(risalah.sections[current + 1].title);
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
      const headerBadge = item.badge || `FASAL ${String(idx + 1).padStart(2, '0')}`;
      card.innerHTML = `
        <div class="summary-card-header">${headerBadge}</div>
        <h4>${formatTitleArabic(item.title)}</h4>
        <p>${item.brief}</p>
      `;
      card.addEventListener('click', () => {
        state.currentSectionIndex = (item.start_sec !== undefined) ? item.start_sec : idx;
        switchViewMode('full');
        renderActiveSection();
      });
      summaryGrid.appendChild(card);
    });
  }

  // Render Quotes View
  function renderQuotes(risalah) {
    quotesGrid.innerHTML = '';
    const hasRich = risalah.golden_quotes_rich && risalah.golden_quotes_rich.length > 0;
    const quotesList = hasRich ? risalah.golden_quotes_rich : (risalah.quotes || []);

    if (quotesList.length === 0) {
      quotesGrid.innerHTML = '<p class="text-muted" style="padding:1.5rem;">Tiada mutiara kata direkodkan untuk risalah ini.</p>';
      return;
    }

    quotesList.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'quote-card';

      let quoteText = '';
      let themeTag = '';
      let arSnippet = '';
      let refFasal = '';

      let fontClass = 'font-amiri-style';
      let fontBadge = '';

      if (state.quoteFontMode === 'compare') {
        if (idx % 2 === 0) {
          fontClass = 'font-almarai-style';
          fontBadge = `<span class="quote-font-badge badge-almarai"><i class="fas fa-font"></i> Font 1: Almarai Gold</span>`;
        } else {
          fontClass = 'font-amiri-style';
          fontBadge = `<span class="quote-font-badge badge-amiri"><i class="fas fa-pen-nib"></i> Font 2: Amiri Gold</span>`;
        }
      } else if (state.quoteFontMode === 'amiri') {
        fontClass = 'font-amiri-style';
      } else if (state.quoteFontMode === 'almarai') {
        fontClass = 'font-almarai-style';
      }

      if (hasRich) {
        quoteText = item.quote;
        themeTag = `<span class="quote-theme-badge"><i class="fas fa-sparkles"></i> ${item.theme}</span>`;
        if (item.ar_snippet) {
          arSnippet = `<div class="quote-ar-snippet ${fontClass}" dir="rtl" lang="ar">${item.ar_snippet}</div>`;
        }
        refFasal = `<div class="quote-fasal-ref"><i class="fas fa-bookmark ref-icon"></i> ${item.fasal}</div>`;
      } else {
        quoteText = typeof item === 'string' ? item : item.quote;
        themeTag = `<span class="quote-theme-badge">HIKMAH 0${idx + 1}</span>`;
      }

      card.innerHTML = `
        <div class="quote-card-header">
          <span class="quote-number">HIKMAH ${String(idx + 1).padStart(2, '0')}</span>
          ${themeTag}
          ${fontBadge}
        </div>
        ${arSnippet}
        <div class="quote-text">"${quoteText}"</div>
        ${refFasal}
        <div class="quote-actions">
          <button class="quote-action-btn copy-btn"><i class="fas fa-copy"></i> Salin</button>
          <button class="quote-action-btn share-btn"><i class="fas fa-share-nodes"></i> Kongsi</button>
        </div>
      `;

      // Copy Action
      card.querySelector('.copy-btn').addEventListener('click', () => {
        const fullShare = `"${quoteText}"\n— Al-Imam Hasan al-Banna (${hasRich ? item.fasal : risalah.title})`;
        navigator.clipboard.writeText(fullShare)
          .then(() => showToast('Mutiara kata berjaya disalin!'))
          .catch(() => showToast('Gagal menyalin teks'));
      });

      // Share Action
      card.querySelector('.share-btn').addEventListener('click', () => {
        const fullShare = `"${quoteText}"\n— Al-Imam Hasan al-Banna (${hasRich ? item.fasal : risalah.title})`;
        if (navigator.share) {
          navigator.share({
            title: `Mutiara Hikmah: ${hasRich ? item.theme : risalah.title}`,
            text: fullShare,
            url: window.location.href
          }).catch(() => { });
        } else {
          navigator.clipboard.writeText(fullShare);
          showToast('Pautan disalin ke papan keratan');
        }
      });

      quotesGrid.appendChild(card);
    });
  }

  // Switch View Mode (Full, Summary, Quotes, Ummah_PBI)
  function switchViewMode(mode) {
    state.currentViewMode = mode;
    headerTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

    fullTextView.classList.toggle('active', mode === 'full');
    summaryView.classList.toggle('active', mode === 'summary');
    quotesView.classList.toggle('active', mode === 'quotes');
    if (ummahPbiView) {
      ummahPbiView.classList.toggle('active', mode === 'ummah_pbi');
    }

    // Hero Kad Risalah: HANYA dipaparkan dalam mod Versi Penuh ('full').
    // Dalam mod Ringkasan, Mutiara Hikmah, dan Ummah & PBI, hero ini disembunyikan sepenuhnya.
    const heroElem = document.getElementById('risalahHero');
    if (heroElem) {
      heroElem.style.display = (mode === 'full') ? 'block' : 'none';
    }

    const risalah = getCurrentRisalah();
    if (mode === 'summary') renderSummary(risalah);
    if (mode === 'quotes') renderQuotes(risalah);
    if (mode === 'full') renderActiveSection();

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (featUmmahPbiBtn) {
      featUmmahPbiBtn.addEventListener('click', () => {
        switchViewMode('ummah_pbi');
        closeSidebar();
      });
    }

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
    
    // Font Compare Bar Pill Buttons (Amiri Gold by default)
    const fontCompareBar = document.getElementById('fontCompareBar');
    if (fontCompareBar) {
      // Sync initial active state with state.quoteFontMode
      fontCompareBar.querySelectorAll('.font-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.fontMode === state.quoteFontMode);
        btn.addEventListener('click', () => {
          fontCompareBar.querySelectorAll('.font-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.quoteFontMode = btn.dataset.fontMode;
          localStorage.setItem('risalah_quote_font_mode', state.quoteFontMode);
          renderQuotes(getCurrentRisalah());
        });
      });
    }

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
        <div class="hit-title">${formatTitleArabic(m.sectionTitle)}</div>
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
