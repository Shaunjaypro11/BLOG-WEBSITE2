/**
 * AI & Learning PH - Master Client JavaScript
 * Pure Vanilla ES6+ • Zero Frameworks • Production Ready
 */

// Theme Constants & SVGs
const THEME_STORAGE_KEY = 'ai_learning_ph_theme';

const SUN_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

const MOON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function getSafeTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (e) {
    // Storage access might be restricted
  }
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return systemPrefersDark ? 'dark' : 'light';
}

function setSafeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // Storage access restricted
  }
}

function initTheme() {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  const currentTheme = getSafeTheme();
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  toggleButtons.forEach(btn => {
    // Remove previous listeners if any to prevent duplicate triggers
    const freshBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(freshBtn, btn);

    freshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      setSafeTheme(newTheme);
      updateThemeIcons(newTheme);
    });
  });

  // Listen to OS theme changes if user hasn't explicitly overridden
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let hasStored = false;
      try {
        hasStored = !!localStorage.getItem(THEME_STORAGE_KEY);
      } catch (err) {}

      if (!hasStored) {
        const sysTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', sysTheme);
        updateThemeIcons(sysTheme);
      }
    });
  } catch (e) {}

  function updateThemeIcons(theme) {
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    buttons.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = SUN_SVG;
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.setAttribute('title', 'Switch to light mode');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.innerHTML = MOON_SVG;
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.setAttribute('title', 'Switch to dark mode');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }
}

/**
 * 2. Global Navigation
 * Handles mobile hamburger toggle, outside clicks, active link states, and scroll effects
 */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  // Sticky header scroll elevation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile menu on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active link highlighter
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check matching routes
    if (currentPath.endsWith(href) || 
       (href === 'index.html' && (currentPath.endsWith('/') || currentPath === '')) ||
       (href === 'posts.html' && currentPath.includes('/posts/'))) {
      link.classList.add('active');
    }
  });
}

/**
 * 3. Reading Progress Indicator
 * Updates a slim top bar based on reading position in article pages
 */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress-bar');
  const articleContent = document.querySelector('.article-content');
  if (!progressBar || !articleContent) return;

  const updateProgress = () => {
    const articleBox = articleContent.getBoundingClientRect();
    const articleTop = articleBox.top + window.scrollY;
    const articleHeight = articleContent.offsetHeight;
    const windowHeight = window.innerHeight;
    const currentScroll = window.scrollY;

    if (currentScroll < articleTop) {
      progressBar.style.width = '0%';
    } else if (currentScroll > articleTop + articleHeight - windowHeight) {
      progressBar.style.width = '100%';
    } else {
      const percentage = ((currentScroll - articleTop) / (articleHeight - windowHeight)) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/**
 * 4. Dynamic Table of Contents (TOC)
 * Generates an automated hierarchy from H2 elements inside .article-content,
 * provides smooth anchor navigation, and highlights active headings.
 */
function initTableOfContents() {
  const articleContent = document.querySelector('.article-content');
  const desktopTocList = document.getElementById('desktop-toc-list');
  const mobileTocList = document.getElementById('mobile-toc-list');
  const mobileTocToggle = document.querySelector('.mobile-toc-toggle');
  const mobileTocContent = document.querySelector('.mobile-toc-content');

  if (!articleContent || (!desktopTocList && !mobileTocList)) return;

  const headings = articleContent.querySelectorAll('h2');
  if (headings.length === 0) return;

  // Toggle mobile accordion
  if (mobileTocToggle && mobileTocContent) {
    mobileTocToggle.addEventListener('click', () => {
      const isOpen = mobileTocContent.classList.toggle('open');
      mobileTocToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const arrow = mobileTocToggle.querySelector('.toc-arrow');
      if (arrow) arrow.textContent = isOpen ? '▲' : '▼';
    });
  }

  const tocItems = [];

  headings.forEach((h2, index) => {
    // Ensure unique ID
    let headingId = h2.getAttribute('id');
    if (!headingId) {
      headingId = 'section-' + (index + 1) + '-' + h2.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      h2.setAttribute('id', headingId);
    }

    const title = h2.textContent.trim();
    
    // Create link item
    const createLi = () => {
      const li = document.createElement('li');
      li.className = 'toc-item';
      const a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + headingId;
      a.textContent = title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(headingId);
        if (target) {
          const headerOffset = 90;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          // Close mobile toc if open
          if (mobileTocContent) mobileTocContent.classList.remove('open');
        }
      });
      li.appendChild(a);
      return { li, a };
    };

    if (desktopTocList) {
      const item = createLi();
      desktopTocList.appendChild(item.li);
      tocItems.push({ id: headingId, link: item.a, heading: h2 });
    }

    if (mobileTocList) {
      const item = createLi();
      mobileTocList.appendChild(item.li);
    }
  });

  // IntersectionObserver to highlight active TOC link
  if ('IntersectionObserver' in window && tocItems.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocItems.forEach(item => {
            if (item.id === id) {
              item.link.classList.add('active');
            } else {
              item.link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(h => observer.observe(h));
  }
}

/**
 * 5. Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 6. Social Share & Copy Link Handler
 * Works with native navigator.clipboard and displays feedback toast
 */
function initShareButtons() {
  const copyBtns = document.querySelectorAll('.share-btn-copy');
  const toast = document.getElementById('copy-toast') || createCopyToast();

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const currentUrl = window.location.href;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(currentUrl);
        } else {
          // Fallback
          const tempInput = document.createElement('input');
          tempInput.value = currentUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
        showToast("Link copied!");
      } catch (err) {
        showToast("Link copied!");
      }
    });
  });

  // Social sharing popups
  const fbBtns = document.querySelectorAll('.share-btn-facebook');
  fbBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    });
  });

  const xBtns = document.querySelectorAll('.share-btn-x');
  xBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(document.title);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    });
  });

  const liBtns = document.querySelectorAll('.share-btn-linkedin');
  liBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
    });
  });

  function createCopyToast() {
    const el = document.createElement('div');
    el.id = 'copy-toast';
    el.className = 'copy-toast';
    document.body.appendChild(el);
    return el;
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
}

