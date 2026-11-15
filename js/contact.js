/* ==========================================================================
   contact.js — the Contact page
   Validates four fields before the form is allowed to "send".
   Three rules, straight from the brief:
     · no field may be empty
     · the e-mail must be a valid format
     · the phone number may contain digits only
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Element references
   -------------------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

/* --------------------------------------------------------------------------
   2. Patterns
   A regular expression (regex) is a pattern tested against a string.
   -------------------------------------------------------------------------- */

// Something@something.something — deliberately simple, not RFC-complete.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ^ and $ anchor the pattern: the WHOLE string must be digits.
// Without them, "abc123" would pass because it contains digits.
const DIGITS_ONLY = /^\d+$/;

/* --------------------------------------------------------------------------
   3. Small helpers
   -------------------------------------------------------------------------- */

// Show a message under one field and mark the field itself.
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorBox = document.getElementById(fieldId + 'Error');

  errorBox.textContent = message;

  if (input) {
    input.closest('.field').classList.toggle('has-error', message !== '');
  }
}

// Clear every message and every red border.
function clearErrors() {
  ['name', 'email', 'phone', 'message'].forEach(function (fieldId) {
    setError(fieldId, '');
  });
  formStatus.className = 'form-status';
  formStatus.textContent = '';
}

/* --------------------------------------------------------------------------
   4. Validation
   Returns true only if all three rules pass for all four fields.
   -------------------------------------------------------------------------- */
function validateForm() {
  let valid = true;

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();

  // --- rule 1: nothing empty ---------------------------------------------
  if (name === '') {
    setError('name', 'Please enter your name.');
    valid = false;
  }

  if (email === '') {
    setError('email', 'Please enter your e-mail address.');
    valid = false;
  }

  if (phone === '') {
    setError('phone', 'Please enter your phone number.');
    valid = false;
  }

  if (message === '') {
    setError('message', 'Please enter a message.');
    valid = false;
  }

  // --- rule 2: e-mail format ---------------------------------------------
  // Only checked when something was typed, so an empty box is not told twice.
  if (email !== '' && !EMAIL_PATTERN.test(email)) {
    setError('email', 'That does not look like a valid e-mail address.');
    valid = false;
  }

  // --- rule 3: digits only -----------------------------------------------
  if (phone !== '' && !DIGITS_ONLY.test(phone)) {
    setError('phone', 'Phone number may contain digits only.');
    valid = false;
  }

  // A second, friendlier check: Nigerian numbers are 11 digits.
  if (phone !== '' && DIGITS_ONLY.test(phone) && phone.length !== 11) {
    setError('phone', 'Phone number should be 11 digits.');
    valid = false;
  }

  return valid;
}

/* --------------------------------------------------------------------------
   5. The submit handler
   -------------------------------------------------------------------------- */
contactForm.addEventListener('submit', function (event) {
  event.preventDefault();   // stop the normal page-reload submission
  clearErrors();

  if (!validateForm()) {
    // Tell the user overall, then move the cursor to the first bad field.
    formStatus.className = 'form-status is-visible is-bad';
    formStatus.textContent = 'Please fix the highlighted fields and try again.';

    const firstError = contactForm.querySelector('.field.has-error input, .field.has-error textarea');
    if (firstError) {
      firstError.focus();
    }

    return;
  }

  // Valid. There is no server in this project, so success is simulated here.
  formStatus.className = 'form-status is-visible is-ok';
  formStatus.textContent = 'Thank you, ' + document.getElementById('name').value.trim() + '. Your message has been checked and would be sent now.';

  contactForm.reset();
});

/* Clearing a message as soon as the user starts fixing that field stops the
   red text hanging around after the problem has been solved. */
contactForm.addEventListener('input', function (event) {
  const field = event.target.closest('.field');

  if (!field || !field.classList.contains('has-error')) {
    return;
  }

  field.classList.remove('has-error');
  const errorBox = field.querySelector('.error-msg');

  if (errorBox) {
    errorBox.textContent = '';
  }
});
