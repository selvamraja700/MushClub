/* ═══════════════════════════════════════════════════════
   MUSHCLUB — Main JavaScript
   Interactions, animations, form handling, product modal
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Product Data ─── */
  const PRODUCTS = [
    {
      id: 'button',
      name: 'Fresh Button Mushroom',
      category: 'Everyday',
      badge: 'Everyday',
      brief: 'The classic versatile mushroom ideal for every kitchen and recipe.',
      description: 'Our fresh Button Mushrooms are grown in enriched compost substrates, producing firm, white specimens with a clean taste and satisfying snap.',
      nutrition: [
        'High in selenium',
        'Good source of vitamin B2',
        'Low calorie with high water content',
        'Rich in potassium and phosphorus',
        'Contains conjugated linoleic acid (CLA)'
      ],
      forms: ['Fresh', 'Sliced', 'Bulk'],
      image: 'https://ik.imagekit.io/Selvamraj700/MushClub/Mushroom.png'
    },
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

    // ─── Private: Lock page scroll ───
    function lockScroll() {
      if (scrollLocked) return;
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
    function unlockScroll(overrideScrollY) {
      if (!scrollLocked) return;

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');

      var targetY = (typeof overrideScrollY === 'number') ? overrideScrollY : savedScrollY;

      var htmlEl = document.documentElement;
      var prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = 'auto';
      window.scrollTo(0, targetY);
      htmlEl.style.scrollBehavior = prevBehavior;

      scrollLocked = false;
    }

    // ─── Private: Apply DOM classes + ARIA for an overlay ───
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
        }
      } else if (name === 'product-modal') {
        if (modalOverlay) {
          modalOverlay.classList.add('active');
          modalOverlay.setAttribute('aria-hidden', 'false');
        }
      } else if (name === 'enquiry-form') {
        if (formContainer) {
          formContainer.classList.add('modal-active');
          // Force visibility — the form-container has animate-on-scroll which
          // starts at opacity:0. On mobile, IntersectionObserver never fires
          // for it because it's display:none, so .visible is never added.
          formContainer.classList.add('visible');
          formContainer.style.opacity = '1';
          formContainer.style.transform = 'none';
        }
      }
    }

    // ─── Private: Remove DOM classes + ARIA for an overlay ───
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
        }
      } else if (name === 'product-modal') {
        if (modalOverlay) {
          modalOverlay.classList.remove('active');
          modalOverlay.setAttribute('aria-hidden', 'true');
        }
      } else if (name === 'enquiry-form') {
        if (formContainer) {
          formContainer.classList.remove('modal-active');
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

        // Focus management per overlay type
        if (name === 'product-modal' && modalClose) {
          setTimeout(function () { modalClose.focus(); }, 100);
        } else if (name === 'enquiry-form') {
          var nameField = document.getElementById('name');
          setTimeout(function () { if (nameField) nameField.focus(); }, 150);
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
      close: function (overrideScrollY) {
        if (!activeOverlay) return;

        removeOverlayDOM(activeOverlay);
        activeOverlay = null;
        unlockScroll(overrideScrollY);

        if (savedFocusElement) {
          savedFocusElement.focus();
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
  var navLinks = document.querySelectorAll('.nav__link[data-section]');

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
      }
    });
  }

  // Close mobile menu when clicking outside the drawer
  document.addEventListener('click', function (e) {
    if (
      overlayManager.getActive() === 'mobile-menu' &&
      mobileMenu && hamburger &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      overlayManager.close();
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
        validateField(productSelect);
      }
    }

    var isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    var formHidden = formContainer && getComputedStyle(formContainer).display === 'none';

    if ((isMobile || formHidden) && formContainer) {
      // Mobile/hidden: open as modal overlay
      // overlayManager.open() handles closing any current overlay seamlessly
      overlayManager.open('enquiry-form');
      return;
    }

    // Desktop: close any overlay and smooth scroll to contact section
    if (overlayManager.isActive()) {
      overlayManager.close();
    }

    var contactSection = document.getElementById('contact');
    if (contactSection) {
      var navHeight = nav ? nav.offsetHeight : 72;
      var targetPosition = contactSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      var nameField = document.getElementById('name');
      setTimeout(function () { if (nameField) nameField.focus(); }, 600);
    }
  }

  /* ═══════════════════════════════════════════════════════
     SMOOTH SCROLL — with nav offset & clean overlay close
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      var targetId = anchor.getAttribute('href');
      var hadOverlay = overlayManager.isActive();

      if (!targetId || targetId === '#') {
        if (hadOverlay) {
          overlayManager.close();
        } else {
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
        return;
      }

      // Contact link → open enquiry form (handles overlay transitions internally)
      if (targetId === '#contact') {
        openEnquiryForm();
        return;
      }

      var target = document.querySelector(targetId);
      if (!target) return;
      var navHeight = nav ? nav.offsetHeight : 72;
      var currentScroll = overlayManager.isLocked() ? overlayManager.getSavedScrollY() : window.scrollY;
      var targetPosition = target.getBoundingClientRect().top + currentScroll - navHeight;

      if (hadOverlay) {
        // Close overlay and scroll to target position in one step
        overlayManager.close(targetPosition);
      } else {
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
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
      modalImage.alt = product.name + ' \u2014 detailed view';
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

  // Product modal backdrop click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        overlayManager.close();
        currentProduct = null;
      }
    });
  }

  // Global Escape key — closes whatever overlay is active
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlayManager.isActive()) {
      if (overlayManager.getActive() === 'product-modal') {
        currentProduct = null;
      }
      overlayManager.close();
    }
  });

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
    formClose.addEventListener('click', function () {
      overlayManager.close();
    });
  }

  // Close mobile enquiry form modal — backdrop click
  if (formContainer) {
    formContainer.addEventListener('click', function (e) {
      if (e.target === formContainer) {
        overlayManager.close();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     ENQUIRY FORM — Validation + Submission
     ═══════════════════════════════════════════════════════ */
  var validationRules = {
    name: {
      required: true,
      validate: function (v) { return v.trim().length >= 2; },
      message: 'Please enter your full name (at least 2 characters).'
    },
    mobile: {
      required: true,
      validate: function (v) { return /^[\d\s\+\-()]{7,}$/.test(v.trim()); },
      message: 'Please enter a valid mobile number.'
    },
    email: {
      required: false,
      validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      message: 'Please enter a valid email address.'
    },
    product: {
      required: true,
      validate: function (v) { return v.trim() !== ''; },
      message: 'Please select a product of interest.'
    }
  };

  function validateField(field) {
    var rule = validationRules[field.name];
    if (!rule) return true;

    var value = field.value;
    var errorEl = document.getElementById(field.name + '-error');

    if (rule.required && !value.trim()) {
      field.classList.add('error');
      field.classList.remove('valid');
      if (errorEl) errorEl.textContent = 'This field is required.';
      return false;
    }

    if (value.trim() && !rule.validate(value)) {
      field.classList.add('error');
      field.classList.remove('valid');
      if (errorEl) errorEl.textContent = rule.message;
      return false;
    }

    field.classList.remove('error');
    if (value.trim()) field.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  // Live validation on blur
  if (enquiryForm) {
    enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
      // <select> elements fire 'change', not 'input', in most browsers
      if (field.tagName === 'SELECT') {
        field.addEventListener('change', function () { validateField(field); });
      }
    });
  }

  // Form submission handler
  var isSubmitting = false;

  function handleFormSubmit(e) {
    if (e) e.preventDefault();

    if (isSubmitting) return; // Double-click protection

    if (!enquiryForm) return;

    // Validate all required fields
    var isValid = true;
    enquiryForm.querySelectorAll('.form__input[required], .form__select[required], .form__textarea[required]').forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      var firstError = enquiryForm.querySelector('.form__input.error, .form__select.error, .form__textarea.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate submission
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    setTimeout(function () {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      saveFormDataToCache();

      if (formContent) formContent.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('active');
    }, 1200);
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', handleFormSubmit);
  }

  // Submit another
  if (submitAnother) {
    submitAnother.addEventListener('click', function (e) {
      e.preventDefault();
      if (formContent) formContent.style.display = 'block';
      if (formSuccess) formSuccess.classList.remove('active');
      if (enquiryForm) {
        enquiryForm.reset();
        enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (field) {
          field.classList.remove('error', 'valid');
        });
        enquiryForm.querySelectorAll('.form__error').forEach(function (el) {
          el.textContent = '';
        });
        loadCachedFormData();
      }
    });
  }

  /* ─── Cache Management ─── */
  function loadCachedFormData() {
    var nameField = document.getElementById('name');
    var mobileField = document.getElementById('mobile');
    var emailField = document.getElementById('email');

    if (nameField && localStorage.getItem('mushclub_name')) {
      nameField.value = localStorage.getItem('mushclub_name');
      validateField(nameField);
    }
    if (mobileField && localStorage.getItem('mushclub_mobile')) {
      mobileField.value = localStorage.getItem('mushclub_mobile');
      validateField(mobileField);
    }
    if (emailField && localStorage.getItem('mushclub_email')) {
      emailField.value = localStorage.getItem('mushclub_email');
      validateField(emailField);
    }
  }

  function saveFormDataToCache() {
    var nameField = document.getElementById('name');
    var mobileField = document.getElementById('mobile');
    var emailField = document.getElementById('email');

    if (nameField) localStorage.setItem('mushclub_name', nameField.value.trim());
    if (mobileField) localStorage.setItem('mushclub_mobile', mobileField.value.trim());
    if (emailField) localStorage.setItem('mushclub_email', emailField.value.trim());
  }

  /* ═══════════════════════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════════════════════ */
  function init() {
    renderProductCards();
    initScrollAnimations();
    handleNavScroll();
    loadCachedFormData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
