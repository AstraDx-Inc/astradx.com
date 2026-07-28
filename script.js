/* AstraDx — progressive enhancement only. The site is fully readable without it. */
(function () {
  'use strict';

  var reveals = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');

  // No IntersectionObserver (or reduced motion) — just show everything.
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-visible');
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  reveals.forEach(function (el) { observer.observe(el); });

  // Close any other open role when one is expanded, so the list stays scannable.
  var roles = document.querySelectorAll('.role');
  roles.forEach(function (role) {
    role.addEventListener('toggle', function () {
      if (!role.open) return;
      roles.forEach(function (other) { if (other !== role) other.open = false; });
    });
  });
})();
