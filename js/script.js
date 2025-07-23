/* ============================== typing animation ============================ */
var typed = new Typed(".typing",{
    strings:["","Web Designer","Web Developer"],
    typeSpeed:100,
    BackSpeed:60,
    loop:true
})

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('navbar-hamburger');
    const navLinks = document.getElementById('navbar-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            // Hamburger animation (optional)
            hamburger.classList.toggle('active');
        });
        // Close menu when a link is clicked (mobile UX)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }
    // Accessibility: close menu on outside click (mobile)
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });
});
<script>
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async function (e) {
    e.preventDefault(); // Stop default form redirect

    const formData = new FormData(form);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      });

      alert("✅ Thank you for your message! I will get back to you shortly.");
      form.reset();
    } catch (error) {
      alert("❌ Oops! Something went wrong. Please try again.");
      console.error("Form error:", error);
    }
  });
</script>
