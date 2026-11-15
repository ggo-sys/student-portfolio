/* ==========================================================================
  main.js, shared behaviour for every page
  Two small jobs: the mobile menu button, and the current year in the footer.
  Kept separate from planner.js and contact.js so each file explains one idea.
  ========================================================================== */

/* --------------------------------------------------------------------------
  1. Mobile navigation
  On a narrow screen the links are hidden by CSS (.nav-links is display:none
  under 760px). This function toggles the class that shows them again.
  -------------------------------------------------------------------------- */
function setupNavigation() {
 // Find the two elements we need. If either is missing, stop quietly.
 const toggle = document.getElementById('navToggle');
 const links = document.getElementById('navLinks');

 if (!toggle || !links) {
  return;
 }

 // Clicking the button flips the menu open or closed.
 toggle.addEventListener('click', function () {
  const isOpen = links.classList.toggle('is-open');

  // aria-expanded tells a screen reader whether the menu is open.
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
 });

 // After the user picks a link, close the menu so the target page is visible.
 links.addEventListener('click', function (event) {
  if (event.target.tagName === 'A') {
   links.classList.remove('is-open');
   toggle.setAttribute('aria-expanded', 'false');
  }
 });
}

/* --------------------------------------------------------------------------
  2. Footer year
  Avoids a hard-coded year going stale in the footer of five pages.
  -------------------------------------------------------------------------- */
function setFooterYear() {
 const year = document.getElementById('year');

 if (year) {
  year.textContent = new Date().getFullYear();
 }
}

/* --------------------------------------------------------------------------
  3. Start
  DOMContentLoaded fires once the HTML has been parsed, so the elements above
  definitely exist by the time we look for them.
  -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
 setupNavigation();
 setFooterYear();
});