/**
 * 7. Search & Real-time Filter (posts.html)
 * Searches post cards by Title, Category, Description, and Keywords
 */
let currentCategory = 'All';

function initSearch() {
  const searchInput = document.getElementById('posts-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    filterPosts();
  });
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'All';
      filterPosts();
    });
  });
}

function filterPosts() {
  const searchInput = document.getElementById('posts-search-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const postCards = document.querySelectorAll('.post-card');
  const countIndicator = document.getElementById('posts-count-indicator');
  const noResultsBox = document.getElementById('no-results-box');

  let visibleCount = 0;

  postCards.forEach(card => {
    const title = (card.getAttribute('data-title') || card.querySelector('.post-card-title')?.textContent || '').toLowerCase();
    const category = card.getAttribute('data-category') || '';
    const desc = (card.getAttribute('data-description') || card.querySelector('.post-card-excerpt')?.textContent || '').toLowerCase();
    const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();

    const matchesCategory = (currentCategory === 'All' || category === currentCategory);
    const matchesSearch = !query || title.includes(query) || desc.includes(query) || category.toLowerCase().includes(query) || keywords.includes(query);

    if (matchesCategory && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (countIndicator) {
    countIndicator.textContent = `Showing ${visibleCount} of ${postCards.length} articles`;
  }

  if (noResultsBox) {
    noResultsBox.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/**
 * 8. Contact Form Validation
 * Checks required fields, email formatting, and displays the required static site notice
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const statusBox = document.getElementById('contact-status-box');

    let isValid = true;

    // Name Validation
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Full Name is required.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showFieldError(emailInput, 'Please provide a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    // Subject Validation
    if (!subjectInput.value.trim()) {
      showFieldError(subjectInput, 'Please specify a subject.');
      isValid = false;
    } else {
      clearFieldError(subjectInput);
    }

    // Message Validation (min length 15 characters)
    if (!messageInput.value.trim() || messageInput.value.trim().length < 15) {
      showFieldError(messageInput, 'Message must be at least 15 characters long.');
      isValid = false;
    } else {
      clearFieldError(messageInput);
    }

    if (isValid && statusBox) {
      statusBox.className = 'form-status-box success';
      statusBox.textContent = 'Your message has been validated. Connect this form to an email service before using it for real submissions.';
      statusBox.style.display = 'block';
      form.reset();
      
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  function showFieldError(input, msg) {
    const parent = input.parentElement;
    let errorEl = parent.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      parent.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    input.style.borderColor = 'var(--ph-red)';
  }

  function clearFieldError(input) {
    const parent = input.parentElement;
    const errorEl = parent.querySelector('.form-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
    input.style.borderColor = 'var(--border)';
  }
}

/**
 * 9. Newsletter Subscription Handler
 * Validates email address and outputs required static demo statement
 */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletter-email');
    const notice = document.getElementById('newsletter-notice');
    if (!input) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
      if (notice) {
        notice.textContent = 'Please enter a valid email address.';
        notice.style.color = 'var(--ph-red)';
      }
      return;
    }

    if (notice) {
      notice.textContent = 'Newsletter integration required for live subscriptions.';
      notice.style.color = 'var(--accent)';
    }
    input.value = '';
  });
}

/**
 * 10. Scroll Reveal Animations (IntersectionObserver)
 * Subtle entrance transitions for cards and sections
 */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('is-visible'));
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('is-visible'));
  }
}

/**
 * 11. Article Card Direct Navigation Handler
 * Makes the entire card surface, thumbnail, and "Read More" triggers reliably navigable
 */
function initPostCardClicks() {
  const cards = document.querySelectorAll('.post-card');
  cards.forEach(card => {
    const link = card.querySelector('a.post-card-readmore, .post-card-title a, a');
    if (link) {
      const href = link.getAttribute('href');
      if (href) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          // If clicked directly on an anchor or button inside, standard navigation proceeds
          if (e.target.closest('a') || e.target.closest('button')) {
            return;
          }
          window.location.href = href;
        });
      }
    }
  });
}

/**
 * Global Initialization
 */
function initAll() {
  initTheme();
  initNavigation();
  initReadingProgress();
  initTableOfContents();
  initBackToTop();
  initShareButtons();
  initSearch();
  initFilters();
  initContactForm();
  initNewsletter();
  initScrollAnimations();
  initPostCardClicks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

