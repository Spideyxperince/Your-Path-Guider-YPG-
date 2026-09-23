/**
 * Your Path Guider — Authentication Script
 * Handles: form switching, validation, password UX, strength meter
 * No backend calls — forms are structured for Django connection later.
 */

(function () {
  'use strict';

  /* ── Element references ───────────────────────────────────── */
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const goToRegister = document.getElementById('goToRegister');
  const goToLogin    = document.getElementById('goToLogin');

  const loginFormEl    = document.getElementById('loginFormElement');
  const registerFormEl = document.getElementById('registerFormElement');

  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  /* ── Show a form card ─────────────────────────────────────── */
  function showForm(formEl, otherEl) {
    // Hide current
    otherEl.classList.remove('is-active');
    otherEl.setAttribute('aria-hidden', 'true');

    // Small delay so CSS transition runs after display:block kicks in
    requestAnimationFrame(function () {
      formEl.classList.add('is-active');
      formEl.removeAttribute('aria-hidden');
      // Focus the first input in the shown form
      var firstInput = formEl.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }

  /* Toggle: Login → Register */
  goToRegister.addEventListener('click', function () {
    clearForm(loginFormEl);
    showForm(registerForm, loginForm);
  });

  /* Toggle: Register → Login */
  goToLogin.addEventListener('click', function () {
    clearForm(registerFormEl);
    showForm(loginForm, registerForm);
  });

  /* Show login form on page load */
  loginForm.classList.add('is-active');
  loginForm.removeAttribute('aria-hidden');

  /* ── Password show/hide ───────────────────────────────────── */
  document.querySelectorAll('.toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');
      var input    = document.getElementById(targetId);
      var iconEye    = btn.querySelector('.icon-eye');
      var iconEyeOff = btn.querySelector('.icon-eye-off');

      if (input.type === 'password') {
        input.type = 'text';
        btn.setAttribute('aria-label', 'Hide password');
        iconEye.style.display    = 'none';
        iconEyeOff.style.display = '';
      } else {
        input.type = 'password';
        btn.setAttribute('aria-label', 'Show password');
        iconEye.style.display    = '';
        iconEyeOff.style.display = 'none';
      }
    });
  });

  /* ── Validation helpers ───────────────────────────────────── */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, errorId, message) {
    input.classList.add('has-error');
    var errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input, errorId) {
    input.classList.remove('has-error');
    var errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = '';
  }

  function validateRequired(input, errorId, label) {
    if (!input.value.trim()) {
      setError(input, errorId, label + ' is required.');
      return false;
    }
    clearError(input, errorId);
    return true;
  }

  function validateEmail(input, errorId) {
    if (!input.value.trim()) {
      setError(input, errorId, 'Email address is required.');
      return false;
    }
    if (!EMAIL_RE.test(input.value.trim())) {
      setError(input, errorId, 'Enter a valid email address.');
      return false;
    }
    clearError(input, errorId);
    return true;
  }

  /* ── Clear form state ─────────────────────────────────────── */
  function clearForm(formEl) {
    formEl.reset();
    formEl.querySelectorAll('.form-input').forEach(function (el) {
      el.classList.remove('has-error');
    });
    formEl.querySelectorAll('.form-error').forEach(function (el) {
      el.textContent = '';
    });
    formEl.querySelectorAll('.form-success').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('is-visible');
    });
    // Reset password strength
    resetStrengthUI();
  }

  /* ── Button loading state ─────────────────────────────────── */
  function setLoading(btn, loading) {
    btn.disabled = loading;
    if (loading) {
      btn.classList.add('is-loading');
    } else {
      btn.classList.remove('is-loading');
    }
  }

  /* ── Show success message ─────────────────────────────────── */
  function showSuccess(containerId, message) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
  }

  /* ============================================================
     LOGIN FORM
     ============================================================ */
  loginFormEl.addEventListener('submit', function (e) {
    e.preventDefault();

    var email    = document.getElementById('loginEmail');
    var password = document.getElementById('loginPassword');
    var isValid  = true;

    if (!validateEmail(email, 'loginEmailError'))          isValid = false;
    if (!validateRequired(password, 'loginPasswordError', 'Password')) isValid = false;

    if (!isValid) return;

    /* Simulate submit — replace with real Django form submission later */
    setLoading(loginBtn, true);

    setTimeout(function () {
      setLoading(loginBtn, false);
      showSuccess('loginSuccess', 'Logged in successfully! Redirecting…');
      /* In production: loginFormEl.submit(); */
    }, 1400);
  });

  /* Inline validation on blur for login fields */
  document.getElementById('loginEmail').addEventListener('blur', function () {
    validateEmail(this, 'loginEmailError');
  });

  document.getElementById('loginPassword').addEventListener('blur', function () {
    validateRequired(this, 'loginPasswordError', 'Password');
  });

  /* ============================================================
     REGISTER FORM
     ============================================================ */

  /* ── Password strength ──────────────────────────────────────
     Returns an object { score: 0-4, reqs: { length, upper, number, special } }
  ─────────────────────────────────────────────────────────────── */
  function checkPasswordStrength(value) {
    var reqs = {
      length:  value.length >= 8,
      upper:   /[A-Z]/.test(value),
      number:  /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };
    var score = Object.values(reqs).filter(Boolean).length;
    return { score: score, reqs: reqs };
  }

  function resetStrengthUI() {
    var bars         = document.querySelectorAll('#regPasswordStrength .strength-bar');
    var strengthEl   = document.getElementById('regPasswordStrength');
    var strengthLabel = document.getElementById('strengthLabel');
    var reqsEl       = document.getElementById('pwRequirements');

    bars.forEach(function (b) {
      b.className = 'strength-bar';
    });
    if (strengthLabel) {
      strengthLabel.textContent = '';
      strengthLabel.className   = 'strength-label';
    }
    if (strengthEl)  strengthEl.classList.remove('is-visible');
    if (reqsEl)      reqsEl.classList.remove('is-visible');
  }

  function updateStrengthUI(value) {
    var result       = checkPasswordStrength(value);
    var bars         = document.querySelectorAll('#regPasswordStrength .strength-bar');
    var strengthEl   = document.getElementById('regPasswordStrength');
    var strengthLabel = document.getElementById('strengthLabel');
    var reqsEl       = document.getElementById('pwRequirements');

    // Show containers
    if (value.length > 0) {
      strengthEl.classList.add('is-visible');
      reqsEl.classList.add('is-visible');
    } else {
      strengthEl.classList.remove('is-visible');
      reqsEl.classList.remove('is-visible');
      return;
    }

    // Map score → label & CSS class
    var levelMap = [
      null,
      { label: 'Too weak', cls: 'weak',   fill: 'filled-weak'   },
      { label: 'Weak',     cls: 'weak',   fill: 'filled-weak'   },
      { label: 'Medium',   cls: 'medium', fill: 'filled-medium' },
      { label: 'Strong',   cls: 'strong', fill: 'filled-strong' }
    ];

    var level = levelMap[result.score] || levelMap[1];

    // Color bars
    bars.forEach(function (bar, i) {
      bar.className = 'strength-bar' + (i < result.score ? ' ' + level.fill : '');
    });

    // Label
    strengthLabel.textContent = level.label;
    strengthLabel.className   = 'strength-label ' + level.cls;

    // Individual requirements
    document.querySelectorAll('.req-item').forEach(function (item) {
      var key = item.getAttribute('data-req');
      if (result.reqs[key]) {
        item.classList.add('is-met');
      } else {
        item.classList.remove('is-met');
      }
    });
  }

  /* Live strength update */
  var regPasswordInput = document.getElementById('regPassword');
  regPasswordInput.addEventListener('input', function () {
    updateStrengthUI(this.value);
    /* Clear password error as user types */
    if (this.value) clearError(this, 'regPasswordError');
  });

  /* ── Register form submit ───────────────────────────────── */
  registerFormEl.addEventListener('submit', function (e) {
    e.preventDefault();

    var name     = document.getElementById('regName');
    var email    = document.getElementById('regEmail');
    var password = document.getElementById('regPassword');
    var confirm  = document.getElementById('regConfirmPassword');
    var isValid  = true;

    /* Required: Full Name */
    if (!validateRequired(name, 'regNameError', 'Full name')) isValid = false;

    /* Email */
    if (!validateEmail(email, 'regEmailError')) isValid = false;

    /* Password — must meet all requirements */
    if (!password.value.trim()) {
      setError(password, 'regPasswordError', 'Password is required.');
      isValid = false;
    } else {
      var strength = checkPasswordStrength(password.value);
      if (!strength.reqs.length) {
        setError(password, 'regPasswordError', 'Password must be at least 8 characters.');
        isValid = false;
      } else if (!strength.reqs.upper) {
        setError(password, 'regPasswordError', 'Add at least one uppercase letter.');
        isValid = false;
      } else if (!strength.reqs.number) {
        setError(password, 'regPasswordError', 'Add at least one number.');
        isValid = false;
      } else if (!strength.reqs.special) {
        setError(password, 'regPasswordError', 'Add at least one special character.');
        isValid = false;
      } else {
        clearError(password, 'regPasswordError');
      }
    }

    /* Confirm password */
    if (!confirm.value.trim()) {
      setError(confirm, 'regConfirmError', 'Please confirm your password.');
      isValid = false;
    } else if (confirm.value !== password.value) {
      setError(confirm, 'regConfirmError', 'Passwords do not match.');
      isValid = false;
    } else {
      clearError(confirm, 'regConfirmError');
    }

    if (!isValid) return;

    /* Simulate submit */
    setLoading(registerBtn, true);

    setTimeout(function () {
      setLoading(registerBtn, false);
      showSuccess('registerSuccess', 'Account created! Check your email to verify.');
      /* In production: registerFormEl.submit(); */
    }, 1600);
  });

  /* Inline validation on blur for register fields */
  document.getElementById('regName').addEventListener('blur', function () {
    validateRequired(this, 'regNameError', 'Full name');
  });

  document.getElementById('regEmail').addEventListener('blur', function () {
    validateEmail(this, 'regEmailError');
  });

  document.getElementById('regPassword').addEventListener('blur', function () {
    if (!this.value.trim()) {
      setError(this, 'regPasswordError', 'Password is required.');
    } else {
      clearError(this, 'regPasswordError');
    }
  });

  document.getElementById('regConfirmPassword').addEventListener('blur', function () {
    var password = document.getElementById('regPassword');
    if (!this.value.trim()) {
      setError(this, 'regConfirmError', 'Please confirm your password.');
    } else if (this.value !== password.value) {
      setError(this, 'regConfirmError', 'Passwords do not match.');
    } else {
      clearError(this, 'regConfirmError');
    }
  });

})();
