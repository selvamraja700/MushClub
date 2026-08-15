/* ═══════════════════════════════════════════════════════
   MUSHCLUB — Main JavaScript
   Interactions, animations, form handling, product modal
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Service Worker Registration ─── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

  /* ─── FAQ Release Feature ─── */
  const FAQ_RELEASE_DATE = "2026-12-01";

  function initializeFaqFeature() {
    const releaseDate = new Date(FAQ_RELEASE_DATE).getTime();
    const now = new Date().getTime();

    if (now < releaseDate) {
      document.body.classList.add('faq-unreleased');
    } else {
      document.body.classList.add('faq-released');
    }
  }

  initializeFaqFeature();

  /* ─── Product Data ─── */
  const PRODUCTS = [
    {
      id: 'oyster',
      name: 'Oyster Mushroom',
      category: 'Gourmet',
      badge: 'Gourmet',
      brief: 'Delicate flavor with velvety texture, perfect for stir-fries and soups.',
      description: 'Grown on premium hardwood substrates, our Oyster Mushrooms offer an exceptional velvety texture and a delicate, anise-like aroma. Perfect for elevating any dish.',
      nutrition: [
        'Rich in protein and dietary fiber',
        'High in B vitamins (B3, B5, B6)',
        'Excellent source of antioxidants',
        'Supports heart health',
        'Low in calories, high in nutrients'
      ],
      forms: ['Fresh', 'Dried', 'Powdered'],
      image: 'https://ik.imagekit.io/Selvamraj700/MushClub/Oyster.png'
    },
    {
      id: 'training-kit',
      name: 'Oyster Mushroom Training Kit',
      category: 'Cultivation',
      badge: 'Starter Kit',
      brief: 'Everything you need to start growing your own oyster mushrooms at home.',
      description: 'The perfect starter kit for beginners. Includes premium oyster mushroom spawn, sterilized hardwood substrate, a spray bottle, and grow bags. Learn the art of mycology hands-on with our easy-to-follow training guide.',
      nutrition: [
        'Complete cultivation setup',
        'Premium spawn and substrate',
        'Includes spray bottle and bags',
        'Beginner friendly',
        'High success rate'
      ],
      forms: ['Standard Kit'],
      image: 'https://ik.imagekit.io/Selvamraj700/mushroomKit.png'
    },
    {
      id: 'spawn',
      name: 'Premium Mushroom Spawn',
      category: 'Cultivation',
      badge: 'Cultivation',
      brief: 'High-yielding, vigorous grain spawn for commercial and hobby growers.',
      description: 'Our premium mushroom spawn is cultivated under strict sterile conditions. We ensure vigorous mycelial growth for maximum yield and reliability in your own mushroom farm.',
      nutrition: [
        'Vigorous first-generation mycelium',
        'Sterile grain base',
        'High yield potential',
        'Contamination-free guarantee',
        'Perfect for commercial inoculation'
      ],
      forms: ['Grain Spawn', 'Sawdust Spawn', 'Liquid Culture'],
      image: 'https://ik.imagekit.io/Selvamraj700/MushClub/spawnPM.png'
    },
    {
      id: 'pellet',
      name: 'Hardwood Substrate Pellets',
      category: 'Cultivation',
      badge: 'Cultivation',
      brief: '100% natural hardwood pellets for optimal mushroom cultivation.',
      description: 'The perfect foundation for gourmet mushroom growth. Our premium hardwood pellets expand easily and provide the ideal nutritional base for a variety of wood-loving mushrooms.',
      nutrition: [
        '100% Natural Hardwood blend',
        'No chemical additives',
        'High moisture retention capacity',
        'Perfect carbon-to-nitrogen ratio',
        'Ideal for Oyster and Shiitake'
      ],
      forms: ['20lb Bag', '50lb Bag', 'Bulk Sack'],
      image: 'https://ik.imagekit.io/Selvamraj700/MushClub/pellet.png'
    }
  ];

  /* ─── DOM References ─── */
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const productGrid = document.getElementById('products-grid');
  const modalOverlay = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const enquiryForm = document.getElementById('enquiry-form');
  const formContent = document.getElementById('form-content');
  const formSuccess = document.getElementById('form-success');
  const formContainer = document.getElementById('form-container');
  const formClose = document.getElementById('form-close');
  const submitBtn = document.getElementById('submit-btn');
  const submitAnother = document.getElementById('submit-another');
  const formProcessing = document.getElementById('form-processing');
  const formCancel = document.getElementById('form-cancel');
  const processingStatus = document.getElementById('processing-status');
  const processingClose = document.getElementById('processing-close');

  // FAQ Modal
  const faqContainer = document.getElementById('faq');
  const faqClose = document.getElementById('faq-close');
  // Enquiry Form State Machine
  const PROCESSING_DELAY = 1500; // ms
  const FORM_STATES = { IDLE: "idle", PROCESSING: "processing", SUCCESS: "success", CANCELLED: "cancelled" };
  let currentState = FORM_STATES.IDLE;
  let processingTimer = null;
  function renderState(state) {
    // hide all sections
    if (formContent) formContent.style.display = 'none';
    if (formProcessing) formProcessing.style.display = 'none';
    if (formSuccess) formSuccess.classList.remove('active');
    if (formCancel) formCancel.style.display = 'none';
    // show based on state
    switch (state) {
      case FORM_STATES.IDLE:
        if (formContent) formContent.style.display = 'block';
        break;
      case FORM_STATES.PROCESSING:
        if (formProcessing) formProcessing.style.display = 'block';
        break;
      case FORM_STATES.SUCCESS:
        if (formSuccess) formSuccess.classList.add('active');
        break;
      case FORM_STATES.CANCELLED:
        if (formCancel) formCancel.style.display = 'block';
        break;
    }
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════
     OVERLAY MANAGER — Single Source of Truth

     All overlay state, scroll locking, DOM class toggling,
     ARIA attribute updates, and focus management are
     controlled exclusively through this manager.

     Public API:
       overlayManager.open(name)          — open an overlay
       overlayManager.close(overrideY?)   — close the active overlay
       overlayManager.switchTo(name)      — alias for open (seamless transition)
       overlayManager.getActive()         — current overlay name or null
       overlayManager.isActive()          — true if any overlay is open
       overlayManager.isLocked()          — true if scroll is locked
       overlayManager.getSavedScrollY()   — saved scroll position
     ═══════════════════════════════════════════════════════ */
  var MOBILE_BREAKPOINT = 768;

  const overlayManager = (function () {
    // ─── Private state — no external code may modify these ───
    var activeOverlay = null;   // null | 'mobile-menu' | 'product-modal' | 'enquiry-form'
    var savedScrollY = 0;
    var scrollLocked = false;
    var savedFocusElement = null;
    var focusTimerId = null;    // Bug #3: track focus timer to cancel on rapid switches

    // ─── Private: Lock page scroll ───
    // Bug #5 fix: read scrollY BEFORE setting position:fixed.
    // On rapid close→reopen, pageYOffset is 0 because body is still fixed.
    // Guard: only capture when NOT already locked.
    function lockScroll() {
      if (scrollLocked) return;
      // Read the real scroll position while body is still in normal flow
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + savedScrollY + 'px';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
      scrollLocked = true;
    }

    // ─── Private: Unlock page scroll ───
    function unlockScroll(targetElement) {
      if (!scrollLocked) return;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');

      var htmlEl = document.documentElement;
      var prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = 'auto'; // Force instant jump
      window.scrollTo(0, savedScrollY); // Instantly restore layout scroll

      if (targetElement) {
        // Run on next tick after layout is restored to do native smooth scroll
        setTimeout(function () {
          htmlEl.style.scrollBehavior = prevBehavior;
          targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }, 0);
      } else {
        htmlEl.style.scrollBehavior = prevBehavior;
      }

      scrollLocked = false;
    }

    // ─── Private: Cancel any pending focus timer ───
    // Bug #3 fix: prevents stale focus() calls after rapid overlay switches
    function cancelFocusTimer() {
      if (focusTimerId !== null) {
        clearTimeout(focusTimerId);
        focusTimerId = null;
      }
    }

    // ─── Private: Apply DOM classes + ARIA for an overlay ───
    // Bug #2 fix: explicitly set pointer-events:auto on the overlay element
    function applyOverlayDOM(name) {
      if (name === 'mobile-menu') {
        if (hamburger) {
          hamburger.classList.add('open');
          hamburger.setAttribute('aria-expanded', 'true');
          hamburger.setAttribute('aria-label', 'Close menu');
        }
        if (mobileMenu) {
          mobileMenu.classList.add('open');
          mobileMenu.setAttribute('aria-hidden', 'false');
          mobileMenu.style.pointerEvents = 'auto';
        }
      } else if (name === 'product-modal') {
        if (modalOverlay) {
          modalOverlay.classList.add('active');
          modalOverlay.setAttribute('aria-hidden', 'false');
          modalOverlay.style.pointerEvents = 'auto';
        }
      } else if (name === 'enquiry-form') {
        if (formContainer) {
          formContainer.classList.add('modal-active');
          formContainer.style.pointerEvents = 'auto';
        }
      }
    }

    // ─── Private: Remove DOM classes + ARIA for an overlay ───
    // Bug #1 fix: set pointer-events:none so the closing/transitioning
    // overlay cannot intercept touches during its CSS transition-out
    function removeOverlayDOM(name) {
      if (name === 'mobile-menu') {
        if (hamburger) {
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open menu');
        }
        if (mobileMenu) {
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.style.pointerEvents = 'none';
        }
      } else if (name === 'product-modal') {
        if (modalOverlay) {
          modalOverlay.classList.remove('active');
          modalOverlay.setAttribute('aria-hidden', 'true');
          modalOverlay.style.pointerEvents = 'none';
        }
      } else if (name === 'enquiry-form') {
        if (formContainer) {
          formContainer.classList.remove('modal-active');
          formContainer.style.pointerEvents = 'none';
        }
      }
    }

    // ─── Public API ───
    return {
      /**
       * Open an overlay by name.
       * If another overlay is already active, it is closed first
       * WITHOUT unlocking scroll (seamless transition).
       */
      open: function (name) {
        if (activeOverlay === name) return;

        // Bug #3: cancel any pending focus timer from the previous overlay
        cancelFocusTimer();

        // Transition: close previous overlay without unlocking scroll
        if (activeOverlay) {
          removeOverlayDOM(activeOverlay);
        }

        // Save focus only when opening from a clean state
        if (!savedFocusElement) {
          savedFocusElement = document.activeElement;
        }

        activeOverlay = name;
        applyOverlayDOM(name);
        lockScroll();

        // Bug #3 fix: focus management with cancellable timer
        if (name === 'product-modal' && modalClose) {
          focusTimerId = setTimeout(function () {
            focusTimerId = null;
            if (activeOverlay === 'product-modal') modalClose.focus();
          }, 100);
        } else if (name === 'enquiry-form') {
          focusTimerId = setTimeout(function () {
            focusTimerId = null;
            if (activeOverlay === 'enquiry-form') {
              var nameField = document.getElementById('name');
              if (nameField) nameField.focus();
            }
          }, 150);
        }
      },

      /**
       * Switch cleanly to a new overlay.
       * Alias for open() — preserves scroll lock during transition.
       */
      switchTo: function (name) {
        this.open(name);
      },

      /**
       * Close the currently active overlay.
       * Unlocks scroll and restores focus.
       */
      close: function (targetElement) {
        if (!activeOverlay) return;

        // Bug #3: cancel any pending focus timer
        cancelFocusTimer();

        removeOverlayDOM(activeOverlay);
        activeOverlay = null;
        unlockScroll(targetElement);

        if (savedFocusElement) {
          savedFocusElement.focus({ preventScroll: true });
          savedFocusElement = null;
        }
      },

      getActive: function () { return activeOverlay; },
      isActive: function () { return activeOverlay !== null; },
      getSavedScrollY: function () { return savedScrollY; },
      isLocked: function () { return scrollLocked; }
    };
  })();

  /* ═══════════════════════════════════════════════════════
     NAVIGATION — Sticky glassmorphism + active section
     ═══════════════════════════════════════════════════════ */
  var lastScrollY = 0;

  function handleNavScroll() {
    if (!nav) return;
    if (overlayManager.isLocked()) return;
    var scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* Active section tracking */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link[data-section], .nav__mobile-link[data-section]');

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sectionId = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.dataset.section === sectionId);
          });
        }
      });
    },
    {
      rootMargin: '-80px 0px -50% 0px',
      threshold: 0
    }
  );

  sections.forEach(function (section) { sectionObserver.observe(section); });

  /* ═══════════════════════════════════════════════════════
     MOBILE MENU — Event Listeners
     All state changes go through overlayManager.
     ═══════════════════════════════════════════════════════ */
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (overlayManager.getActive() === 'mobile-menu') {
        overlayManager.close();
      } else {
        overlayManager.open('mobile-menu');
        initTypewriterGreeting();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     CENTRALIZED OVERLAY HANDLERS
     ═══════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    if (!overlayManager.isActive()) return;

    var active = overlayManager.getActive();

    if (active === 'mobile-menu' && mobileMenu && hamburger) {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        overlayManager.close();
      }
    } else if (active === 'product-modal' && modalOverlay) {
      if (e.target === modalOverlay) {
        currentProduct = null;
        overlayManager.close();
      }
    } else if (active === 'enquiry-form' && formContainer) {
      if (e.target === formContainer) {
        overlayManager.close();
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!overlayManager.isActive()) return;

    if (e.key === 'Escape') {
      if (overlayManager.getActive() === 'product-modal') {
        currentProduct = null;
      }
      overlayManager.close();
      return;
    }

    if (e.key === 'Tab') {
      var activeName = overlayManager.getActive();
      var container = null;
      if (activeName === 'mobile-menu') container = mobileMenu;
      else if (activeName === 'product-modal') container = modalOverlay;
      else if (activeName === 'enquiry-form') container = formContainer;

      if (!container) return;

      var focusables = Array.prototype.slice.call(
        container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });

      if (focusables.length === 0) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !container.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // Handle viewport resize — clean up any mobile overlay
  window.addEventListener('resize', function () {
    if (window.innerWidth >= MOBILE_BREAKPOINT && overlayManager.isActive()) {
      overlayManager.close();
    }
  });

  /* ─── Open Enquiry Form Controller ─── */
  function openEnquiryForm(productPayload) {
    // Pre-select product if provided
    if (productPayload) {
      var productSelect = document.getElementById('product');
      if (productSelect) {
        productSelect.value = typeof productPayload === 'string' ? productPayload : productPayload.id;
        if (window.MushClubForm) {
          window.MushClubForm.validateField(productSelect);
        }
      }
    }

    // On mobile (< 1024px) or when triggered from the mobile menu: Open modal popup directly without page scrolling
    if (window.innerWidth < 1024 || overlayManager.getActive() === 'mobile-menu') {
      if (overlayManager.getActive() === 'mobile-menu') {
        overlayManager.close();
        setTimeout(function () {
          overlayManager.open('enquiry-form');
          var nameField = document.getElementById('name');
          if (nameField) nameField.focus();
        }, 120);
      } else {
        overlayManager.open('enquiry-form');
        var nameField = document.getElementById('name');
        if (nameField) nameField.focus();
      }
      return;
    }

    // Desktop wide view: scroll into contact section
    var contactSection = document.getElementById('contact');
    if (contactSection) {
      if (overlayManager.isActive()) {
        overlayManager.close(contactSection);
      } else {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }

      var nameField = document.getElementById('name');
      setTimeout(function () { if (nameField) nameField.focus(); }, 600);
    } else if (overlayManager.isActive()) {
      overlayManager.close();
    }
  }

  /* ═══════════════════════════════════════════════════════
     SMOOTH SCROLL — with nav offset & clean overlay close
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      var hadOverlay = overlayManager.isActive();
      var isEnquireBtn = anchor.classList.contains('nav__cta') ||
        anchor.classList.contains('nav__mobile-cta') ||
        anchor.classList.contains('btn-secondary') ||
        anchor.classList.contains('contact__mobile-btn');

      // 1. Scroll to top for empty anchors
      if (!targetId || targetId === '#') {
        e.preventDefault();
        if (hadOverlay) overlayManager.close();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        return;
      }

      // 2. Enquire Now CTA buttons -> Open form modal
      if (isEnquireBtn && targetId === '#contact') {
        e.preventDefault();
        openEnquiryForm();
        return;
      }

      // 3. Normal Section Navigation
      var target = document.querySelector(targetId);
      if (!target) return;

      // If an overlay (like mobile menu) is open, close it and scroll
      if (hadOverlay) {
        e.preventDefault();
        overlayManager.close(target); // targetElement scrollIntoView is handled inside close()
      } else {
        // Native CSS smooth scroll + scroll-margin-top will handle it naturally!
        // No JS preventDefault needed here unless we want to override reduced motion manually.
        if (prefersReducedMotion) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'auto' });
        }
      }
    });
  });

  /* ═══════════════════════════════════════════════════════
     SCROLL ANIMATIONS — IntersectionObserver
     ═══════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    var allAnimatable = document.querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-hero');
    if (prefersReducedMotion) {
      allAnimatable.forEach(function (el) {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Instantly reveal top-fold hero elements so page never loads blank
    document.querySelectorAll('.hero *, .nav *').forEach(function (el) {
      if (el.classList.contains('animate-on-scroll') || el.classList.contains('animate-hero')) {
        el.classList.add('visible');
      }
    });

    var animateObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animateObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '100px 0px 100px 0px'
      }
    );

    document.querySelectorAll('.animate-on-scroll, .animate-slide-left').forEach(function (el) {
      animateObserver.observe(el);
    });

    setTimeout(function () {
      document.querySelectorAll('.animate-hero').forEach(function (el) {
        el.classList.add('visible');
      });
    }, 50);
  }

  /* ═══════════════════════════════════════════════════════
     PRODUCT CARDS — Render from data
     ═══════════════════════════════════════════════════════ */
  function renderProductCards() {
    var fragment = document.createDocumentFragment();

    PRODUCTS.forEach(function (product, index) {
      var card = document.createElement('article');
      card.className = 'product-card animate-on-scroll stagger-' + Math.min(index + 1, 8) + ' visible';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View details for ' + product.name);
      card.dataset.productId = product.id;

      card.innerHTML =
        '<div class="product-card__image-container">' +
        '<img class="product-card__image" src="' + product.image + '" alt="' + product.name + ' \u2014 ' + product.brief + '" loading="lazy" width="300" height="225">' +
        '</div>' +
        '<div class="product-card__content">' +
        '<span class="product-card__badge">' + product.badge + '</span>' +
        '<h3 class="product-card__name">' + product.name + '</h3>' +
        '<p class="product-card__desc">' + product.brief + '</p>' +
        '<span class="product-card__link">View Details <span aria-hidden="true">\u2192</span></span>' +
        '</div>';

      card.addEventListener('click', function () { openProductModal(product); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProductModal(product);
        }
      });

      fragment.appendChild(card);
    });

    if (productGrid) {
      productGrid.appendChild(fragment);
    }
  }

  /* ═══════════════════════════════════════════════════════
     PRODUCT MODAL — All state via overlayManager
     ═══════════════════════════════════════════════════════ */
  var currentProduct = null;

  function openProductModal(product) {
    if (!modalOverlay) return;
    currentProduct = product;

    // Set large image (Left Column)
    var modalImage = document.getElementById('modal-image');
    if (modalImage) {
      modalImage.src = product.image;
      modalImage.alt = 'Fresh organic ' + product.name + ' cultivated at MushClub farm';
    }

    // Row 1: Title + Category
    var modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = product.name;
    var modalCategory = document.getElementById('modal-category');
    if (modalCategory) modalCategory.textContent = product.category;

    // Row 2: Specialities (inline tags)
    var formsContainer = document.getElementById('modal-forms');
    if (formsContainer) {
      formsContainer.innerHTML = (product.forms || [])
        .map(function (form) { return '<span class="modal__form-badge">' + form + '</span>'; })
        .join('');
    }

    // Row 3: Health Benefits (Condensed to max 2 short items)
    var nutritionList = document.getElementById('modal-nutrition');
    if (nutritionList) {
      var shortNutrition = (product.nutrition || []).slice(0, 2);
      nutritionList.innerHTML = shortNutrition
        .map(function (item) { return '<li>' + item + '</li>'; })
        .join('');
    }

    // Row 4: Short Description (Condensed to 1 short sentence max, ~110 chars max)
    var modalDescription = document.getElementById('modal-description');
    if (modalDescription) {
      var rawText = product.brief || product.description || '';
      var sentence = rawText.split('.')[0] + '.';
      if (sentence.length > 110) {
        sentence = sentence.substring(0, 105).trim() + '\u2026';
      }
      modalDescription.textContent = sentence;
    }

    overlayManager.open('product-modal');
  }

  // Row 5 / Action: Buy Now button → Enquiry form transition
  var modalBuyNow = document.getElementById('modal-buy-now');
  if (modalBuyNow) {
    modalBuyNow.addEventListener('click', function () {
      var product = currentProduct;
      currentProduct = null;
      openEnquiryForm(product);
    });
  }

  // Product modal close button
  if (modalClose) {
    modalClose.addEventListener('click', function () {
      overlayManager.close();
      currentProduct = null;
    });
  }

  // Enquiry form modal close button
  if (formClose) {
    formClose.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      overlayManager.close();
    });
  }

  var cancelReturn = document.getElementById('cancel-return');
  if (cancelReturn) {
    cancelReturn.addEventListener('click', function (e) {
      e.preventDefault();
      renderState(FORM_STATES.IDLE);
      overlayManager.close();
    });
  }



  // Focus trap for product modal
  if (modalOverlay) {
    modalOverlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = modalOverlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      var firstEl = focusable[0];
      var lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }

  // Close mobile enquiry form modal — close button
  if (formClose) {
    formClose.addEventListener('click', function (e) {
      if (window.MushClubForm && window.MushClubForm.getState() === 'processing') {
        window.MushClubForm.setState('cancelled');
      } else if (window.MushClubForm && (window.MushClubForm.getState() === 'success' || window.MushClubForm.getState() === 'cancelled')) {
        overlayManager.close();
        setTimeout(function () { if (window.MushClubForm) window.MushClubForm.reset(); }, 300);
      } else {
        overlayManager.close();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     PRODUCTION AI STREAMING TEXT ENGINE (rAF 60FPS)
     ═══════════════════════════════════════════════════════ */
  var AIStreamingText = (function () {
    var activeAnimationFrame = null;
    var postBlinkTimer = null;

    return {
      stream: function (options) {
        var element = options.element;
        var cursor = options.cursor;
        var text = options.text || '';
        var speed = options.speed || 30; // ms per character
        var onComplete = options.onComplete;

        if (!element) return;

        // Cancel previous rAF frame and timers
        if (activeAnimationFrame) {
          cancelAnimationFrame(activeAnimationFrame);
          activeAnimationFrame = null;
        }
        if (postBlinkTimer) {
          clearTimeout(postBlinkTimer);
          postBlinkTimer = null;
        }

        // Accessibility: Check prefers-reduced-motion
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          element.textContent = text;
          if (cursor) cursor.style.display = 'none';
          if (typeof onComplete === 'function') onComplete();
          return;
        }

        // Reset element and cursor
        element.textContent = '';
        if (cursor) {
          cursor.style.display = 'inline-block';
          cursor.style.opacity = '1';
        }

        var index = 0;
        var lastTime = performance.now();
        var accumulatedTime = 0;

        function step(now) {
          var delta = now - lastTime;
          lastTime = now;
          accumulatedTime += delta;

          while (accumulatedTime >= speed && index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            accumulatedTime -= speed;
          }

          if (index < text.length) {
            activeAnimationFrame = requestAnimationFrame(step);
          } else {
            activeAnimationFrame = null;
            if (cursor) {
              postBlinkTimer = setTimeout(function () {
                if (cursor) cursor.style.display = 'none';
              }, 2500);
            }
            if (typeof onComplete === 'function') {
              onComplete();
            }
          }
        }

        activeAnimationFrame = requestAnimationFrame(step);
      }
    };
  })();

  function initTypewriterGreeting() {
    var textElement = document.getElementById('typewriter-text');
    var cursorElement = document.getElementById('typewriter-cursor');
    var mobileGreetingEl = document.getElementById('mobile-typewriter-greeting');
    if (!textElement) return;

    var cachedName = localStorage.getItem('mushclub_name');
    var fullText = '';

    if (cachedName && cachedName.trim().length > 0) {
      var nameParts = cachedName.trim().split(' ');
      var displayName = nameParts[0];
      var hour = new Date().getHours();
      var greeting = 'Good Morning';
      if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
      } else if (hour >= 17) {
        greeting = 'Good Evening';
      }
      fullText = greeting + ', ' + displayName + '! Welcome to MushClub';
    } else {
      fullText = 'Welcome to MushClub';
    }

    if (mobileGreetingEl) {
      mobileGreetingEl.textContent = fullText;
    }

    // Text alignment is always left — no dynamic centering.
    // This ensures the typewriter left edge stays fixed (like ChatGPT).

    AIStreamingText.stream({
      element: textElement,
      cursor: cursorElement,
      text: fullText,
      speed: 30
    });
  }

  // Expose for form cache updates
  window.initTypewriterGreeting = initTypewriterGreeting;

  /* ═══════════════════════════════════════════════════════
     RAPID CUSTOMER COUNT-UP ANIMATION (1 -> 100+ Customers in ~1s)
     ═══════════════════════════════════════════════════════ */
  var customerAnimFrame = null;

  function initCustomerCounter() {
    var statValEl = document.getElementById('customer-count-val');
    var statLabelEl = document.getElementById('customer-count-label');
    if (!statValEl) return;

    // Clean up any existing animation frame
    if (customerAnimFrame) {
      cancelAnimationFrame(customerAnimFrame);
      customerAnimFrame = null;
    }

    if (statLabelEl) statLabelEl.textContent = 'Customers';

    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      statValEl.textContent = '100+';
      return;
    }

    var startVal = 1;
    var targetVal = 100;
    var duration = 1000; // 1 second total animation duration
    var startTime = null;

    statValEl.textContent = '1';

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve for natural smooth deceleration
      var easeProgress = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(startVal + (targetVal - startVal) * easeProgress);

      if (progress >= 1 || current >= targetVal) {
        statValEl.textContent = '100+';
        customerAnimFrame = null;
      } else {
        statValEl.textContent = String(current);
        customerAnimFrame = requestAnimationFrame(step);
      }
    }

    customerAnimFrame = requestAnimationFrame(step);

    // Clean up animation on page unload
    window.addEventListener('beforeunload', function () {
      if (customerAnimFrame) {
        cancelAnimationFrame(customerAnimFrame);
        customerAnimFrame = null;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════════════════════ */
  function init() {
    renderProductCards();
    initScrollAnimations();
    handleNavScroll();
    initTypewriterGreeting();
    initCustomerCounter();

    var mobileEnquireBtn = document.getElementById('mobile-enquire-btn');
    if (mobileEnquireBtn) {
      mobileEnquireBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openEnquiryForm();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
