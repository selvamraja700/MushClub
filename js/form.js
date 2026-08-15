/* ═══════════════════════════════════════════════════════
   MUSHCLUB — Form Integration & Validation Module
   Dedicated handler for Enquiry Form, Web3Forms API,
   Submit-Time Validation, 150-Word Limit, and State Machine
   ═══════════════════════════════════════════════════════ */

(function (window, document) {
  'use strict';

  /* ─── Web3Forms Configuration ─── */
  var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
  var ACCESS_KEY = '2e02b703-098c-4120-8903-4dd0abdc7564';
  var DEFAULT_SUBJECT = 'New Client Enquiry - MushClub Website';
  var FROM_NAME = 'MushClub Website Enquiry';

  /* ─── State Machine Constants ─── */
  var FORM_STATES = {
    IDLE: 'idle',
    PROCESSING: 'processing',
    SUCCESS: 'success',
    CANCELLED: 'cancelled'
  };

  var currentState = FORM_STATES.IDLE;
  var submitAttempted = false;
  var isSubmitting = false;
  var processingTimer = null;

  /* ─── DOM Element References ─── */
  var enquiryForm = null;
  var formContent = null;
  var formProcessing = null;
  var formSuccess = null;
  var formCancel = null;
  var formClose = null;
  var submitBtn = null;
  var submitAnother = null;
  var cancelReturn = null;
  var generalError = null;

  /* ═══════════════════════════════════════════════════════
     WORD COUNT ENGINE (Single Source of Truth)
     ═══════════════════════════════════════════════════════ */

  /**
   * Meaningful word count helper
   * Ignores leading/trailing spaces, multiple spaces, tabs, line breaks.
   * Whitespace-only strings return 0.
   */
  function countWords(str) {
    if (!str) return 0;
    var trimmed = str.trim();
    if (trimmed === '') return 0;
    var words = trimmed.split(/\s+/);
    return words.length;
  }

  /**
   * Truncates string to at most maxWords actual words, preserving existing whitespace structure.
   */
  function truncateToWords(str, maxWords) {
    if (!str) return '';
    var trimmed = str.trim();
    if (trimmed === '') return '';

    var wordCount = 0;
    var inWord = false;
    var cutoffIndex = str.length;

    for (var i = 0; i < str.length; i++) {
      var isSpace = /\s/.test(str[i]);
      if (!isSpace) {
        if (!inWord) {
          inWord = true;
          wordCount++;
          if (wordCount > maxWords) {
            cutoffIndex = i;
            while (cutoffIndex > 0 && /\s/.test(str[cutoffIndex - 1])) {
              cutoffIndex--;
            }
            return str.substring(0, cutoffIndex);
          }
        }
      } else {
        inWord = false;
      }
    }
    return str;
  }

  /**
   * Progressive visual feedback update for the message textarea
   */
  function updateMessageFeedback() {
    var messageField = document.getElementById('message');
    var wordCountEl = document.getElementById('message-word-count');
    var errorEl = document.getElementById('message-error');
    if (!messageField) return;

    var count = countWords(messageField.value);

    // 1. Single source of truth for counter text
    if (wordCountEl) {
      wordCountEl.textContent = count + ' / 150 words';
      wordCountEl.classList.remove('near-limit', 'at-limit', 'exceeded');
    }

    // 2. Remove previous warning/error classes on textarea
    messageField.classList.remove('near-limit', 'at-limit', 'error');

    // 3. Progressive visual states
    if (count <= 120) {
      // 0–120 words: Normal state
      if (errorEl && errorEl.textContent === 'Message cannot exceed 150 words.') {
        errorEl.textContent = '';
      }
    } else if (count >= 121 && count <= 149) {
      // 121–149 words: Near-limit state (Light red warning border, valid)
      messageField.classList.add('near-limit');
      if (wordCountEl) wordCountEl.classList.add('near-limit');
      if (errorEl && errorEl.textContent === 'Message cannot exceed 150 words.') {
        errorEl.textContent = '';
      }
    } else if (count === 150) {
      // Exactly 150 words: Maximum-limit state (Dark red limit border, still valid)
      messageField.classList.add('at-limit');
      if (wordCountEl) wordCountEl.classList.add('at-limit');
      if (errorEl && errorEl.textContent === 'Message cannot exceed 150 words.') {
        errorEl.textContent = '';
      }
    } else {
      // 151+ words: Defensive safety fallback state (Dark red error state, invalid)
      messageField.classList.add('error');
      if (wordCountEl) wordCountEl.classList.add('exceeded');
      if (submitAttempted) {
        if (errorEl) errorEl.textContent = 'Message cannot exceed 150 words.';
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     VALIDATION ENGINE
     ═══════════════════════════════════════════════════════ */

  var validationRules = {
    name: {
      required: true,
      validate: function (v) { return /^[A-Za-z\s]{2,20}$/.test(v.trim()); },
      emptyMessage: 'Full name is required.',
      invalidMessage: 'Letters only, 2-20 chars.'
    },
    mobile: {
      required: true,
      validate: function (v) { return /^[0-9]{10}$/.test(v.trim()); },
      emptyMessage: 'Mobile number is required.',
      invalidMessage: 'Enter a valid 10-digit number.'
    },
    email: {
      required: false,
      validate: function (v) {
        if (!v.trim()) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      },
      emptyMessage: '',
      invalidMessage: 'Enter a valid email address.'
    },
    product: {
      required: true,
      validate: function (v) { return v.trim() !== ''; },
      emptyMessage: 'Please select a product of interest.',
      invalidMessage: 'Please select a product of interest.'
    },
    quantity: {
      required: true,
      validate: function (v) { return v.trim() !== '' && v.trim().length <= 15; },
      emptyMessage: 'Estimated quantity is required.',
      invalidMessage: 'Quantity cannot exceed 15 characters.'
    },
    message: {
      required: false,
      validate: function (v) {
        return countWords(v) <= 150;
      },
      emptyMessage: '',
      invalidMessage: 'Message cannot exceed 150 words.'
    }
  };

  /**
   * Validate an individual field.
   * If updateUI is true, applies/removes .error and error messages in DOM.
   * If updateUI is false, performs non-destructive validation without UI side effects.
   */
  function validateField(field, updateUI) {
    if (!field || !field.name) return true;
    if (updateUI === undefined) {
      updateUI = submitAttempted;
    }

    var rule = validationRules[field.name];
    if (!rule) return true;

    // Special progressive feedback for message textarea
    if (field.name === 'message') {
      var count = countWords(field.value);
      var isMsgValid = count <= 150;
      updateMessageFeedback();
      return isMsgValid;
    }

    var value = field.value || '';
    var trimmed = value.trim();
    var errorEl = document.getElementById(field.name + '-error');
    var isValid = true;
    var errorMsg = '';

    if (rule.required && !trimmed) {
      isValid = false;
      errorMsg = rule.emptyMessage || 'This field is required.';
    } else if (!rule.validate(value)) {
      isValid = false;
      errorMsg = rule.invalidMessage || 'Invalid input.';
    }

    if (updateUI) {
      if (!isValid) {
        field.classList.add('error');
        field.classList.remove('valid');
        if (errorEl) errorEl.textContent = errorMsg;
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      }
    }

    return isValid;
  }

  /* ═══════════════════════════════════════════════════════
     STATE MACHINE RENDERING
     ═══════════════════════════════════════════════════════ */

  function renderState(state) {
    currentState = state;

    if (formContent) formContent.style.display = 'none';
    if (formProcessing) formProcessing.style.display = 'none';
    if (formSuccess) formSuccess.classList.remove('active');
    if (formCancel) formCancel.style.display = 'none';

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

  /* ═══════════════════════════════════════════════════════
     CACHE MANAGEMENT (localStorage)
     ═══════════════════════════════════════════════════════ */

  function loadCachedFormData() {
    var nameField = document.getElementById('name');
    var mobileField = document.getElementById('mobile');
    var emailField = document.getElementById('email');

    if (nameField && localStorage.getItem('mushclub_name')) {
      nameField.value = localStorage.getItem('mushclub_name');
    }
    if (mobileField && localStorage.getItem('mushclub_mobile')) {
      mobileField.value = localStorage.getItem('mushclub_mobile');
    }
    if (emailField && localStorage.getItem('mushclub_email')) {
      emailField.value = localStorage.getItem('mushclub_email');
    }
  }

  function saveFormDataToCache() {
    var nameField = document.getElementById('name');
    var mobileField = document.getElementById('mobile');
    var emailField = document.getElementById('email');

    if (nameField && nameField.value.trim()) {
      localStorage.setItem('mushclub_name', nameField.value.trim());
      if (typeof window.initTypewriterGreeting === 'function') {
        window.initTypewriterGreeting();
      }
    }
    if (mobileField && mobileField.value.trim()) {
      localStorage.setItem('mushclub_mobile', mobileField.value.trim());
    }
    if (emailField && emailField.value.trim()) {
      localStorage.setItem('mushclub_email', emailField.value.trim());
    }
  }

  /* ═══════════════════════════════════════════════════════
     FORM RESET HANDLER
     ═══════════════════════════════════════════════════════ */

  function resetFormState(e) {
    if (e && e.preventDefault) e.preventDefault();
    submitAttempted = false;
    isSubmitting = false;

    if (generalError) {
      generalError.style.display = 'none';
      generalError.textContent = '';
    }

    if (formSuccess) formSuccess.classList.remove('active');
    if (formCancel) formCancel.style.display = 'none';

    if (enquiryForm) {
      enquiryForm.reset();
      enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (field) {
        field.classList.remove('error', 'valid', 'near-limit', 'at-limit');
        field.disabled = false;
      });
      enquiryForm.querySelectorAll('.form__error').forEach(function (el) {
        el.textContent = '';
      });
      updateMessageFeedback();
      loadCachedFormData();
    }

    if (processingTimer) {
      clearTimeout(processingTimer);
      processingTimer = null;
    }

    renderState(FORM_STATES.IDLE);
  }

  /* ═══════════════════════════════════════════════════════
     WEB3FORMS SUBMISSION HANDLER
     ═══════════════════════════════════════════════════════ */

  function handleFormSubmit(e) {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
    if (!enquiryForm) return;

    // 1. Enter validation state upon submit attempt
    submitAttempted = true;

    var formFields = enquiryForm.querySelectorAll('.form__input, .form__select, .form__textarea');
    var isValid = true;
    var firstInvalidField = null;

    formFields.forEach(function (field) {
      var fieldValid = validateField(field, true);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (!isValid) {
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    // 2. Clear any previous error banner
    if (generalError) {
      generalError.style.display = 'none';
      generalError.textContent = '';
    }

    // 3. Extract and format all field values BEFORE disabling DOM elements
    var nameVal = document.getElementById('name') ? document.getElementById('name').value.trim() : '';
    var phoneVal = document.getElementById('mobile') ? document.getElementById('mobile').value.trim() : '';
    var emailVal = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
    var productSelect = document.getElementById('product');
    var productVal = '';
    if (productSelect && productSelect.selectedIndex >= 0) {
      var opt = productSelect.options[productSelect.selectedIndex];
      productVal = (opt && opt.value) ? opt.text : '';
    }
    var quantityVal = document.getElementById('quantity') ? document.getElementById('quantity').value.trim() : '';
    var messageVal = document.getElementById('message') ? document.getElementById('message').value.trim() : '';
    // Honeypot check: If a bot checked the hidden honeypot, silently return success without making API call
    var botcheckEl = enquiryForm.querySelector('input[name="botcheck"]');
    if (botcheckEl && botcheckEl.checked) {
      renderState(FORM_STATES.SUCCESS);
      enquiryForm.reset();
      return;
    }

    // 4. Construct structured Web3Forms payload for email notification table
    var payload = {
      access_key: ACCESS_KEY,
      subject: DEFAULT_SUBJECT,
      from_name: FROM_NAME,
      'Name': nameVal,
      'Email': emailVal || 'Not provided',
      'Phone': phoneVal,
      'Service': productVal || 'General Enquiry',
      'Estimated Quantity': quantityVal || 'Not specified',
      'Message': messageVal || 'No additional message provided.'
    };

    if (emailVal) {
      payload.replyto = emailVal;
    }

    // 5. Transition to processing state
    isSubmitting = true;
    renderState(FORM_STATES.PROCESSING);
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }

    // Disable form fields during processing to prevent double submit
    enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (fld) {
      fld.disabled = true;
    });

    // 6. Send request to Web3Forms API
    fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        // Re-enable form fields
        enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (fld) {
          fld.disabled = false;
        });

        if (data.success) {
          saveFormDataToCache();
          renderState(FORM_STATES.SUCCESS);

          // Reset the form fields after successful submission
          enquiryForm.reset();
          enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (field) {
            field.classList.remove('error', 'valid', 'near-limit', 'at-limit');
          });
          enquiryForm.querySelectorAll('.form__error').forEach(function (el) {
            el.textContent = '';
          });
          updateMessageFeedback();
        } else {
          // Submission rejected or limit reached — preserve entered user data
          renderState(FORM_STATES.IDLE);

          if (generalError) {
            generalError.textContent = data.message || 'Submission failed. Please check your details and try again.';
            generalError.style.display = 'block';
            generalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            alert(data.message || 'Submission failed. Please check your details and try again.');
          }
        }
      })
      .catch(function () {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        // Re-enable form fields
        enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (fld) {
          fld.disabled = false;
        });

        // Network or fetch failure — keep entered data intact
        renderState(FORM_STATES.IDLE);

        if (generalError) {
          generalError.textContent = 'Submission failed due to a network connection issue. Please check your connection and try again.';
          generalError.style.display = 'block';
          generalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          alert('Submission failed due to a network connection issue. Please check your connection and try again.');
        }
      });
  }

  /* ═══════════════════════════════════════════════════════
     EVENT LISTENERS INITIALIZATION
     ═══════════════════════════════════════════════════════ */

  function initFormEventListeners() {
    enquiryForm = document.getElementById('enquiry-form');
    formContent = document.getElementById('form-content');
    formProcessing = document.getElementById('form-processing');
    formSuccess = document.getElementById('form-success');
    formCancel = document.getElementById('form-cancel');
    formClose = document.getElementById('form-close');
    submitBtn = document.getElementById('submit-btn');
    submitAnother = document.getElementById('submit-another');
    cancelReturn = document.getElementById('cancel-return');
    generalError = document.getElementById('form-general-error');

    if (!enquiryForm) return;

    // Submit event listener
    enquiryForm.addEventListener('submit', handleFormSubmit);

    // Reactive validation and live typing enforcement
    enquiryForm.querySelectorAll('.form__input, .form__textarea, .form__select').forEach(function (field) {
      if (field.name === 'message') {
        // Handle paste to prevent exceeding 150 words
        field.addEventListener('paste', function (e) {
          var clipboardData = e.clipboardData || window.clipboardData;
          if (!clipboardData) return;
          var pastedText = clipboardData.getData('text');
          if (!pastedText) return;

          var currentVal = field.value;
          var start = field.selectionStart !== null ? field.selectionStart : currentVal.length;
          var end = field.selectionEnd !== null ? field.selectionEnd : currentVal.length;

          var before = currentVal.substring(0, start);
          var after = currentVal.substring(end);
          var combined = before + pastedText + after;

          if (countWords(combined) > 150) {
            e.preventDefault();
            var truncated = truncateToWords(combined, 150);
            field.value = truncated;
            var newCursor = Math.min(truncated.length, start + pastedText.length);
            try {
              field.setSelectionRange(newCursor, newCursor);
            } catch (err) { }
            updateMessageFeedback();
          }
        });

        // Handle keydown to prevent typing 151st word while allowing navigation/editing
        field.addEventListener('keydown', function (e) {
          if (
            e.key === 'Backspace' ||
            e.key === 'Delete' ||
            e.key === 'Tab' ||
            e.key === 'Escape' ||
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'ArrowUp' ||
            e.key === 'ArrowDown' ||
            e.key === 'Home' ||
            e.key === 'End' ||
            e.key === 'PageUp' ||
            e.key === 'PageDown' ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey
          ) {
            return;
          }

          if (field.selectionStart !== field.selectionEnd) {
            return;
          }

          var count = countWords(field.value);
          if (count >= 150) {
            var val = field.value;
            var pos = field.selectionStart !== null ? field.selectionStart : val.length;

            if (e.key === ' ' || e.key === 'Enter') {
              var prevChar = pos > 0 ? val[pos - 1] : '';
              if (!/\s/.test(prevChar)) {
                e.preventDefault();
                updateMessageFeedback();
                return;
              }
            }

            var charBefore = pos > 0 ? val[pos - 1] : ' ';
            var charAfter = pos < val.length ? val[pos] : ' ';
            if (/\s/.test(charBefore) && /\s/.test(charAfter) && e.key.length === 1) {
              e.preventDefault();
              updateMessageFeedback();
              return;
            }
          }
        });

        // Live input truncation fallback and feedback
        field.addEventListener('input', function () {
          var count = countWords(field.value);
          if (count > 150) {
            var prevScroll = field.scrollTop;
            var prevSelStart = field.selectionStart;
            field.value = truncateToWords(field.value, 150);
            var newSel = Math.min(field.value.length, prevSelStart);
            try {
              field.setSelectionRange(newSel, newSel);
            } catch (err) { }
            field.scrollTop = prevScroll;
          }
          updateMessageFeedback();
        });
      }

      // Live correction handling after submit attempted
      field.addEventListener('input', function () {
        if (field.name !== 'message' && submitAttempted) {
          validateField(field, true);
        }
      });

      field.addEventListener('blur', function () {
        if (submitAttempted) {
          validateField(field, true);
        }
      });

      if (field.tagName === 'SELECT') {
        field.addEventListener('change', function () {
          if (submitAttempted) {
            validateField(field, true);
          }
        });
      }
    });

    if (submitAnother) {
      submitAnother.addEventListener('click', resetFormState);
    }

    if (cancelReturn) {
      cancelReturn.addEventListener('click', resetFormState);
    }

    loadCachedFormData();
    updateMessageFeedback();
  }

  /* ═══════════════════════════════════════════════════════
     PUBLIC MODULE EXPORTS
     ═══════════════════════════════════════════════════════ */

  window.MushClubForm = {
    init: initFormEventListeners,
    validateField: validateField,
    reset: resetFormState,
    countWords: countWords,
    updateMessageFeedback: updateMessageFeedback,
    loadCachedFormData: loadCachedFormData,
    saveFormDataToCache: saveFormDataToCache,
    getState: function () { return currentState; },
    setState: renderState
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormEventListeners);
  } else {
    initFormEventListeners();
  }
})(window, document);
