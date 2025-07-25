document.addEventListener('DOMContentLoaded', function () {
  // ========== Hamburger Menu ==========
  const hamburger = document.getElementById('navbar-hamburger');
  const navLinks = document.getElementById('navbar-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });

  // ========== Netlify Contact Form Submission ==========
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);

      fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        alert("✅ Thank you! Your message has been sent.");
        form.reset();
      })
      .catch((error) => {
        alert("❌ Something went wrong. Please try again.");
        console.error("Form error:", error);
      });
    });
  }
});
