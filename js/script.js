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
