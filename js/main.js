/* ═══════════════════════════════════════════════════════
   MUSHCLUB — Main JavaScript
   Interactions, animations, form handling, product modal
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Product Data ─── */
  const PRODUCTS = [
    {
      id: 'oyster',
      name: 'Oyster Mushroom',
      category: 'Gourmet',
      badge: 'Gourmet',
      brief: 'Delicate flavor with velvety texture, perfect for stir-fries and soups.',
      description: 'The Oyster Mushroom is one of the most sought-after gourmet varieties in the world. With its distinctive fan-shaped cap and delicate, anise-like aroma, it transforms any dish into something extraordinary. Our Oyster Mushrooms are grown on enriched hardwood substrates in precisely controlled environments, producing specimens with exceptional texture and depth of flavor.',
      nutrition: [
        'Rich in protein and dietary fiber',
        'High in B vitamins (B3, B5, B6)',
        'Excellent source of antioxidants',
        'Contains lovastatin — supports heart health',
        'Low in calories, high in nutrients'
      ],
      forms: ['Fresh', 'Dried', 'Powdered'],
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'shiitake',
      name: 'Shiitake Mushroom',
      category: 'Medicinal \u00b7 Gourmet',
      badge: 'Medicinal \u00b7 Gourmet',
      brief: 'Rich umami flavor prized in Asian cuisine with immune-boosting properties.',
      description: 'Shiitake mushrooms have been revered in East Asian culture for over 2,000 years — both as a culinary delicacy and as a cornerstone of traditional medicine. Our Shiitake are cultivated on aged oak logs, developing deep umami complexity and a meaty texture that rivals any protein. They contain lentinan, a polysaccharide studied extensively for its immune-modulating properties.',
      nutrition: [
        'Contains lentinan — immune system support',
        'Rich in vitamin D (when sun-exposed)',
        'Excellent source of copper and selenium',
        'High in eritadenine — cardiovascular support',
        'Complete protein with all essential amino acids'
      ],
      forms: ['Fresh', 'Dried', 'Powdered', 'Extract'],
      image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'lions-mane',
      name: "Lion\u2019s Mane",
      category: 'Medicinal',
      badge: 'Medicinal',
      brief: 'Unique cascading spines with remarkable cognitive health benefits.',
      description: "Lion\u2019s Mane is nature\u2019s brain food. This extraordinary mushroom, with its cascading white spines resembling a waterfall of icicles, has been the subject of groundbreaking neuroscience research. Studies show it stimulates Nerve Growth Factor (NGF) production, supporting brain health, memory, and cognitive function. Our Lion\u2019s Mane is grown to maximize hericenone and erinacine content — the bioactive compounds responsible for its remarkable neuroprotective properties.",
      nutrition: [
        'Stimulates Nerve Growth Factor (NGF)',
        'Supports memory and cognitive function',
        'Rich in beta-glucans for immune support',
        'Contains hericenones and erinacines',
        'Anti-inflammatory and antioxidant properties'
      ],
      forms: ['Fresh', 'Dried', 'Powdered', 'Tincture'],
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'button',
      name: 'Button Mushroom',
      category: 'Everyday',
      badge: 'Everyday',
      brief: 'The classic versatile mushroom ideal for every kitchen and recipe.',
      description: 'The humble Button Mushroom is the world\u2019s most popular mushroom variety — and for good reason. Its mild, clean flavor adapts beautifully to any cuisine, from Italian to Indian, from breakfast omelettes to elegant sauces. Our Button Mushrooms are grown in composted straw substrates, producing firm, white specimens with a satisfying snap and clean taste.',
      nutrition: [
        'High in selenium — thyroid support',
        'Good source of vitamin B2 (riboflavin)',
        'Contains conjugated linoleic acid (CLA)',
        'Rich in potassium and phosphorus',
        'Low calorie with high water content'
      ],
      forms: ['Fresh', 'Sliced', 'Canned'],
      image: 'https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=800&q=80'
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
     NAVIGATION — Sticky glassmorphism + active section
     ═══════════════════════════════════════════════════════ */
  let lastScrollY = 0;

  function handleNavScroll() {
    if (!nav) return;
    if (isScrollLocked) return;
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* Active section tracking */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[data-section]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navLinks.forEach((link) => {
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

  sections.forEach((section) => sectionObserver.observe(section));

  /* ═══════════════════════════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════════════════════════ */
  /* ─── Scroll Locking Helpers ─── */
  let savedScrollY = 0;
  let isScrollLocked = false;

  function lockScroll() {
    if (isScrollLocked) return;
    savedScrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
    isScrollLocked = true;
  }

  function unlockScroll(overrideScrollY) {
    if (!isScrollLocked) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
    const targetY = (typeof overrideScrollY === 'number') ? overrideScrollY : savedScrollY;
    window.scrollTo(0, targetY);
    isScrollLocked = false;
  }

  /* ═══════════════════════════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════════════════════════ */
  function openMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    lockScroll();
  }

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    
    // Do not unlock scroll if the enquiry form modal is active
    if (formContainer && formContainer.classList.contains('modal-active')) {
      return;
    }
    unlockScroll();
  }

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isOpen = hamburger.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close mobile menu when clicking outside the drawer
  document.addEventListener('click', (e) => {
    if (
      mobileMenu &&
      hamburger &&
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });


  // Handle viewport resize to clear active mobile drawer or mobile enquiry modal
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
    if (window.innerWidth > 767 && formContainer && formContainer.classList.contains('modal-active')) {
      formContainer.classList.remove('modal-active');
      unlockScroll();
    }
  });

  /* ─── Open Enquiry Form Controller ─── */
  function openEnquiryForm() {
    const nameField = document.getElementById('name');
    if (window.innerWidth <= 767) {
      if (formContainer) {
        formContainer.classList.add('modal-active');
        lockScroll();
        setTimeout(() => {
          if (nameField) nameField.focus();
        }, 150);
      }
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const navHeight = nav ? nav.offsetHeight : 72;
        const targetPosition = contactSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        setTimeout(() => {
          if (nameField) nameField.focus();
        }, 600);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     SMOOTH SCROLL — with nav offset & no page jumps
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault(); // Always prevent default anchor jump or hash scroll

      const targetId = anchor.getAttribute('href');
      const wasMenuOpen = mobileMenu && mobileMenu.classList.contains('open');

      if (!targetId || targetId === '#') {
        if (wasMenuOpen) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open menu');
          unlockScroll(0);
        } else {
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
        return;
      }

      if (targetId === '#contact') {
        if (wasMenuOpen) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open menu');
          unlockScroll(savedScrollY); // Unlock before opening new modal
        }
        openEnquiryForm();
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) return;
      const navHeight = nav ? nav.offsetHeight : 72;
      const currentScroll = isScrollLocked ? savedScrollY : window.scrollY;
      const targetPosition = target.getBoundingClientRect().top + currentScroll - navHeight;

      if (wasMenuOpen) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
        unlockScroll(targetPosition);
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
    const allAnimatable = document.querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-hero');
    if (prefersReducedMotion) {
      allAnimatable.forEach((el) => {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Instantly reveal top-fold hero elements so page never loads blank
    document.querySelectorAll('.hero *, .nav *').forEach((el) => {
      if (el.classList.contains('animate-on-scroll') || el.classList.contains('animate-hero')) {
        el.classList.add('visible');
      }
    });

    const animateObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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

    document.querySelectorAll('.animate-on-scroll, .animate-slide-left').forEach((el) => {
      animateObserver.observe(el);
    });

    setTimeout(() => {
      document.querySelectorAll('.animate-hero').forEach((el) => {
        el.classList.add('visible');
      });
    }, 50);
  }

  /* ═══════════════════════════════════════════════════════
     PRODUCT CARDS — Render from data
     ═══════════════════════════════════════════════════════ */
  function renderProductCards() {
    const fragment = document.createDocumentFragment();

    PRODUCTS.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = `product-card animate-on-scroll stagger-${Math.min(index + 1, 8)} visible`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View details for ${product.name}`);
      card.dataset.productId = product.id;

      card.innerHTML = `
        <div class="product-card__image-container">
          <img
            class="product-card__image"
            src="${product.image}"
            alt="${product.name} — ${product.brief}"
            loading="lazy"
            width="300"
            height="225"
          >
        </div>
        <div class="product-card__content">
          <span class="product-card__badge">${product.badge}</span>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.brief}</p>
          <span class="product-card__link">View Details <span aria-hidden="true">\u2192</span></span>
        </div>
      `;

      card.addEventListener('click', () => openProductModal(product));
      card.addEventListener('keydown', (e) => {
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
     PRODUCT MODAL
     ═══════════════════════════════════════════════════════ */
  let lastFocusedElement = null;
  let currentProduct = null;

  function openProductModal(product) {
    if (!modalOverlay) return;
    currentProduct = product;
    lastFocusedElement = document.activeElement;

    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
      modalImage.src = product.image;
      modalImage.alt = `${product.name} — detailed view`;
    }
    const modalCategory = document.getElementById('modal-category');
    if (modalCategory) modalCategory.textContent = product.category;
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = product.name;
    const modalDescription = document.getElementById('modal-description');
    if (modalDescription) modalDescription.textContent = product.description;

    // Nutrition list
    const nutritionList = document.getElementById('modal-nutrition');
    if (nutritionList) {
      nutritionList.innerHTML = product.nutrition
        .map((item) => `<li>${item}</li>`)
        .join('');
    }

    // Available forms
    const formsContainer = document.getElementById('modal-forms');
    if (formsContainer) {
      formsContainer.innerHTML = product.forms
        .map((form) => `<span class="modal__form-badge">${form}</span>`)
        .join('');
    }

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    lockScroll();

    // Focus the close button
    if (modalClose) {
      setTimeout(() => modalClose.focus(), 100);
    }
  }

  function closeProductModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    unlockScroll();

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
    currentProduct = null;
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeProductModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeProductModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalOverlay && modalOverlay.classList.contains('active')) {
        closeProductModal();
      }
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
      if (formContainer && formContainer.classList.contains('modal-active')) {
        formContainer.classList.remove('modal-active');
        unlockScroll();
      }
    }
  });

  // Focus trap
  if (modalOverlay) {
    modalOverlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalOverlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

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

  const modalEnquire = document.getElementById('modal-enquire');
  if (modalEnquire) {
    modalEnquire.addEventListener('click', () => {
      closeProductModal();
      const productSelect = document.getElementById('product');
      if (currentProduct && productSelect) {
        productSelect.value = currentProduct.id;
      }
      setTimeout(() => {
        openEnquiryForm();
      }, 100);
    });
  }

  // Close mobile form container modal
  if (formClose && formContainer) {
    formClose.addEventListener('click', () => {
      formContainer.classList.remove('modal-active');
      unlockScroll();
    });

    formContainer.addEventListener('click', (e) => {
      if (e.target === formContainer) {
        formContainer.classList.remove('modal-active');
        unlockScroll();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     ENQUIRY FORM — Validation + Submission
     ═══════════════════════════════════════════════════════ */
  const validationRules = {
    name: {
      required: true,
      validate: (v) => v.trim().length >= 2,
      message: 'Please enter your full name (at least 2 characters).'
    },
    mobile: {
      required: true,
      validate: (v) => /^[\d\s\+\-()]{7,}$/.test(v.trim()),
      message: 'Please enter a valid mobile number.'
    },
    email: {
      required: false,
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Please enter a valid email address.'
    },
    product: {
      required: true,
      validate: (v) => v.trim() !== '',
      message: 'Please select a product of interest.'
    }
  };

  function validateField(field) {
    const rule = validationRules[field.name];
    if (!rule) return true;

    const value = field.value;
    const errorEl = document.getElementById(`${field.name}-error`);

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
    enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });
  }

  // Form submission handler
  let isSubmitting = false;

  function handleFormSubmit(e) {
    if (e) e.preventDefault();

    if (isSubmitting) return; // Double-click protection

    if (!enquiryForm) return;

    // Validate all required fields
    let isValid = true;
    enquiryForm.querySelectorAll('.form__input[required], .form__select[required], .form__textarea[required]').forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      // Focus the first error field
      const firstError = enquiryForm.querySelector('.form__input.error, .form__select.error, .form__textarea.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate submission
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }

      // Save user details to localStorage
      saveFormDataToCache();

      // Show success state
      if (formContent) formContent.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('active');
    }, 1200);
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', handleFormSubmit);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleFormSubmit(e);
    });
  }

  // Submit another
  if (submitAnother) {
    submitAnother.addEventListener('click', (e) => {
      e.preventDefault();
      if (formContent) formContent.style.display = 'block';
      if (formSuccess) formSuccess.classList.remove('active');
      if (enquiryForm) {
        enquiryForm.reset();
        enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach((field) => {
          field.classList.remove('error', 'valid');
        });
        enquiryForm.querySelectorAll('.form__error').forEach((el) => {
          el.textContent = '';
        });
        // Reload cached data so user doesn't have to re-enter details
        loadCachedFormData();
      }
    });
  }

  /* ─── Cache Management ─── */
  function loadCachedFormData() {
    const nameField = document.getElementById('name');
    const mobileField = document.getElementById('mobile');
    const emailField = document.getElementById('email');

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
    const nameField = document.getElementById('name');
    const mobileField = document.getElementById('mobile');
    const emailField = document.getElementById('email');

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
    handleNavScroll(); // Check initial scroll position
    loadCachedFormData(); // Load any saved user details
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
